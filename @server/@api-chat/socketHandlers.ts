import { Server, Socket } from 'socket.io';
import { SocketWithUsername, DirectMessageData, MessageResponse } from './interfaces';
import { UserStore } from './userStore';

export function setupSocketHandlers(io: Server): void {
  // Type assertion to access methods safely
  const socketServer = io as Server & {
    on(event: 'connection', callback: (socket: Socket) => void): void;
    emit(event: string, ...args: any[]): void;
  };

  socketServer.on('connection', (socket: Socket & SocketWithUsername) => {
    console.log('New client connected:', socket.id);
    
    // User registration
    socket.on('register', (username: string) => {
      if (UserStore.userExists(username)) {
        socket.emit('registration_error', 'Username already taken');
        return;
      }
      
      UserStore.addUser(username, socket.id);
      (socket as SocketWithUsername).username = username;
      
      socket.emit('registration_success', username);
      socketServer.emit('user_list', UserStore.getAllUsernames());
    });
    
    // Direct messaging
    socket.on('direct_message', (data: DirectMessageData) => {
      const recipientSocketId = UserStore.getSocketId(data.recipient);
      
      if (recipientSocketId) {
        socketServer.to(recipientSocketId).emit('receive_message', {
          sender: (socket as SocketWithUsername).username,
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
      const username = (socket as SocketWithUsername).username;
      if (username) {
        UserStore.removeUser(username);
        socketServer.emit('user_list', UserStore.getAllUsernames());
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}
