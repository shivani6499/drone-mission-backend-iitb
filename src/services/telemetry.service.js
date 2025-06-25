const Telemetry = require('../models/telemetry.model');
const Drone = require('../models/drone.model');

exports.ingestTelemetry = async (data) => {
  // Check if drone exists
  const drone = await Drone.findById(data.drone_id);
  if (!drone) {
    throw new Error('Drone not found');
  }

  const telemetry = new Telemetry(data);
  const savedTelemetry = await telemetry.save();

  // Emit real-time event if socket is available
  if (global.io) {
    global.io.to(`drone_${data.drone_id}`).emit('telemetry_update', {
      drone_id: data.drone_id,
      telemetry: savedTelemetry
    });
  }

  return savedTelemetry;
};

exports.getTelemetryForDrone = async (drone_id, limit = 100) => {
  return await Telemetry.find({ drone_id })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('drone_id', 'name model');
};

exports.getLatestTelemetry = async (drone_id) => {
  return await Telemetry.findOne({ drone_id })
    .sort({ timestamp: -1 })
    .populate('drone_id', 'name model');
};

exports.getTelemetryByTimeRange = async (drone_id, start_time, end_time) => {
  return await Telemetry.find({
    drone_id,
    timestamp: { $gte: start_time, $lte: end_time }
  }).sort({ timestamp: 1 });
};

exports.getTelemetryStats = async (drone_id, hours = 24) => {
  const start_time = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const telemetry = await Telemetry.find({
    drone_id,
    timestamp: { $gte: start_time }
  }).sort({ timestamp: 1 });

  if (telemetry.length === 0) {
    return {
      avg_battery: 0,
      avg_speed: 0,
      avg_altitude: 0,
      total_distance: 0,
      data_points: 0
    };
  }

  const avg_battery = telemetry.reduce((sum, t) => sum + t.battery, 0) / telemetry.length;
  const avg_speed = telemetry.reduce((sum, t) => sum + t.speed, 0) / telemetry.length;
  const avg_altitude = telemetry.reduce((sum, t) => sum + t.altitude, 0) / telemetry.length;

  // Calculate total distance (simplified)
  let total_distance = 0;
  for (let i = 1; i < telemetry.length; i++) {
    const prev = telemetry[i - 1];
    const curr = telemetry[i];
    const distance = calculateDistance(
      prev.latitude, prev.longitude,
      curr.latitude, curr.longitude
    );
    total_distance += distance;
  }

  return {
    avg_battery: Math.round(avg_battery * 100) / 100,
    avg_speed: Math.round(avg_speed * 100) / 100,
    avg_altitude: Math.round(avg_altitude * 100) / 100,
    total_distance: Math.round(total_distance * 100) / 100,
    data_points: telemetry.length
  };
};

exports.deleteOldTelemetry = async (days = 30) => {
  const cutoff_date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await Telemetry.deleteMany({ timestamp: { $lt: cutoff_date } });
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
} 