import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { localSignupStrategy } from './@api-auth/passport/strategies/local.signup.strategy';
import { localLoginStrategy } from './@api-auth/passport/strategies/local.login.strategy';

import { connectToDatabase } from './db.connect';
import { setupSocketHandlers } from './@api-chat/socketHandlers';

// Import routes as ES Modules
import authRoutes from './@api-auth/auth.route';
import userRoutes from './@api-user/user.route';

dotenv.config();

passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// Connect to MongoDB before starting the server
const startServer = async () => {
  // Connect to database
  await connectToDatabase();

  // Express app setup
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`],
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
  } as any);

  // Middleware
  app.use(cors({
    origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  app.use(passport.initialize());

  // Use routes
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);

  // Setup socket handlers
  setupSocketHandlers(io);

  // Start server
  const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Call the start server function
startServer().catch(console.error);
