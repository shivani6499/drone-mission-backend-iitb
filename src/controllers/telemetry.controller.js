const telemetryService = require('../services/telemetry.service');

exports.ingestTelemetry = async (req, res, next) => {
  try {
    const telemetry = await telemetryService.ingestTelemetry(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Telemetry ingested successfully',
      data: telemetry 
    });
  } catch (err) {
    if (err.message === 'Drone not found') {
      return res.status(404).json({ 
        success: false, 
        error: 'Drone not found' 
      });
    }
    next(err);
  }
};

exports.getTelemetryForDrone = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const telemetry = await telemetryService.getTelemetryForDrone(req.params.id, parseInt(limit));
    res.json({ 
      success: true, 
      count: telemetry.length,
      data: telemetry 
    });
  } catch (err) {
    next(err);
  }
};

exports.getLatestTelemetry = async (req, res, next) => {
  try {
    const telemetry = await telemetryService.getLatestTelemetry(req.params.id);
    if (!telemetry) {
      return res.status(404).json({ 
        success: false, 
        error: 'No telemetry data found for this drone' 
      });
    }
    res.json({ success: true, data: telemetry });
  } catch (err) {
    next(err);
  }
};

exports.getTelemetryByTimeRange = async (req, res, next) => {
  try {
    const { start_time, end_time } = req.query;
    
    if (!start_time || !end_time) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start time and end time are required' 
      });
    }
    
    const telemetry = await telemetryService.getTelemetryByTimeRange(
      req.params.id, 
      new Date(start_time), 
      new Date(end_time)
    );
    
    res.json({ 
      success: true, 
      count: telemetry.length,
      data: telemetry 
    });
  } catch (err) {
    next(err);
  }
};

exports.getTelemetryStats = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;
    const stats = await telemetryService.getTelemetryStats(req.params.id, parseInt(hours));
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (err) {
    next(err);
  }
};
