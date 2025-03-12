// src/server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { setupSocketHandlers } from './@api-chat/socketHandlers';

// Express app setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // More restrictive in production
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: '*', // Adjust in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, '../../client/public')));

// Setup socket handlers
setupSocketHandlers(io);

// Start server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
