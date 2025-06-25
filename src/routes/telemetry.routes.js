const express = require("express");
const router = express.Router();
const {
  ingestTelemetry,
  getTelemetryForDrone,
  getLatestTelemetry,
  getTelemetryByTimeRange,
  getTelemetryStats
} = require("../controllers/telemetry.controller");
const { validateTelemetry } = require("../middleware/validation");

/**
 * @swagger
 * tags:
 *   name: Telemetry
 *   description: Telemetry ingestion and retrieval
 */

/**
 * @swagger
 * /api/telemetry:
 *   post:
 *     summary: Ingest telemetry data from a drone
 *     tags: [Telemetry]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drone_id:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               battery:
 *                 type: number
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Telemetry ingested
 */

router.post("/", validateTelemetry, ingestTelemetry);

/**
 * @swagger
 * /api/telemetry/drone/{id}:
 *   get:
 *     summary: Get all telemetry for a drone
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of telemetry records
 */

router.get("/drone/:id", getTelemetryForDrone);

/**
 * @swagger
 * /api/telemetry/drone/{id}/latest:
 *   get:
 *     summary: Get the latest telemetry for a drone
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest telemetry record
 */
router.get("/drone/:id/latest", getLatestTelemetry);

/**
 * @swagger
 * /api/telemetry/drone/{id}/range:
 *   get:
 *     summary: Get telemetry for a drone within a time range
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_time
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_time
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of telemetry records in the range
 */
router.get("/drone/:id/range", getTelemetryByTimeRange);

/**
 * @swagger
 * /api/telemetry/drone/{id}/stats:
 *   get:
 *     summary: Get telemetry statistics for a drone
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Telemetry statistics
 */
router.get("/drone/:id/stats", getTelemetryStats);

module.exports = router; 