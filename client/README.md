# Socket.IO Direct Message Chat Client

## Overview
This is a real-time direct message chat application built with Socket.IO, featuring user registration, online user list, and private messaging.

## Prerequisites
- Node.js (v14 or later)
- npm (Node Package Manager)

## Project Structure
```
socket-chat-client/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── client.js
│
└── package.json
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Danbaba1/socket-io
cd socket-io/client
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Before running the client, ensure you have a compatible Socket.IO server running. The current configuration connects to `http://localhost:3000`.

Update the server connection in `client.js` if your server is running on a different host or port:
```javascript
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start a local server with cache-disabled settings.

### Production Mode
```bash
npm start
```

After starting the server, access the application at:
```
http://localhost:8080/index.html
```

## Features
- User registration
- Real-time user list
- Direct messaging
- Mobile-responsive design
- Viewport height fix for mobile devices

## Browser Compatibility
- Modern browsers supporting WebSocket and ES6
- Responsive design for mobile and desktop

## Dependencies
- Socket.IO Client (v4.7.5)
- http-server (for local development)

## Customization
- Modify `styles.css` to change the look and feel
- Adjust `client.js` to add more features or change behavior

## Troubleshooting
- Ensure the Socket.IO server is running before starting the client
- Check browser console for connection errors
- Verify network settings and firewall configurations
