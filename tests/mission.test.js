const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/app');
const Drone = require('../src/models/drone.model');
const Mission = require('../src/models/mission.model');

describe('Mission API', () => {
  let testDroneId;
  let testMissionId;

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    const drone = await Drone.create({
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      status: 'idle'
    });
    testDroneId = drone._id;
  });

  describe('POST /api/missions', () => {
    it('should schedule a new mission with valid data', async () => {
      const missionData = {
        drone_id: testDroneId.toString(),
        name: 'Test Mission',
        description: 'A test mission for validation',
        start_time: new Date(Date.now() + 1000 * 60 * 60), 
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
        mission_type: 'surveillance',
        priority: 'medium',
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 }, 
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      };

      const response = await request(app)
        .post('/api/missions')
        .send(missionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(missionData.name);
      expect(response.body.data.drone_id).toBe(testDroneId.toString());
      expect(response.body.data.status).toBe('scheduled');
      
      testMissionId = response.body.data._id;
    });

    it('should return 409 for conflicting missions', async () => {
      const firstMission = {
        drone_id: testDroneId.toString(),
        name: 'First Mission',
        start_time: new Date(Date.now() + 1000 * 60 * 60), 
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 },
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      };

      await request(app)
        .post('/api/missions')
        .send(firstMission)
        .expect(201);
      const conflictingMission = {
        drone_id: testDroneId.toString(),
        name: 'Conflicting Mission',
        start_time: new Date(Date.now() + 1000 * 60 * 60 * 2), 
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 4), 
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 },
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      };

      const response = await request(app)
        .post('/api/missions')
        .send(conflictingMission)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Conflict: Drone already has a mission in that time range.');
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeDroneId = new mongoose.Types.ObjectId();
      const missionData = {
        drone_id: fakeDroneId.toString(),
        name: 'Test Mission',
        start_time: new Date(Date.now() + 1000 * 60 * 60),
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 },
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      };

      const response = await request(app)
        .post('/api/missions')
        .send(missionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Drone not found');
    });

    it('should return 400 for invalid mission data', async () => {
      const invalidData = {
        drone_id: testDroneId.toString(),
        name: '',
        start_time: new Date(Date.now() + 1000 * 60 * 60),
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 2)
      };

      const response = await request(app)
        .post('/api/missions')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /api/missions', () => {
    beforeEach(async () => {
      await Mission.create([
        {
          drone_id: testDroneId,
          name: 'Mission 1',
          start_time: new Date(Date.now() + 1000 * 60 * 60),
          end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
          status: 'scheduled',
          mission_type: 'surveillance',
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        },
        {
          drone_id: testDroneId,
          name: 'Mission 2',
          start_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
          end_time: new Date(Date.now() + 1000 * 60 * 60 * 4),
          status: 'scheduled',
          mission_type: 'delivery',
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        }
      ]);
    });

    it('should return all missions', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter missions by status', async () => {
      const response = await request(app)
        .get('/api/missions?status=scheduled')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(mission => mission.status === 'scheduled')).toBe(true);
    });

    it('should filter missions by mission type', async () => {
      const response = await request(app)
        .get('/api/missions?mission_type=surveillance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].mission_type).toBe('surveillance');
    });
  });

  describe('GET /api/drones/:id/missions', () => {
    beforeEach(async () => {
      await Mission.create([
        {
          drone_id: testDroneId,
          name: 'Drone Mission 1',
          start_time: new Date(Date.now() + 1000 * 60 * 60),
          end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        },
        {
          drone_id: testDroneId,
          name: 'Drone Mission 2',
          start_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
          end_time: new Date(Date.now() + 1000 * 60 * 60 * 4),
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        }
      ]);
    });

    it('should return missions for a specific drone', async () => {
      const response = await request(app)
        .get(`/api/drones/${testDroneId}/missions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(mission => mission.drone_id._id.toString() === testDroneId.toString())).toBe(true);
    });

    it('should return empty array for drone with no missions', async () => {
      const newDrone = await Drone.create({
        name: 'New Drone',
        model: 'DJI Mavic Air',
        status: 'idle'
      });

      const response = await request(app)
        .get(`/api/drones/${newDrone._id}/missions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/missions/active', () => {
    beforeEach(async () => {
      await Mission.create([
        {
          drone_id: testDroneId,
          name: 'Active Mission',
          start_time: new Date(Date.now() - 1000 * 60 * 30), 
          end_time: new Date(Date.now() + 1000 * 60 * 30), 
          status: 'in-progress',
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        },
        {
          drone_id: testDroneId,
          name: 'Future Mission',
          start_time: new Date(Date.now() + 1000 * 60 * 60), 
          end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
          status: 'scheduled',
          coordinates: {
            start: { latitude: 19.0760, longitude: 72.8777 },
            end: { latitude: 19.0760, longitude: 72.8777 }
          }
        }
      ]);
    });

    it('should return only active missions', async () => {
      const response = await request(app)
        .get('/api/missions/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Active Mission');
    });
  });

  describe('PATCH /api/missions/:id/start', () => {
    beforeEach(async () => {
      const mission = await Mission.create({
        drone_id: testDroneId,
        name: 'Test Mission',
        start_time: new Date(Date.now() - 1000 * 60 * 30),
        end_time: new Date(Date.now() + 1000 * 60 * 30),
        status: 'scheduled',
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 },
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      });
      testMissionId = mission._id;
    });

    it('should start a scheduled mission', async () => {
      const response = await request(app)
        .patch(`/api/missions/${testMissionId}/start`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in-progress');
    });

    it('should return 400 for mission that has not reached start time', async () => {
      const futureMission = await Mission.create({
        drone_id: testDroneId,
        name: 'Future Mission',
        start_time: new Date(Date.now() + 1000 * 60 * 60), 
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
        status: 'scheduled',
        coordinates: {
          start: { latitude: 19.0760, longitude: 72.8777 },
          end: { latitude: 19.0760, longitude: 72.8777 }
        }
      });

      const response = await request(app)
        .patch(`/api/missions/${futureMission._id}/start`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Mission start time has not been reached');
    });
  });
}); 