const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Drone name is required'],
    trim: true,
    maxlength: [100, 'Drone name cannot exceed 100 characters']
  },
  model: { 
    type: String, 
    required: [true, 'Drone model is required'],
    trim: true
  },
  status: { 
    type: String, 
    enum: ['idle', 'in-mission', 'maintenance', 'offline'],
    default: "idle" 
  },
  battery_level: {
    type: Number,
    min: [0, 'Battery level cannot be negative'],
    max: [100, 'Battery level cannot exceed 100%'],
    default: 100
  },
  max_flight_time: {
    type: Number,
    min: [0, 'Max flight time cannot be negative'],
    default: 30 
  },
  current_location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
droneSchema.virtual('active_missions', {
  ref: 'Mission',
  localField: '_id',
  foreignField: 'drone_id',
  match: { 
    start_time: { $lte: new Date() }, 
    end_time: { $gte: new Date() } 
  }
});

module.exports = mongoose.model("Drone", droneSchema);
