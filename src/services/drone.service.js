const Drone = require('../models/drone.model');

exports.createDrone = async (data) => {
  const drone = new Drone(data);
  return await drone.save();
};

exports.getAllDrones = async () => {
  return await Drone.find().populate('active_missions');
};

exports.getDroneById = async (id) => {
  return await Drone.findById(id).populate('active_missions');
};

exports.updateDrone = async (id, data) => {
  return await Drone.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteDrone = async (id) => {
  return await Drone.findByIdAndDelete(id);
};

exports.getDronesByStatus = async (status) => {
  return await Drone.find({ status }).populate('active_missions');
};

exports.updateDroneStatus = async (id, status) => {
  return await Drone.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};

exports.getDronesWithLowBattery = async (threshold = 20) => {
  return await Drone.find({ battery_level: { $lte: threshold } });
};

exports.getAvailableDrones = async () => {
  return await Drone.find({ 
    status: 'idle',
    battery_level: { $gt: 20 } // Only drones with sufficient battery
  });
}; 