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
* Node.js (v12.0.0 or higher recommended)
* npm (Node Package Manager)

## Installation
1. Create a new folder for your application:
```bash
mkdir socket-app
cd socket-app
```

2. Clone the repository:
```bash
git clone https://github.com/Danbaba1/socket-io.git
cd socket-io
```

3. Install the dependencies:
```bash
npm install
```

## Running the Application
1. Start the server:
```bash
node server
```

2. The application will be available at `http://localhost:3000`.

3. To test the chat functionality:
   - Open multiple browser windows or tabs pointing to `http://localhost:3000`
   - Register with different usernames in each window (e.g., "Daniel", "David")
   - The server will log connection and registration events:
     ```
     Server running on port 3000
     New client connected: Y1D3mBa-cuHRhomIAAAB
     New client connected: 2NO2LEjmGUz_Z4LMAAAD
     Register event received with username: Daniel
     Daniel registered with socket Y1D3mBa-cuHRhomIAAAB
     Register event received with username: David
     David registered with socket 2NO2LEjmGUz_Z4LMAAAD
     ```
   - Select a user from the online users list to start a conversation
   - Type messages to see real-time communication between users

## Project Structure
```
socket-io/
├── index.html        # Client-side HTML file (will be served automatically)
├── server.js         # Server-side application logic
├── package.json      # Project dependencies
└── README.md         # This file
```

## How It Works
### Server-Side (server.js)
* Sets up an Express server with Socket.IO integration
* Manages user connections and registrations
* Handles direct message routing between users
* Maintains a list of active users
* Broadcasts user list updates to all clients

### Client-Side (index.html)
* Provides a user interface for registration and messaging
* Connects to the Socket.IO server
* Displays online users
* Allows selection of a user to chat with
* Sends and receives direct messages in real-time

## Usage
1. Open the application in your browser
2. Enter a username and click "Register"
3. Select a user from the online users list
4. Type a message and click "Send"
5. Messages will appear instantly for both sender and recipient

## Customization
You can modify the application by:
* Editing the CSS styles in index.html to change the appearance
* Adding additional features to the server.js file
* Extending the client-side JavaScript in index.html

## Troubleshooting
* If the server fails to start, ensure no other application is using port 3000
* If messages aren't being delivered, check the browser console for error messages
* Ensure all users have unique usernames
* Make sure you have the latest version of Socket.IO installed
* If you encounter CORS issues, verify the CORS configuration in server.js
