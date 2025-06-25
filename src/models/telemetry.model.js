const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema({
  drone_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Drone", 
    required: [true, 'Drone ID is required'] 
  },
  latitude: { 
    type: Number, 
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: { 
    type: Number, 
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  altitude: {
    type: Number,
    min: [0, 'Altitude cannot be negative'],
    default: 0
  },
  battery: { 
    type: Number, 
    required: [true, 'Battery level is required'],
    min: [0, 'Battery level cannot be negative'],
    max: [100, 'Battery level cannot exceed 100%']
  },
  speed: {
    type: Number,
    min: [0, 'Speed cannot be negative'],
    default: 0
  },
  heading: {
    type: Number,
    min: [0, 'Heading must be between 0 and 360'],
    max: [360, 'Heading must be between 0 and 360'],
    default: 0
  },
  signal_strength: {
    type: Number,
    min: [0, 'Signal strength cannot be negative'],
    max: [100, 'Signal strength cannot exceed 100%'],
    default: 100
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  mission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mission",
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
telemetrySchema.index({ drone_id: 1, timestamp: -1 });
telemetrySchema.index({ timestamp: -1 });

// Virtual for location as GeoJSON point
telemetrySchema.virtual('location').get(function() {
  return {
    type: 'Point',
    coordinates: [this.longitude, this.latitude]
  };
});

// Pre-save middleware to update drone's current location and battery
telemetrySchema.pre('save', async function(next) {
  const Drone = require('./drone.model');
  await Drone.findByIdAndUpdate(this.drone_id, {
    current_location: {
      latitude: this.latitude,
      longitude: this.longitude
    },
    battery_level: this.battery
  });
  next();
});

module.exports = mongoose.model("Telemetry", telemetrySchema);
