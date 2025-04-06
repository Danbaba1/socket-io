import express from 'express';
import http from 'http';
import { Server, ServerOptions } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { localSignupStrategy } from './@api-auth/passport/strategies/local.signup.strategy.js';
import { localLoginStrategy } from './@api-auth/passport/strategies/local.login.strategy.js';

import { connectToDatabase } from './db.connect.js';
import { setupSocketHandlers } from './@api-chat/socketHandlers.js';

// Import routes as ES Modules
import authRoutes from './@api-auth/auth.route.js';
import userRoutes from './@api-user/user.route.js';

dotenv.config();

// Logger function to standardize log format
const logger = {
  info: (context: any, message: any, data: any = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] [${context}] ${message}`, data);
  },
  error: (context: any, message: any, error: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] [${context}] ${message}`, error);
  },
  debug: (context: any, message: any, data: any = {}) => {
    console.debug(`[DEBUG] [${new Date().toISOString()}] [${context}] ${message}`, data);
  },
  warn: (context: any, message: any, data: any = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] [${context}] ${message}`, data);
  }
};

// Register Passport strategies
logger.info('SERVER', 'Registering Passport strategies');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    logger.info('SERVER', 'Starting server initialization');
    
    // Connect to database
    logger.info('DATABASE', 'Attempting to connect to MongoDB');
    await connectToDatabase();
    logger.info('DATABASE', 'Successfully connected to MongoDB');
    
    // Express app setup
    const app = express();
    const server = http.createServer(app);
    logger.info('SERVER', 'HTTP server created');
    
    // Create Socket.IO options with explicit typing
    const socketOptions = {
      cors: {
        origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`],
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true
      }
    };
    
    // Cast to unknown first, then to ServerOptions to satisfy TypeScript
    const io = new Server(server, socketOptions as unknown as ServerOptions);
    logger.info('SOCKET', 'Socket.IO server initialized', {
      corsOrigins: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`]
    });
    
    // Middleware
    app.use(cors({
      origin: [`http://localhost:${process.env.CLIENT_APP_PORT}`, `${process.env.CLIENT_APP_URL}`],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    logger.info('SERVER', 'CORS middleware configured');
    
    app.use(express.json());
    app.use(passport.initialize());
    logger.info('SERVER', 'Express middleware configured');
    
    // Use routes
    app.use('/auth', authRoutes);
    app.use('/user', userRoutes);
    logger.info('SERVER', 'Routes registered', { routes: ['/auth', '/user'] });
    
    // Log requests middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('REQUEST', `${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });
      });
      next();
    });
    
    // Setup socket handlers
    setupSocketHandlers(io);
    logger.info('SOCKET', 'Socket handlers configured');
    
    // Start server
    const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
    server.listen(PORT, () => {
      logger.info('SERVER', `Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('SERVER', 'Error during server startup:', error);
    process.exit(1);
  }
};

// Call the start server function
startServer().catch(err => {
  logger.error('SERVER', 'Server failed to start:', err);
  process.exit(1);
});

// Export logger for use in other modules
export { logger };
