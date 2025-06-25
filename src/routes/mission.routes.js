const express = require("express");
const router = express.Router();
const {
  scheduleMission,
  getAllMissions,
  getMissionsForDrone,
  getMissionById,
  updateMission,
  deleteMission,
  getUpcomingMissions,
  getActiveMissions,
  startMission,
  completeMission
} = require("../controllers/mission.controller");
const { validateMission } = require("../middleware/validation");

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: Mission planning and scheduling
 */

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: Get all missions
 *     tags: [Missions]
 *     responses:
 *       200:
 *         description: List of all missions
 *   post:
 *     summary: Schedule a new mission
 *     tags: [Missions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drone_id:
 *                 type: string
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               coordinates:
 *                 type: object
 *     responses:
 *       201:
 *         description: Mission scheduled
 *       409:
 *         description: Conflict (overlapping mission)
 */

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     summary: Get mission by ID
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mission details
 *       404:
 *         description: Mission not found
 *   put:
 *     summary: Update a mission
 *     tags: [Missions]
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
 *     responses:
 *       200:
 *         description: Mission updated
 *       404:
 *         description: Mission not found
 *   delete:
 *     summary: Delete a mission
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mission deleted
 *       404:
 *         description: Mission not found
 */

/**
 * @swagger
 * /api/missions/active:
 *   get:
 *     summary: Get all active missions
 *     tags: [Missions]
 *     responses:
 *       200:
 *         description: List of active missions
 */

/**
 * @swagger
 * /api/missions/upcoming:
 *   get:
 *     summary: Get upcoming missions
 *     tags: [Missions]
 *     responses:
 *       200:
 *         description: List of upcoming missions
 */

/**
 * @swagger
 * /api/missions/{id}/start:
 *   patch:
 *     summary: Start a scheduled mission
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mission started
 *       400:
 *         description: Mission not in scheduled status or not reached start time
 *       404:
 *         description: Mission not found
 */

/**
 * @swagger
 * /api/missions/{id}/complete:
 *   patch:
 *     summary: Mark a mission as complete
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mission completed
 *       404:
 *         description: Mission not found
 */

router.post("/", validateMission, scheduleMission);
router.get("/", getAllMissions);
router.get("/upcoming", getUpcomingMissions);
router.get("/active", getActiveMissions);
router.get("/drone/:id", getMissionsForDrone);
router.get("/:id", getMissionById);
router.put("/:id", validateMission, updateMission);
router.delete("/:id", deleteMission);
router.patch("/:id/start", startMission);
router.patch("/:id/complete", completeMission);

module.exports = router;
