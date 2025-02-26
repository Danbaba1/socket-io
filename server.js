// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected users
const users = new Map(); // Maps username to socket.id

// Serve static files
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user registration
    socket.on('register', (username) => {
        console.log('Register event received with username:', username);
        // Check if username is already taken
        if (Array.from(users.keys()).includes(username)) {
            socket.emit('registration_error', 'Username already taken');
            return;
        }

        // Store user
        users.set(username, socket.id);
        socket.username = username;

        // Confirm registration
        socket.emit('registration_success', username);

        // Broadcast updated user list to all clients
        io.emit('user_list', Array.from(users.keys()));

        console.log(`${username} registered with socket ${socket.id}`);
    });

    // Handle direct messages
    socket.on('direct_message', (data) => {
        const recipientSocketId = users.get(data.recipient);
        if (recipientSocketId) {
            // Send message only to the recipient
            io.to(recipientSocketId).emit('receive_message', {
                sender: socket.username,
                content: data.content,
                timestamp: new Date().toISOString()
            });
        } else {
            // Notify sender that recipient is not available
            socket.emit('message_error', `User ${data.recipient} is not available`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            // Broadcast updated user list
            io.emit('user_list', Array.from(users.keys()));
            console.log(`${socket.username} disconnected`);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
