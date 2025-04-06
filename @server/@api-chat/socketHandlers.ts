import jwt from 'jsonwebtoken';
import { DirectMessageData, MessageResponse } from './interfaces.js';
import { UserStore } from './userStore.js';
import Message from '../models/message.js';
import dotenv from 'dotenv';
import { logger } from '../server.js';  // Import the logger from server.js

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "Chat-app";

export function setupSocketHandlers(io: any): void {
  // Authentication middleware
  io.use((socket: any, next: Function) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.error('SOCKET', 'Authentication error: Token required', null);
      return next(new Error('Authentication error: Token required'));
    }

    jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
      if (err) {
        logger.error('SOCKET', 'Authentication error: Invalid token', err);
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.user = {
        userId: decoded._id,
        username: decoded.username
      };

      next();
    });
  });

  // Connection event handler
  io.on('connection', (socket: any) => {
    logger.info('SOCKET', 'New client connected:', { socketId: socket.id });

    if (!socket.user || !socket.user.userId) {
      logger.warn('SOCKET', 'User connected without proper authentication', { socketId: socket.id });
      socket.disconnect();
      return;
    }

    const { userId, username } = socket.user;

    if (!username) {
      logger.warn('SOCKET', 'User connected without username', { userId, socketId: socket.id });
      // You might want to set a default username or disconnect the socket
    }

    logger.info('SOCKET', `User connected`, { userId, username, socketId: socket.id });

    // Register authenticated user
    UserStore.addUser(userId, socket.id, username);

    // Broadcast user's online status to all connected clients
    io.emit('user_status', { userId, username, status: 'online' });

    // Send connected user list to all clients
    // IMPORTANT: Changed from 'user_list' to 'online_users' to match client expectation
    io.emit('online_users', UserStore.getAllUsers());

    // Handle request for online users
    socket.on('get_online_users', () => {
      logger.debug('SOCKET', 'Client requested online users list', { userId, socketId: socket.id });
      console.log('Sending online users:', UserStore.getAllUsers());
      socket.emit('online_users', UserStore.getAllUsers());
    });

    // Get unread messages for the user
    socket.on('get_message_history', async (data: { userId: any; }) => {
      try {
        const otherUserId = data.userId || data; // Handle both object and string format

        logger.debug('SOCKET', 'Getting message history', { userId, otherUserId });

        const messages = await Message.find({
          $or: [
            { sender: userId, recipient: otherUserId },
            { sender: otherUserId, recipient: userId }
          ]
        }).sort({ createdAt: 1 });

        // Transform messages to include sender username
        const transformedMessages = messages.map(msg => {
          const senderUsername = msg.sender === userId ? username : UserStore.getUsername(msg.sender) || 'Unknown';
          return {
            id: msg._id,
            senderId: msg.sender,
            senderUsername,
            recipientId: msg.recipient,
            content: msg.content,
            read: msg.read,
            createdAt: msg.createdAt
          };
        });

        socket.emit('message_history', transformedMessages);

        // Mark messages as read
        await Message.updateMany(
          { sender: otherUserId, recipient: userId, read: false },
          { $set: { read: true } }
        );
      } catch (error) {
        logger.error('SOCKET', 'Failed to retrieve message history', error);
        socket.emit('error', 'Failed to retrieve message history');
      }
    });

    // Mark entire conversation as read
    socket.on('mark_conversation_read', async (data: { userId: any; }) => {
      try {
        const otherUserId = data.userId || data;

        await Message.updateMany(
          { sender: otherUserId, recipient: userId, read: false },
          { $set: { read: true } }
        );

        logger.debug('SOCKET', 'Marked conversation as read', { userId, otherUserId });
      } catch (error) {
        logger.error('SOCKET', 'Failed to mark conversation as read', error);
        socket.emit('error', 'Failed to mark conversation as read');
      }
    });

    // Direct messaging
    socket.on('direct_message', async (data: DirectMessageData) => {
      try {
        const recipientId = data.recipientId || data.recipient;
        const recipientSocketId = UserStore.getSocketId(recipientId);

        logger.debug('SOCKET', 'Direct message', {
          from: userId,
          to: recipientId,
          hasRecipientSocket: !!recipientSocketId
        });

        // Create and save message to database
        const newMessage = new Message({
          sender: userId,
          recipient: recipientId,
          content: data.content,
          read: false,
          createdAt: new Date()
        });

        await newMessage.save();

        const messageResponse: MessageResponse = {
          messageId: newMessage._id.toString(),
          sender: username,
          senderId: userId,
          recipientId: recipientId,
          content: data.content,
          timestamp: newMessage.createdAt.toISOString(),
          read: false
        };

        // Send to recipient if online
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('direct_message', messageResponse);
        }

        // Confirm to sender
        socket.emit('message_sent', messageResponse);
      } catch (error) {
        logger.error('SOCKET', 'Failed to send message', error);
        socket.emit('message_error', 'Failed to send message');
      }
    });

    socket.on('test_event', (data: any) => {
      console.log('Received test event:', data);
      socket.emit('test_response', { received: true });
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data: { messageId: any; }) => {
      try {
        const messageId = data.messageId || data;

        await Message.findByIdAndUpdate(messageId, { read: true });
        const message = await Message.findById(messageId);

        if (message) {
          const senderSocketId = UserStore.getSocketId(message.sender);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', messageId);
          }
        }
      } catch (error) {
        logger.error('SOCKET', 'Failed to mark message as read', error);
        socket.emit('error', 'Failed to mark message as read');
      }
    });

    // User is typing event
    socket.on('typing', (data: { recipientId: any; }) => {
      const recipientId = data.recipientId || data;
      const recipientSocketId = UserStore.getSocketId(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', { userId, username });
      }
    });

    // User stopped typing event
    socket.on('stopped_typing', (data: { recipientId: any; }) => {
      const recipientId = data.recipientId || data;
      const recipientSocketId = UserStore.getSocketId(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stopped_typing', { userId });
      }
    });

    // Disconnection handling
    socket.on('disconnect', () => {
      UserStore.removeUser(userId);
      // IMPORTANT: Changed from 'user_list' to 'online_users' to match client expectation
      io.emit('online_users', UserStore.getAllUsers());
      io.emit('user_status', { userId, username, status: 'offline' });
      io.emit('user_disconnected', userId);
      logger.info('SOCKET', 'Client disconnected', { userId, socketId: socket.id });
    });
  });
}
