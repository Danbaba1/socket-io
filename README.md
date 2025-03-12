# TypeScript Socket.IO Direct Message Chat

A real-time direct messaging web application built with Socket.IO, Express, TypeScript, and Node.js. This application allows users to register with a username and exchange private messages with other online users, with the added benefits of type safety.

## Features
* User registration with unique username validation
* Real-time user presence (online users list)
* Private direct messaging between users
* Instant message delivery with Socket.IO
* Responsive design that works on desktop and mobile devices
* Simple and intuitive user interface
* TypeScript type definitions for safer code
* Modular code structure with separation of concerns

## Prerequisites

* Node.js (v14 or higher recommended)
* npm (Node Package Manager)
* TypeScript knowledge

## Project Structure

```
socket-io-direct-message-chat/
├── client/              # Client-side application
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── client.js
│   └── package.json
│
├── server/              # Server-side TypeScript application
│   ├── src/
│   │   ├── server.ts              # Main server setup
│   │   └── api-chat/              # Socket.IO module
│   │       ├── interfaces.ts      # TypeScript interfaces
│   │       ├── socketHandlers.ts  # Socket event handlers
│   │       └── userStore.ts       # User management
│   ├── dist/            # Compiled JavaScript
│   │   └── server.js
│   ├── package.json
│   └── tsconfig.json    # TypeScript configuration
│
└── README.md            # This file
```

## Installation

1. Create a new folder for your application:
```bash
mkdir socket-app
cd socket-app
```

2. Clone the repository:

```bash
git clone https://github.com/Danbaba1/socket-io
cd socket-io
```

3. Install dependencies for both client and server:

```bash
# Install server dependencies
cd @server
npm install

# Install client dependencies
cd ../@client
npm install
```

## Running the Application

### Start the Server

```bash
# From the server directory
cd server
npm run build  # Compile TypeScript to JavaScript
npm run dev    # For development with ts-node-dev
# or
npm start      # For production (runs compiled JS)
```

### Start the Client

```bash
# From the client directory
cd client
npm run dev    # Starts the client with http-server
# or
npm start      # Starts the client in production mode
```

After starting both server and client, access the application at:
```
http://localhost:3000
```

## Configuration

### TypeScript Configuration
- The server uses TypeScript with configuration in `tsconfig.json`
- Type definitions for Socket.IO, Express, and custom interfaces

### Server Configuration
- Configure CORS settings in `server/src/server.ts`
- Set environment variables for port and other settings
- Static file serving from client's public directory

### Client Configuration
- Update server connection URL in `client/public/client.js` if needed
- Modify `styles.css` for custom styling

## How It Works

### Server-Side
* Express and Socket.IO server with TypeScript
* Modular architecture with separation of concerns:
  * Main server setup in server.ts
  * Socket handlers in api-chat/socketHandlers.ts
  * User management in api-chat/userStore.ts
  * Interfaces in api-chat/interfaces.ts
* Strongly typed interfaces for messages and socket extensions
* Handles direct message routing
* Maintains active users list
* Broadcasts user list updates

### Client-Side
* Responsive web interface
* Socket.IO client connection
* User registration
* Online users display
* Real-time direct messaging

## Deployment

### Local Development
1. Build and start the TypeScript server
2. Start the client
3. Access the application at `http://localhost:3000` 
