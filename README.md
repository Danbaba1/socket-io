# Socket.IO Direct Message Chat

A real-time direct messaging web application built with Socket.IO, Express, and Node.js. This application allows users to register with a username and exchange private messages with other online users.

## Features

- User registration with unique username validation
- Real-time user presence (online users list)
- Private direct messaging between users
- Instant message delivery with Socket.IO
- Simple and intuitive user interface

## Prerequisites

- Node.js (v12.0.0 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the source code:

```bash
git clone <repository-url>
cd socket-io-direct-message-chat
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `public` directory and place the `index.html` file in it:

```bash
mkdir -p public
cp index.html public/
```

## Running the Application

Start the server:

```bash
node server.js
```

The application will be available at `http://localhost:3000` (or the port specified in your environment variables).

## Project Structure

```
socket-io-direct-message-chat/
├── public/
│   └── index.html      # Client-side application
├── server.js           # Server-side application logic
├── package.json        # Project dependencies
└── README.md           # This file
```

## How It Works

### Server-Side (server.js)

- Sets up an Express server with Socket.IO integration
- Manages user connections and registrations
- Handles direct message routing between users
- Maintains a list of active users
- Broadcasts user list updates to all clients

### Client-Side (index.html)

- Provides a user interface for registration and messaging
- Connects to the Socket.IO server
- Displays online users
- Allows selection of a user to chat with
- Sends and receives direct messages in real-time

## Usage

1. Open the application in your browser
2. Enter a username and click "Register"
3. Select a user from the online users list
4. Type a message and click "Send"
5. Messages will appear instantly for both sender and recipient

## Customization

You can modify the application by:
- Editing the CSS styles in index.html to change the appearance
- Adding additional features to the server.js file
- Extending the client-side JavaScript in index.html

## Troubleshooting

- If the server fails to start, ensure no other application is using port 3000
- If messages aren't being delivered, check the console for error messages
- Ensure all users have unique usernames
