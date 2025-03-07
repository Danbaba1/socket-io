import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

// Interface definitions
interface SocketWithUsername extends Socket {
  username?: string;
}

interface DirectMessageData {
  recipient: string;
  content: string;
}

interface MessageResponse {
  sender?: string;
  content: string;
  timestamp: string;
}

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

// Users storage
const users: Map<string, string> = new Map();

// Socket.IO connection handling
io.on('connection', (socket: SocketWithUsername) => {
  console.log('New client connected:', socket.id);
  
  // User registration
  socket.on('register', (username: string) => {
    if (Array.from(users.keys()).includes(username)) {
      socket.emit('registration_error', 'Username already taken');
      return;
    }
    
    users.set(username, socket.id);
    socket.username = username;
    
    socket.emit('registration_success', username);
    io.emit('user_list', Array.from(users.keys()));
  });
  
  // Direct messaging
  socket.on('direct_message', (data: DirectMessageData) => {
    const recipientSocketId = users.get(data.recipient);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', {
        sender: socket.username,
        content: data.content,
        timestamp: new Date().toISOString()
      } as MessageResponse);
      
      socket.emit('message_sent', {
        content: data.content,
        timestamp: new Date().toISOString()
      } as MessageResponse);
    } else {
      socket.emit('message_error', `User ${data.recipient} is not available`);
    }
  });
  
  // Disconnection handling
  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      io.emit('user_list', Array.from(users.keys()));
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
