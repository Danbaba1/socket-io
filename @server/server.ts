// src/server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
// import path from 'path';
import { setupSocketHandlers } from './@api-chat/socketHandlers';
import dotenv from 'dotenv';
dotenv.config();


// Express app setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`], // More restrictive in production
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  } 
} as any);

// Middleware
app.use(cors({
  origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`], // Adjust in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


// Setup socket handlers
setupSocketHandlers(io);

// Start server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
