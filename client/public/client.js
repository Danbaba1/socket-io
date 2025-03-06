document.addEventListener('DOMContentLoaded', () => {
    // Connect to the server with more explicit options
    const socket = io('http://localhost:3000', {
        transports: ['websocket'], // Force websocket
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    const messagesDiv = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const usernameInput = document.getElementById('username-input');
    const registerBtn = document.getElementById('register-btn');
    const usernameContainer = document.getElementById('username-container');
    const chatArea = document.getElementById('chat-area');
    const usersDiv = document.getElementById('users');
    const selectedUserSpan = document.getElementById('selected-user');

    let selectedUser = null;
    let currentUsername = '';

    // Fix viewport issues for mobile
    function updateViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    window.addEventListener('resize', updateViewportHeight);
    updateViewportHeight();

    // Handle registration
    registerBtn.onclick = () => {
        const username = usernameInput.value.trim();
        if (username) {
            currentUsername = username;
            socket.emit('register', username);
        }
    };

    // Registration responses
    socket.on('registration_success', (username) => {
        addMessage('System', `Welcome ${username}!`, 'system');
        usernameContainer.style.display = 'none';
        chatArea.classList.remove('hidden');
    });

    socket.on('registration_error', (message) => {
        addMessage('System', message, 'error');
    });

    // Handle user list updates
    socket.on('user_list', (users) => {
        usersDiv.innerHTML = '';
        users.forEach(user => {
            if (user !== currentUsername) {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                if (user === selectedUser) userDiv.classList.add('selected');
                userDiv.textContent = user;
                userDiv.onclick = () => {
                    selectedUser = user;
                    selectedUserSpan.textContent = user;
                    document.querySelectorAll('.user-item').forEach(div =>
                        div.classList.remove('selected'));
                    userDiv.classList.add('selected');
                    // Focus on message input after selecting a user
                    messageInput.focus();
                };
                usersDiv.appendChild(userDiv);
            }
        });
    });

    // Handle receiving messages
    socket.on('receive_message', (data) => {
        addMessage(data.sender, data.content, 'received');
    });

    // Handle message sent confirmation
    socket.on('message_sent', (data) => {
        addMessage('You', data.content, 'sent');
    });

    // Handle errors
    socket.on('message_error', (message) => {
        addMessage('System', message, 'error');
    });

    // Send message
    messageForm.onsubmit = (e) => {
        e.preventDefault();
        const messageContent = messageInput.value.trim();
        if (messageContent && selectedUser) {
            socket.emit('direct_message', {
                recipient: selectedUser,
                content: messageContent
            });
            messageInput.value = '';

            // Keep focus on the input after sending
            messageInput.focus();
        }
    };

    // Helper function to add messages to the chat
    function addMessage(sender, content, type) {
        const wasAtBottom = messagesDiv.scrollHeight - messagesDiv.clientHeight <= messagesDiv.scrollTop + 10;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = `${sender}: ${content}`;
        messagesDiv.appendChild(messageDiv);

        // Only auto-scroll if we were already at the bottom
        if (wasAtBottom) {
            setTimeout(() => {
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }, 10);
        }
    }

    // Add some additional connection handling
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
    });
});
