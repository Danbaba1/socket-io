# TypeScript Socket.IO Direct Message Chat

A real-time direct messaging web application built with Socket.IO, Express, TypeScript, and Node.js. This application enables users to register with a unique username and exchange private messages with other online users, leveraging the power of TypeScript for enhanced type safety.

## Features

* User registration with unique username validation
* Real-time user presence tracking
* Private direct messaging between users
* Instant message delivery using Socket.IO
* Message typing indicators
* User authentication with JWT
* Responsive design compatible with desktop and mobile devices
* Clean and intuitive user interface
* Strong TypeScript type definitions
* Modular architecture with clear separation of concerns

## Prerequisites

* Node.js (v14 or higher recommended)
* npm (Node Package Manager)
* Basic understanding of TypeScript
* Configured environment variables

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/Danbaba1/socket-io.git
cd socket-io
```

2. Install dependencies:
```bash
# Install server dependencies
cd "@server"
npm install

# Install client dependencies
cd "../@client"
npm install
```

3. Create environment configuration:
* In the `@server` directory, create a `.env` file based on the provided `.env.example`:
```
PORT=8080
CLIENT_APP_PORT=3000
CLIENT_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

### Start the Server
```bash
# From the @server directory
cd "@server"
npm run dev
```

### Start the Client
```bash
# From the @client directory
cd "../@client"
npm run dev
```

## Accessing the Application

After starting both server and client, access the application at:
```
http://localhost:3000
```
