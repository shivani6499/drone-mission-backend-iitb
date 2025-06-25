const missionService = require('../services/mission.service');

exports.scheduleMission = async (req, res, next) => {
  try {
    const mission = await missionService.scheduleMission(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Mission scheduled successfully',
      data: mission 
    });
  } catch (err) {
    if (err.message === 'Mission conflict detected') {
      return res.status(409).json({ 
        success: false, 
        error: 'Conflict: Drone already has a mission in that time range.' 
      });
    }
    if (err.message === 'Drone not found') {
      return res.status(404).json({ 
        success: false, 
        error: 'Drone not found' 
      });
    }
    next(err);
  }
};

exports.getAllMissions = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.mission_type) filters.mission_type = req.query.mission_type;
    if (req.query.priority) filters.priority = req.query.priority;
    
    const missions = await missionService.getAllMissions(filters);
    res.json({ 
      success: true, 
      count: missions.length,
      data: missions 
    });
  } catch (err) {
    next(err);
  }
};

exports.getMissionsForDrone = async (req, res, next) => {
  try {
    const missions = await missionService.getMissionsForDrone(req.params.id);
    res.json({ 
      success: true, 
      count: missions.length,
      data: missions 
    });
  } catch (err) {
    next(err);
  }
};

exports.getMissionById = async (req, res, next) => {
  try {
    const mission = await missionService.getMissionById(req.params.id);
    if (!mission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mission not found' 
      });
    }
    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};

exports.updateMission = async (req, res, next) => {
  try {
    const mission = await missionService.updateMission(req.params.id, req.body);
    if (!mission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mission not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Mission updated successfully',
      data: mission 
    });
  } catch (err) {
    if (err.message === 'Mission conflict detected') {
      return res.status(409).json({ 
        success: false, 
        error: 'Conflict: Drone already has a mission in that time range.' 
      });
    }
    next(err);
  }
};

exports.deleteMission = async (req, res, next) => {
  try {
    const mission = await missionService.deleteMission(req.params.id);
    if (!mission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mission not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Mission deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
};

exports.getUpcomingMissions = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;
    const missions = await missionService.getUpcomingMissions(parseInt(hours));
    res.json({ 
      success: true, 
      count: missions.length,
      data: missions 
    });
  } catch (err) {
    next(err);
  }
};

exports.getActiveMissions = async (req, res, next) => {
  try {
    const missions = await missionService.getActiveMissions();
    res.json({ 
      success: true, 
      count: missions.length,
      data: missions 
    });
  } catch (err) {
    next(err);
  }
};

exports.startMission = async (req, res, next) => {
  try {
    const mission = await missionService.startMission(req.params.id);
    res.json({ 
      success: true, 
      message: 'Mission started successfully',
      data: mission 
    });
  } catch (err) {
    if (err.message === 'Mission not found') {
      return res.status(404).json({ 
        success: false, 
        error: 'Mission not found' 
      });
    }
    if (err.message === 'Mission is not in scheduled status') {
      return res.status(400).json({ 
        success: false, 
        error: 'Mission is not in scheduled status' 
      });
    }
    if (err.message === 'Mission start time has not been reached') {
      return res.status(400).json({ 
        success: false, 
        error: 'Mission start time has not been reached' 
      });
    }
    next(err);
  }
};

exports.completeMission = async (req, res, next) => {
  try {
    const mission = await missionService.completeMission(req.params.id);
    res.json({ 
      success: true, 
      message: 'Mission completed successfully',
      data: mission 
    });
  } catch (err) {
    next(err);
  }
};
