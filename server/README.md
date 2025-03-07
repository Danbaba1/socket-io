# TypeScript Socket.IO Chat Server

## Overview
A real-time direct messaging server built with Express, Socket.IO, and TypeScript, supporting user registration and direct messaging with type safety.

## Prerequisites
- Node.js (v14 or later)
- npm (Node Package Manager)
- TypeScript knowledge

## Project Structure
```
socket-chat-server/
│
├── src/
│   └── server.ts
│
├── dist/
│   └── server.js (compiled)
│
├── package.json
│
└── tsconfig.json
```

## Features
- Real-time user registration
- Direct messaging
- Online user list management
- CORS support
- Error handling for message and registration events
- Type safety with TypeScript
- Properly defined interfaces for messages and socket extensions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Danbaba1/socket-io
cd socket-io/server
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables
- `PORT`: Specify a custom port (defaults to 3000)

### TypeScript Configuration
The project includes a `tsconfig.json` file with the following key settings:
- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Output directory: ./dist

### CORS Configuration
The current configuration allows all origins (`*`). For production:
- Modify `cors` middleware in `server.ts`
- Set specific allowed origins
- Restrict methods and headers

Example production configuration:
```typescript
cors: {
    origin: 'https://yourdomain.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}
```

## Running the Application

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist` directory.

### Development Mode
```bash
npm run dev
```
Uses `ts-node-dev` for automatic server restart on file changes.

### Production Mode
```bash
npm start
```
Runs the compiled JavaScript from the `dist` directory.

## Server Endpoints
- WebSocket connection at `http://localhost:3000`
- Supports events:
  - `register`: User registration
  - `direct_message`: Send private messages
  - Automated `user_list` broadcasts

## Events

### Client-to-Server Events
- `register`: Register a username
- `direct_message`: Send a private message

### Server-to-Client Events
- `registration_success`: Successful username registration
- `registration_error`: Username already taken
- `user_list`: Updated list of online users
- `receive_message`: Incoming direct message
- `message_sent`: Confirmation of sent message
- `message_error`: Message delivery failure

## Type Definitions
The server includes TypeScript interfaces for:
- Extended Socket with username
- Message data structures
- Response payloads

## Security Considerations
- Implement rate limiting
- Add authentication
- Validate and sanitize user inputs
- Use HTTPS in production
- Implement more robust username validation

## Scaling Considerations
- Consider using Redis for user and message storage
- Implement horizontal scaling strategies
- Add persistent message storage

## Dependencies
- Express
- Socket.IO
- CORS
- TypeScript and related type definitions

## Troubleshooting
- Ensure client and server are on compatible Socket.IO versions
- Check network configurations
- Verify CORS settings
- Check TypeScript compilation errors
