# Drone Mission Planning Backend

This project is a comprehensive backend system designed to simulate mission planning for a fleet of drones, built for an IIT Bombay assignment. It includes a robust API for managing drones, scheduling missions with conflict detection, ingesting telemetry data, and broadcasting real-time updates via WebSockets.

## Features

- **Drone Management**: Register, retrieve, update, and delete drones.
- **Mission Planning**: Schedule missions with start/end times and waypoints.
- **Conflict Detection**: Prevents a drone from being scheduled for overlapping missions.
- **Telemetry Ingestion**: Ingest telemetry data from drones (latitude, longitude, battery, etc.).
- **Real-time Telemetry**: WebSocket endpoint for real-time telemetry updates.
- **Advanced API**: Includes endpoints for filtering, pagination, and status updates.
- **Input Validation**: Robust validation for all incoming data.
- **Error Handling**: Centralized error handling for consistent responses.
- **Security**: Basic security measures like Helmet and rate limiting.
- **Testing**: Comprehensive unit tests for all major API endpoints.
- **Documentation**: Detailed API documentation and setup instructions.

## Tech Stack

- **Node.js**: JavaScript runtime for the server.
- **Express.js**: Web framework for building the API.
- **MongoDB**: NoSQL database for data persistence.
- **Mongoose**: ODM for MongoDB.
- **Socket.IO**: For real-time communication via WebSockets.
- **Joi**: For input validation.
- **Jest & Supertest**: For testing.
- **Dotenv**: For environment variable management.
- **Helmet**: For securing HTTP headers.
- **Express-rate-limit**: For rate limiting requests.

## Project Structure

The project follows a modular structure for better organization and scalability:

```
drone-mission-backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/drone-mission-backend.git
    cd drone-mission-backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Create an environment file**:

    Create a `.env` file in the root directory and copy the contents of `.env.example`.

    ```bash
    cp .env.example .env
    ```

4.  **Update environment variables**:

    Update the `MONGO_URI` and other variables in the `.env` file as needed.

5.  **Start the server**:

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Running Tests

To run the unit tests, use the following command:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## API Documentation

### Drones API

-   `POST /api/drones`: Register a new drone.
-   `GET /api/drones`: Fetch all drones (can be filtered by `status`).
-   `GET /api/drones/available`: Fetch all available drones (idle, with sufficient battery).
-   `GET /api/drones/:id`: Fetch drone details by ID.
-   `GET /api/drones/:id/missions`: Fetch missions for a specific drone.
-   `PUT /api/drones/:id`: Update drone details.
-   `DELETE /api/drones/:id`: Delete a drone.

### Missions API

-   `POST /api/missions`: Schedule a new mission.
-   `GET /api/missions`: Fetch all missions (can be filtered by `status`, `mission_type`, `priority`).
-   `GET /api/missions/active`: Fetch all active missions.
-   `GET /api/missions/upcoming`: Fetch upcoming missions.
-   `GET /api/missions/:id`: Fetch mission details by ID.
-   `PUT /api/missions/:id`: Update mission details.
-   `DELETE /api/missions/:id`: Delete a mission.
-   `PATCH /api/missions/:id/start`: Start a scheduled mission.
-   `PATCH /api/missions/:id/complete`: Mark a mission as complete.

### Telemetry API

-   `POST /api/telemetry`: Ingest telemetry data from a drone.
-   `GET /api/telemetry/drone/:id`: Get all telemetry for a drone.
-   `GET /api/telemetry/drone/:id/latest`: Get the latest telemetry for a drone.
-   `GET /api/telemetry/drone/:id/range`: Get telemetry within a time range.
-   `GET /api/telemetry/drone/:id/stats`: Get telemetry statistics.

### WebSocket API

-   **Endpoint**: `/`
-   **Events**:
    -   `join_drone` (client to server): Subscribe to a drone's telemetry.
    -   `leave_drone` (client to server): Unsubscribe from a drone's telemetry.
    -   `telemetry_update` (server to client): Broadcasts telemetry updates.

**Example Client-side WebSocket Code**:

```javascript
const socket = io('http://localhost:5000');

// Join room for a specific drone
socket.emit('join_drone', 'your_drone_id');

// Listen for telemetry updates
socket.on('telemetry_update', (data) => {
  console.log('Received telemetry:', data);
});
```

## Sample `curl` Commands

### Create a Drone

```bash
curl -X POST http://localhost:5000/api/drones \
-H "Content-Type: application/json" \
-d '{
  "name": "IITB-Drone-001",
  "model": "DJI Phantom 4 Pro V2.0"
}'
```

### Schedule a Mission

```bash
curl -X POST http://localhost:5000/api/missions \
-H "Content-Type: application/json" \
-d '{
  "drone_id": "your_drone_id",
  "name": "Campus Surveillance",
  "start_time": "2024-12-01T10:00:00.000Z",
  "end_time": "2024-12-01T12:00:00.000Z",
  "mission_type": "surveillance",
  "coordinates": {
    "start": { "latitude": 19.1334, "longitude": 72.9154 },
    "end": { "latitude": 19.1334, "longitude": 72.9154 }
  }
}'
```

### Ingest Telemetry

```bash
curl -X POST http://localhost:5000/api/telemetry \
-H "Content-Type: application/json" \
-d '{
  "drone_id": "your_drone_id",
  "latitude": 19.1334,
  "longitude": 72.9154,
  "altitude": 50,
  "battery": 85,
  "speed": 10
}'
```

## Future Enhancements

-   **Authentication & Authorization**: Implement JWT-based authentication and role-based access control.
-   **Advanced Telemetry Analysis**: More sophisticated analytics on telemetry data.
-   **Mission Waypoints**: Support for multiple waypoints in a mission.
-   **Dockerization**: Containerize the application for easier deployment.
-   **API Documentation UI**: Integrate Swagger or Postman for interactive API documentation.

## License

This project is licensed under the ISC License. See the `LICENSE` file for details. 