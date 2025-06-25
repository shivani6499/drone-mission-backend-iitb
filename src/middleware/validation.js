const Joi = require('joi');
const droneSchema = Joi.object({
  name: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Drone name is required',
    'string.max': 'Drone name cannot exceed 100 characters'
  }),
  model: Joi.string().required().trim().messages({
    'string.empty': 'Drone model is required'
  }),
  status: Joi.string().valid('idle', 'in-mission', 'maintenance', 'offline').default('idle'),
  battery_level: Joi.number().min(0).max(100).default(100),
  max_flight_time: Joi.number().min(0).default(30)
});

const missionSchema = Joi.object({
  drone_id: Joi.string().required().messages({
    'string.empty': 'Drone ID is required'
  }),
  name: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Mission name is required',
    'string.max': 'Mission name cannot exceed 200 characters'
  }),
  description: Joi.string().trim().max(1000).optional(),
  start_time: Joi.date().greater('now').required().messages({
    'date.greater': 'Start time must be in the future',
    'any.required': 'Start time is required'
  }),
  end_time: Joi.date().greater(Joi.ref('start_time')).required().messages({
    'date.greater': 'End time must be after start time',
    'any.required': 'End time is required'
  }),
  mission_type: Joi.string().valid('surveillance', 'delivery', 'mapping', 'inspection', 'other').default('other'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  coordinates: Joi.object({
    start: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    end: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required()
  }).required()
});

const telemetrySchema = Joi.object({
  drone_id: Joi.string().required().messages({
    'string.empty': 'Drone ID is required'
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required'
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required'
  }),
  altitude: Joi.number().min(0).default(0),
  battery: Joi.number().min(0).max(100).required().messages({
    'number.min': 'Battery level cannot be negative',
    'number.max': 'Battery level cannot exceed 100%',
    'any.required': 'Battery level is required'
  }),
  speed: Joi.number().min(0).default(0),
  heading: Joi.number().min(0).max(360).default(0),
  signal_strength: Joi.number().min(0).max(100).default(100),
  timestamp: Joi.date().default(Date.now),
  mission_id: Joi.string().optional()
});

const droneUpdateSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.max': 'Drone name cannot exceed 100 characters'
  }),
  model: Joi.string().trim(),
  status: Joi.string().valid('idle', 'in-mission', 'maintenance', 'offline'),
  battery_level: Joi.number().min(0).max(100),
  max_flight_time: Joi.number().min(0)
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errorMessage
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validateDrone: validate(droneSchema),
  validateUpdateDrone: validate(droneUpdateSchema),
  validateMission: validate(missionSchema),
  validateTelemetry: validate(telemetrySchema)
}; 