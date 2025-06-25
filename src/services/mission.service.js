const Mission = require('../models/mission.model');
const Drone = require('../models/drone.model');

exports.scheduleMission = async (data) => {
  // Check if drone exists
  const drone = await Drone.findById(data.drone_id);
  if (!drone) {
    throw new Error('Drone not found');
  }

  // Check for conflicts
  const conflict = await this.findConflict(data.drone_id, data.start_time, data.end_time);
  if (conflict) {
    throw new Error('Mission conflict detected');
  }

  const mission = new Mission(data);
  return await mission.save();
};

exports.findConflict = async (drone_id, start_time, end_time) => {
  return await Mission.findOne({
    drone_id,
    status: { $in: ['scheduled', 'in-progress'] },
    start_time: { $lt: end_time },
    end_time: { $gt: start_time }
  });
};

exports.getAllMissions = async (filters = {}) => {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.mission_type) query.mission_type = filters.mission_type;
  if (filters.priority) query.priority = filters.priority;
  
  return await Mission.find(query)
    .populate('drone_id', 'name model status')
    .sort({ start_time: 1 });
};

exports.getMissionsForDrone = async (drone_id) => {
  return await Mission.find({ drone_id })
    .populate('drone_id', 'name model status')
    .sort({ start_time: 1 });
};

exports.getMissionById = async (id) => {
  return await Mission.findById(id).populate('drone_id', 'name model status');
};

exports.updateMission = async (id, data) => {
  // If updating time, check for conflicts
  if (data.start_time || data.end_time) {
    const mission = await Mission.findById(id);
    if (!mission) throw new Error('Mission not found');
    
    const start_time = data.start_time || mission.start_time;
    const end_time = data.end_time || mission.end_time;
    
    const conflict = await this.findConflict(mission.drone_id, start_time, end_time);
    if (conflict && conflict._id.toString() !== id) {
      throw new Error('Mission conflict detected');
    }
  }
  
  return await Mission.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('drone_id', 'name model status');
};

exports.deleteMission = async (id) => {
  return await Mission.findByIdAndDelete(id);
};

exports.getUpcomingMissions = async (hours = 24) => {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return await Mission.find({
    start_time: { $gte: now, $lte: future },
    status: 'scheduled'
  }).populate('drone_id', 'name model status');
};

exports.getActiveMissions = async () => {
  const now = new Date();
  
  return await Mission.find({
    start_time: { $lte: now },
    end_time: { $gte: now },
    status: { $in: ['scheduled', 'in-progress'] }
  }).populate('drone_id', 'name model status');
};

exports.startMission = async (id) => {
  const mission = await Mission.findById(id);
  if (!mission) throw new Error('Mission not found');
  
  if (mission.status !== 'scheduled') {
    throw new Error('Mission is not in scheduled status');
  }
  
  const now = new Date();
  if (mission.start_time > now) {
    throw new Error('Mission start time has not been reached');
  }
  
  return await Mission.findByIdAndUpdate(id, { status: 'in-progress' }, { new: true });
};

exports.completeMission = async (id) => {
  return await Mission.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
}; 