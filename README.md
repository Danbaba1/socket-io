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
* Environment variables setup (.env file)

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
cd "@server"
npm install

# Install client dependencies
cd "../@client"
npm install
```

4. Install required packages:
```bash
# In the server directory
npm install dotenv
```

5. Create a `.env` file in the @server directory:
```
PORT=8080
CLIENT_APP_PORT=3000
CLIENT_APP_URL=http://localhost:3000
```

## Running the Application

### Start the Server

```bash
# From the @server directory
cd "@server"
npm run dev    # For development with nodemon and ts-node
# or
npm start      # For production (runs compiled JS)
```

### Start the Client

```bash
# From the @client directory
cd "@client"
npm run dev    # Starts the client development server
# or
npm start      # Starts the client in production mode
```

After starting both server and client, access the application at:
```
http://localhost:3000
```

