require("dotenv").config();
const { server } = require("./src/app");

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Drone Mission Backend Server is running on port ${PORT}`);
  console.log(`WebSocket server is available at ws://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`To test JWT-protected endpoints, use the Authorize button in Swagger UI and enter your token like this: Bearer <your-jwt-token>`);
});
