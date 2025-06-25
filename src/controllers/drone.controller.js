const droneService = require('../services/drone.service');

exports.createDrone = async (req, res, next) => {
  try {
    const drone = await droneService.createDrone(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Drone created successfully',
      data: drone 
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllDrones = async (req, res, next) => {
  try {
    const { status } = req.query;
    let drones;
    
    if (status) {
      drones = await droneService.getDronesByStatus(status);
    } else {
      drones = await droneService.getAllDrones();
    }
    
    res.json({ 
      success: true, 
      count: drones.length,
      data: drones 
    });
  } catch (err) {
    next(err);
  }
};

exports.getDroneById = async (req, res, next) => {
  try {
    const drone = await droneService.getDroneById(req.params.id);
    if (!drone) {
      return res.status(404).json({ 
        success: false, 
        error: 'Drone not found' 
      });
    }
    res.json({ success: true, data: drone });
  } catch (err) {
    next(err);
  }
};

exports.updateDrone = async (req, res, next) => {
  try {
    const drone = await droneService.updateDrone(req.params.id, req.body);
    if (!drone) {
      return res.status(404).json({ 
        success: false, 
        error: 'Drone not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Drone updated successfully',
      data: drone 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteDrone = async (req, res, next) => {
  try {
    const drone = await droneService.deleteDrone(req.params.id);
    if (!drone) {
      return res.status(404).json({ 
        success: false, 
        error: 'Drone not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Drone deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
};

exports.getAvailableDrones = async (req, res, next) => {
  try {
    const drones = await droneService.getAvailableDrones();
    res.json({ 
      success: true, 
      count: drones.length,
      data: drones 
    });
  } catch (err) {
    next(err);
  }
};

exports.getDronesWithLowBattery = async (req, res, next) => {
  try {
    const { threshold = 20 } = req.query;
    const drones = await droneService.getDronesWithLowBattery(parseInt(threshold));
    res.json({ 
      success: true, 
      count: drones.length,
      data: drones 
    });
  } catch (err) {
    next(err);
  }
};
