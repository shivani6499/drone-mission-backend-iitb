const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema({
  drone_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Drone", 
    required: [true, 'Drone ID is required'] 
  },
  name: {
    type: String,
    required: [true, 'Mission name is required'],
    trim: true,
    maxlength: [200, 'Mission name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mission description cannot exceed 1000 characters']
  },
  start_time: { 
    type: Date, 
    required: [true, 'Start time is required']
  },
  end_time: { 
    type: Date, 
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.start_time;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  mission_type: {
    type: String,
    enum: ['surveillance', 'delivery', 'mapping', 'inspection', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  coordinates: {
    start: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    end: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
missionSchema.index({ drone_id: 1, start_time: 1, end_time: 1 });
missionSchema.virtual('duration').get(function() {
  if (this.start_time && this.end_time) {
    return Math.ceil((this.end_time - this.start_time) / (1000 * 60)); 
  }
  return 0;
});
missionSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    const Drone = require('./drone.model');
    const statusMap = {
      'scheduled': 'idle',
      'in-progress': 'in-mission',
      'completed': 'idle',
      'cancelled': 'idle'
    };
    
    if (statusMap[this.status]) {
      await Drone.findByIdAndUpdate(this.drone_id, { status: statusMap[this.status] });
    }
  }
  next();
});

module.exports = mongoose.model("Mission", missionSchema);
