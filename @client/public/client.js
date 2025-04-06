// Add at top of your script
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
});
document.addEventListener('DOMContentLoaded', () => {
    // Check for authentication
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    console.log('Auth check:', {
        hasToken: !!token,
        hasUserId: !!userId,
        hasUsername: !!username
    });

    // Validate JWT token
    function isTokenValid(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error validating token', error);
            return false;
        }
    }

    // Redirect if not authenticated
    if (!token || !userId || !username || !isTokenValid(token)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'auth.html';
        return;
    }

    // DOM elements
    const messagesDiv = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const usersDiv = document.getElementById('users');
    const selectedUserSpan = document.getElementById('selected-user');
    const chatHeader = document.getElementById('chat-header');

    // Check if chatHeader exists
    if (!chatHeader) {
        console.error('Chat header element not found!');
        const fallbackHeader = document.createElement('div');
        fallbackHeader.id = 'chat-header';
        document.body.insertBefore(fallbackHeader, document.body.firstChild);
        chatHeader = fallbackHeader;
    }

    // Add style element
    const style = document.createElement('style');
    style.textContent = `
    .register-new-btn {
        padding: 6px 12px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-right: 10px;
        display: flex;
        align-items: center;
    }
    .register-new-btn:hover {
        background: #45a049;
    }
    .register-new-btn::before {
        content: '+';
        margin-right: 4px;
        font-weight: bold;
    }
    
    .user-info {
        display: inline-block;
        margin-right: 15px;
        font-size: 14px;
    }
    .current-user {
        font-weight: bold;
    }

    .logout-btn {
        padding: 6px 12px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    .logout-btn:hover {
        background: #d32f2f;
    }
    
    .message {
        padding: 8px 12px;
        margin: 5px;
        border-radius: 10px;
        max-width: 70%;
        word-wrap: break-word;
    }
    
    .sent {
        background-color: #DCF8C6;
        margin-left: auto;
        margin-right: 10px;
        text-align: right;
    }
    
    .received {
        background-color: #f1f0f0;
        margin-right: auto;
        margin-left: 10px;
    }
    
    .system {
        background-color: #e6e6e6;
        color: #666;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
        max-width: 80%;
        font-style: italic;
        font-size: 0.8em;
    }
    
    .error {
        background-color: #ffdddd;
        color: #ff0000;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
        max-width: 80%;
    }
    `;
    document.head.appendChild(style);

    // Add user info display to header
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `Logged in as: <span class="current-user">${username}</span>`;
    chatHeader.appendChild(userInfo);

    // Create register new button
    // const registerNewBtn = document.createElement('button');
    // registerNewBtn.textContent = 'New User';
    // registerNewBtn.className = 'register-new-btn';
    // chatHeader.appendChild(registerNewBtn);

    // // Register button click handler
    // registerNewBtn.addEventListener('click', () => {
    //     window.location.href = 'auth.html?register=true';
    // });

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'logout-btn';
    chatHeader.appendChild(logoutBtn);

    // Variables for chat
    let selectedUserId = null;
    let isTyping = false;
    let typingTimeout = null;
    let socket = null;

    // Fix viewport issues for mobile
    function updateViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', updateViewportHeight);
    updateViewportHeight();

    // Connect to Socket.IO with JWT auth
    connectToSocket(token);

    // Handle logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Logout button clicked');

        try {
            // Disconnect socket
            if (socket) {
                socket.disconnect();
            }

            // Clear local storage
            localStorage.clear();

            // Force redirect
            window.location.replace('auth.html');
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback redirect
            window.location.href = 'auth.html';
        }
    });

    // Message form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const content = messageInput.value.trim();
        console.log('Attempting to send message:', content, 'to:', selectedUserId);

        if (!selectedUserId) {
            addMessage('error', 'Please select a user to chat with first');
            return;
        }

        if (content && socket) {
            // IMPORTANT FIX: Use a consistent property name for recipient
            socket.emit('direct_message', {
                recipientId: selectedUserId,  // Changed from 'recipient' to 'recipientId'
                content
            });

            // Clear input and reset typing status
            messageInput.value = '';

            if (isTyping) {
                isTyping = false;
                socket.emit('stopped_typing', { recipientId: selectedUserId });
                clearTimeout(typingTimeout);
            }
        }
    });

    // Typing indicator
    messageInput.addEventListener('input', () => {
        if (selectedUserId && socket) {
            if (!isTyping && messageInput.value.trim()) {
                isTyping = true;
                socket.emit('typing', { recipientId: selectedUserId });  // Fixed property name
            }

            // Reset the typing timeout
            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(() => {
                if (isTyping) {
                    isTyping = false;
                    socket.emit('stopped_typing', { recipientId: selectedUserId });
                }
            }, 3000);

            // Clear typing status if input is empty
            if (!messageInput.value.trim()) {
                isTyping = false;
                socket.emit('stopped_typing', { recipientId: selectedUserId });
                clearTimeout(typingTimeout);
            }
        }
    });

    messageInput.addEventListener('blur', () => {
        if (isTyping && socket) {
            isTyping = false;
            socket.emit('stopped_typing', { recipientId: selectedUserId });
            clearTimeout(typingTimeout);
        }
    });

    // Connect to Socket.IO with JWT auth
    function connectToSocket(token) {
        socket = io('http://localhost:8080', {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5
        });

        // Socket connection events
        socket.on('connect', () => {
            console.log('Socket connected, ID:', socket.id);
            console.log('Connected to chat server as', username);
            setTimeout(() => {
                console.log('Sending test message to server');
                socket.emit('test_event', { message: 'Test message' });
            }, 5000);
            addMessage('system', `Connected to chat server as ${username}`);
            socket.emit('get_online_users');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            addMessage('error', `Connection error: ${error.message}`);

            if (error.message.includes('authentication')) {
                // Auth failed, redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');

                window.location.href = 'auth.html';
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            addMessage('error', 'Disconnected from server');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            addMessage('error', `Error: ${error}`);
        });

        // User list updates
        socket.on('online_users', (users) => {
            console.log('Received online users:', users);
            updateUsersList(users);
        });

        socket.on('test_response', (data) => {
            console.log('Test response from server:', data);
        });

        // Handle user status updates
        socket.on('user_status', (user) => {
            console.log('User status update:', user);
            if (user.status === 'online') {
                addMessage('system', `${user.username} has connected`);
            } else if (user.status === 'offline') {
                addMessage('system', `${user.username} has disconnected`);
            }
            // Refresh the user list
            socket.emit('get_online_users');
        });

        socket.on('user_disconnected', (userId) => {
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) {
                const username = userItem.textContent;
                addMessage('system', `${username} has disconnected`);
                userItem.remove();

                if (selectedUserId === userId) {
                    selectedUserId = null;
                    selectedUserSpan.textContent = 'No one selected';
                    messagesDiv.innerHTML = '';
                }
            }

            socket.emit('get_online_users');
        });

        // Message handling - FIXED EVENTS
        socket.on('direct_message', (message) => {
            console.log('Received direct message:', message);

            // Make sure we have a valid sender
            const senderName = message.sender || 'Unknown user';

            // Add the message to chat if it's from the currently selected user
            if (message.senderId === selectedUserId) {
                // Create a new message element
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message received';
                messageDiv.textContent = `${senderName}: ${message.content}`;

                // Append to messages container
                messagesDiv.appendChild(messageDiv);
                console.log('Messages container found:', !!messagesDiv);

                // Auto scroll to bottom
                messagesDiv.scrollTop = messagesDiv.scrollHeight;

                // Mark message as read
                socket.emit('mark_as_read', { messageId: message.messageId })
            } else {
                // Add notification for unread message
                const userItem = document.querySelector(`[data-user-id="${message.senderId}"]`);
                if (userItem && !userItem.classList.contains('has-unread')) {
                    userItem.classList.add('has-unread');
                }
            }
        });

        socket.on('message_sent', (message) => {
            console.log('Message sent confirmation:', message);

            // Show sent message in chat if we're in the right conversation
            if (message.recipientId === selectedUserId) {
                // Create a new message element
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message sent';
                messageDiv.textContent = message.content;

                // Append to messages container
                messagesDiv.appendChild(messageDiv);

                // Auto scroll to bottom
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        });

        socket.on('message_history', (messages) => {
            console.log('Received message history:', messages);
            messagesDiv.innerHTML = '';

            if (messages.length === 0) {
                addMessage('system', 'No previous messages');
                return;
            }

            messages.forEach(message => {
                const isReceived = message.senderId !== userId;
                const senderName = isReceived ? message.senderUsername : 'You';
                const messageClass = isReceived ? 'received' : 'sent';
                addMessage(messageClass, `${senderName}: ${message.content}`);
            });

            // Mark messages as read
            socket.emit('mark_conversation_read', { userId: selectedUserId });
        });

        // Typing indicators
        socket.on('user_typing', ({ userId, username }) => {
            if (userId === selectedUserId) {
                const typingIndicator = document.getElementById('typing-indicator');
                if (!typingIndicator) {
                    const indicator = document.createElement('div');
                    indicator.id = 'typing-indicator';
                    indicator.className = 'system';
                    indicator.textContent = `${username} is typing...`;
                    messagesDiv.appendChild(indicator);

                    // Auto scroll to bottom
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            }
        });

        socket.on('user_stopped_typing', ({ userId }) => {
            if (userId === selectedUserId) {
                const typingIndicator = document.getElementById('typing-indicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
            }
        });
    }

    // Helper function to update users list
    function updateUsersList(users) {
        usersDiv.innerHTML = '';

        users.forEach(user => {
            // Don't add current user to the list
            if (user.id !== userId) {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.dataset.userId = user.id;
                userItem.textContent = user.username;

                // Highlight selected user
                if (user.id === selectedUserId) {
                    userItem.classList.add('selected');
                }

                // Add unread indicator if needed
                if (user.hasUnread) {
                    userItem.classList.add('has-unread');
                }

                userItem.addEventListener('click', () => {
                    // Remove selection from all users
                    document.querySelectorAll('.user-item').forEach(item => {
                        item.classList.remove('selected');
                    });

                    // Mark this user as selected
                    userItem.classList.add('selected');
                    userItem.classList.remove('has-unread');

                    selectedUserId = user.id;
                    selectedUserSpan.textContent = user.username;

                    // Enable message input
                    messageInput.disabled = false;
                    messageInput.placeholder = `Type a message to ${user.username}...`;
                    messageInput.focus();

                    // Load message history
                    socket.emit('get_message_history', { userId: user.id });

                    // Mark conversation as read
                    socket.emit('mark_conversation_read', { userId: user.id });
                });

                usersDiv.appendChild(userItem);
            }
        });
    }

    // Helper function to add message to chat
    function addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        messagesDiv.appendChild(messageDiv);

        // Auto scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
});
