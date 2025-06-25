const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require("dotenv").config();
const droneRoutes = require("./routes/drone.routes");
const missionRoutes = require("./routes/mission.routes");
const telemetryRoutes = require("./routes/telemetry.routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
global.io = io;
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join_drone', (drone_id) => {
    socket.join(`drone_${drone_id}`);
    console.log(`Client ${socket.id} joined drone ${drone_id}`);
  });
  socket.on('leave_drone', (drone_id) => {
    socket.leave(`drone_${drone_id}`);
    console.log(`Client ${socket.id} left drone ${drone_id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(helmet());
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Drone Mission Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/drones', authMiddleware, droneRoutes);
app.use('/api/missions', authMiddleware, missionRoutes);
app.use('/api/telemetry', authMiddleware, telemetryRoutes);
app.get('/ws/telemetry', (req, res) => {
  res.json({ 
    success: true, 
    message: 'WebSocket endpoint available at /socket.io/',
    instructions: 'Connect to WebSocket and emit "join_drone" with drone_id to receive telemetry updates'
  });
});
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drone Mission Planning API',
      version: '1.0.0',
      description: 'API documentation for Drone Mission Planning Backend',
    },
    servers: [
      { url: 'http://localhost:' + (process.env.PORT || 5000) }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(notFound);
app.use(errorHandler);
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("MongoDB connected successfully");
  }).catch(err => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });
}
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Performing graceful shutdown...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

module.exports = { app, server };
