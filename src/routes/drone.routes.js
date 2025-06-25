const express = require("express");
const router = express.Router();
const {
  createDrone,
  getAllDrones,
  getDroneById,
  updateDrone,
  deleteDrone,
  getAvailableDrones,
  getDronesWithLowBattery
} = require("../controllers/drone.controller");
const {
  getMissionsForDrone
} = require("../controllers/mission.controller");
const { validateDrone, validateUpdateDrone } = require("../middleware/validation");

/**
 * @swagger
 * tags:
 *   name: Drones
 *   description: Drone management
 */

/**
 * @swagger
 * /api/drones:
 *   get:
 *     summary: Get all drones
 *     tags: [Drones]
 *     responses:
 *       200:
 *         description: List of all drones
 *   post:
 *     summary: Register a new drone
 *     tags: [Drones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Drone created
 */

/**
 * @swagger
 * /api/drones/{id}:
 *   get:
 *     summary: Get drone by ID
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Drone details
 *       404:
 *         description: Drone not found
 *   put:
 *     summary: Update a drone
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               status:
 *                 type: string
 *               battery_level:
 *                 type: number
 *               max_flight_time:
 *                 type: number
 *     responses:
 *       200:
 *         description: Drone updated
 *       404:
 *         description: Drone not found
 *   delete:
 *     summary: Delete a drone
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Drone deleted
 *       404:
 *         description: Drone not found
 */

/**
 * @swagger
 * /api/drones/{id}/missions:
 *   get:
 *     summary: Get missions for a specific drone
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of missions for the drone
 */

router.post("/", validateDrone, createDrone);
router.get("/", getAllDrones);
router.get("/available", getAvailableDrones);
router.get("/low-battery", getDronesWithLowBattery);
router.get("/:id", getDroneById);
router.get("/:id/missions", getMissionsForDrone);
router.put("/:id", validateUpdateDrone, updateDrone);
router.delete("/:id", deleteDrone);

module.exports = router;
