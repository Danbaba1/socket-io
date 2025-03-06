# Socket.IO Direct Message Chat

A real-time direct messaging web application built with Socket.IO, Express, and Node.js. This application allows users to register with a username and exchange private messages with other online users.

## Features

* User registration with unique username validation
* Real-time user presence (online users list)
* Private direct messaging between users
* Instant message delivery with Socket.IO
* Responsive design that works on desktop and mobile devices
* Simple and intuitive user interface

## Prerequisites

* Node.js (v14 or higher recommended)
* npm (Node Package Manager)

## Project Structure

```
socket-io-direct-message-chat/
├── client/           # Client-side application
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── client.js
│   └── package.json
│
├── server/           # Server-side application
│   ├── src/
│   │   └── server.js
│   └── package.json
│
└── README.md         # This file
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Danbaba1/socket-io
cd socket-io
```

2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Application

### Start the Server

```bash
# From the server directory
cd server
npm run dev  # For development with nodemon
# or
npm start    # For production
```

### Start the Client

```bash
# From the client directory
cd client
npm run dev  # Starts the client with http-server
# or
npm start    # Starts the client in production mode
```

After starting both server and client, access the application at:
```
http://localhost:8080/index.html
```

## Configuration

### Server Configuration
- Configure CORS settings in `server/src/server.js`
- Set environment variables for port and other settings

### Client Configuration
- Update server connection URL in `client/public/client.js` if needed
- Modify `styles.css` for custom styling

## How It Works

### Server-Side
* Express and Socket.IO server
* Manages user connections and registrations
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
1. Start the server
2. Start the client
3. Access the application at `http://localhost:8080/index.html
