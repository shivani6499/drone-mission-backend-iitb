const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/app');
const Drone = require('../src/models/drone.model');

describe('Drone API', () => {
  let testDroneId;

  afterAll(() => {
    server.close();
  });

  describe('POST /api/drones', () => {
    it('should create a new drone with valid data', async () => {
      const droneData = {
        name: 'Test Drone 1',
        model: 'DJI Phantom 4',
        status: 'idle',
        battery_level: 100,
        max_flight_time: 30
      };

      const response = await request(app)
        .post('/api/drones')
        .send(droneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(droneData.name);
      expect(response.body.data.model).toBe(droneData.model);
      expect(response.body.data.status).toBe(droneData.status);
      
      testDroneId = response.body.data._id;
    });

    it('should return 400 for invalid drone data', async () => {
      const invalidData = {
        name: '',
        model: 'DJI Phantom 4'
      };

      const response = await request(app)
        .post('/api/drones')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Test Drone'
      };

      const response = await request(app)
        .post('/api/drones')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/drones', () => {
    beforeEach(async () => {
      await Drone.deleteMany({});
      await Drone.create([
        { name: 'Drone 1', model: 'DJI Phantom 4', status: 'idle' },
        { name: 'Drone 2', model: 'DJI Mavic Air', status: 'in-mission' },
        { name: 'Drone 3', model: 'DJI Inspire 2', status: 'maintenance' }
      ]);
    });

    it('should return all drones', async () => {
      const response = await request(app)
        .get('/api/drones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it('should filter drones by status', async () => {
      const response = await request(app)
        .get('/api/drones?status=idle')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('idle');
    });
  });

  describe('GET /api/drones/:id', () => {
    beforeEach(async () => {
      const drone = await Drone.create({
        name: 'Test Drone',
        model: 'DJI Phantom 4',
        status: 'idle'
      });
      testDroneId = drone._id;
    });

    it('should return a specific drone by ID', async () => {
      const response = await request(app)
        .get(`/api/drones/${testDroneId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testDroneId.toString());
      expect(response.body.data.name).toBe('Test Drone');
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/drones/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Drone not found');
    });
  });

  describe('PUT /api/drones/:id', () => {
    beforeEach(async () => {
      const drone = await Drone.create({
        name: 'Test Drone',
        model: 'DJI Phantom 4',
        status: 'idle'
      });
      testDroneId = drone._id;
    });

    it('should update a drone with valid data', async () => {
      const updateData = {
        name: 'Updated Drone',
        status: 'in-mission'
      };

      const response = await request(app)
        .put(`/api/drones/${testDroneId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/drones/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/drones/:id', () => {
    beforeEach(async () => {
      const drone = await Drone.create({
        name: 'Test Drone',
        model: 'DJI Phantom 4',
        status: 'idle'
      });
      testDroneId = drone._id;
    });

    it('should delete a drone', async () => {
      const response = await request(app)
        .delete(`/api/drones/${testDroneId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone deleted successfully');
      const deletedDrone = await Drone.findById(testDroneId);
      expect(deletedDrone).toBeNull();
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/drones/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/drones/available', () => {
    beforeEach(async () => {
      await Drone.create([
        { name: 'Available Drone 1', model: 'DJI Phantom 4', status: 'idle', battery_level: 80 },
        { name: 'Available Drone 2', model: 'DJI Mavic Air', status: 'idle', battery_level: 90 },
        { name: 'Busy Drone', model: 'DJI Inspire 2', status: 'in-mission', battery_level: 60 },
        { name: 'Low Battery Drone', model: 'DJI Mini', status: 'idle', battery_level: 15 }
      ]);
    });

    it('should return only available drones', async () => {
      const response = await request(app)
        .get('/api/drones/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(drone => drone.status === 'idle')).toBe(true);
      expect(response.body.data.every(drone => drone.battery_level > 20)).toBe(true);
    });
  });
}); 