// src/api-chat/socketHandlers.ts
import { Server } from 'socket.io';
import { SocketWithUsername, DirectMessageData, MessageResponse } from './interfaces';
import { UserStore } from './userStore';

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: SocketWithUsername) => {
    console.log('New client connected:', socket.id);
    
    // User registration
    socket.on('register', (username: string) => {
      if (UserStore.userExists(username)) {
        socket.emit('registration_error', 'Username already taken');
        return;
      }
      
      UserStore.addUser(username, socket.id);
      socket.username = username;
      
      socket.emit('registration_success', username);
      io.emit('user_list', UserStore.getAllUsernames());
    });
    
    // Direct messaging
    socket.on('direct_message', (data: DirectMessageData) => {
      const recipientSocketId = UserStore.getSocketId(data.recipient);
      
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
        UserStore.removeUser(socket.username);
        io.emit('user_list', UserStore.getAllUsernames());
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}
