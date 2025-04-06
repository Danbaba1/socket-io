// Create logger utility
const logger = {
    info: (context, message, data = null) => {
        const logObj = { timestamp: new Date().toISOString(), level: 'INFO', context, message };
        if (data) logObj.data = data;
        console.log(`%c[INFO] [${context}] ${message}`, 'color: blue; font-weight: bold', data ? data : '');
        return logObj;
    },
    warn: (context, message, data = null) => {
        const logObj = { timestamp: new Date().toISOString(), level: 'WARN', context, message };
        if (data) logObj.data = data;
        console.warn(`%c[WARN] [${context}] ${message}`, 'color: orange; font-weight: bold', data ? data : '');
        return logObj;
    },
    error: (context, message, error = null) => {
        const logObj = { timestamp: new Date().toISOString(), level: 'ERROR', context, message };
        if (error) logObj.error = error;
        console.error(`%c[ERROR] [${context}] ${message}`, 'color: red; font-weight: bold', error ? error : '');
        return logObj;
    },
    debug: (context, message, data = null) => {
        const logObj = { timestamp: new Date().toISOString(), level: 'DEBUG', context, message };
        if (data) logObj.data = data;
        console.debug(`%c[DEBUG] [${context}] ${message}`, 'color: green; font-weight: bold', data ? data : '');
        return logObj;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    logger.info('AUTH', 'DOM loaded - Authentication script initializing');

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const register = urlParams.get('register');
    console.log(register);

    // Check if already authenticated (but ONLY if we're not in register mode)
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (token && !register) {
        logger.info('AUTH', 'Found existing authentication token, redirecting to chat page');
        window.location.href = 'index.html';
        return;
    }

    // If in register mode and we have a token, clear the token for new registration
    if (register && token) {
        logger.info('AUTH', 'Register mode detected with existing token - preparing for new registration');
        // We don't clear tokens here - will only clear if user completes registration
    }

    // DOM elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTitle = document.getElementById('auth-title');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Log DOM element status
    logger.debug('AUTH', 'DOM element references acquired', {
        loginTab: !!loginTab,
        registerTab: !!registerTab,
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        authTitle: !!authTitle,
        loginMessage: !!loginMessage,
        registerMessage: !!registerMessage
    });

    // Setup password toggle functionality
    setupPasswordToggles();

    // Automatically switch to register tab if register parameter is present
   if (register) {
        logger.info('AUTH', 'Register parameter detected, switching to register tab');
        const registerTab = document.getElementById('register-tab');
        const loginTab = document.getElementById('login-tab');
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        const authTitle = document.getElementById('auth-title');
        
        if (registerTab && loginTab && registerForm && loginForm && authTitle) {
            registerTab.classList.add('active-tab');
            loginTab.classList.remove('active-tab');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            authTitle.textContent = 'Register';
            
            // Display message if user is already logged in
            if (token && username) {
                const registerMessage = document.getElementById('register-message');
                if (registerMessage) {
                    registerMessage.textContent = `You're currently logged in as ${username}. Complete registration to switch users.`;
                    registerMessage.className = 'auth-message info-message';
                }
            }
        }
    }

    // Check if redirected with success message (from registration)
    if (message) {
        logger.info('AUTH', 'Message parameter found in URL', { message });
        loginMessage.textContent = decodeURIComponent(message);
        loginMessage.classList.add('success-message');
        // Clear URL parameters without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
        logger.debug('AUTH', 'URL parameters cleared');
    }

    // Switch between login and register tabs
    loginTab.addEventListener('click', () => {
        logger.debug('AUTH', 'Login tab clicked');
        loginTab.classList.add('active-tab');
        registerTab.classList.remove('active-tab');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTitle.textContent = 'Login';
        clearMessages();
    });

    registerTab.addEventListener('click', () => {
        logger.debug('AUTH', 'Register tab clicked');
        registerTab.classList.add('active-tab');
        loginTab.classList.remove('active-tab');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authTitle.textContent = 'Register';
        clearMessages();
        
        // Display message if user is already logged in
        if (token && username) {
            showMessage(registerMessage, `You're currently logged in as ${username}. Complete registration to switch users.`, 'info');
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        logger.info('AUTH', 'Login form submitted');
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        logger.debug('AUTH', 'Login form data', {
            email: email ? `${email.substring(0, 3)}...` : '(empty)',
            passwordEntered: !!password
        });

        if (!email || !password) {
            logger.warn('AUTH', 'Login validation failed - empty fields');
            showMessage(loginMessage, 'Please fill in all fields', 'error');
            return;
        }

        try {
            logger.debug('AUTH', 'Sending login request to server');
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            logger.debug('AUTH', 'Login response received', {
                status: response.status,
                success: data.success
            });

            if (response.ok) {
                // Store authentication data
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userId', data.data.user._id);
                localStorage.setItem('username', data.data.user.username);

                logger.info('AUTH', 'Authentication successful, data stored in localStorage');
                showMessage(loginMessage, data.message || 'Login successful!', 'success');

                logger.debug('AUTH', 'Stored auth data', {
                    token: data.data.token ? 'JWT_TOKEN_PRESENT' : 'MISSING',
                    userId: data.data.user?._id || 'MISSING',
                    username: data.data.user?.username || 'MISSING'
                });

                // Redirect to chat page
                logger.info('AUTH', 'About to set timeout for redirect');
                setTimeout(() => {
                    logger.info('AUTH', 'Timeout fired, redirecting now');
                    window.location.href = '/index.html';
                    logger.info('AUTH', 'Redirect command issued');
                }, 1000);
                logger.info('AUTH', 'Timeout has been set');
            } else {
                logger.warn('AUTH', 'Login failed', { message: data.message });
                showMessage(loginMessage, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            logger.error('AUTH', 'Login request failed', error);
            showMessage(loginMessage, 'Connection error. Please try again.', 'error');
        }
    });

    // Registration form submission
    registerForm.addEventListener('submit', async (e) => {
        logger.info('AUTH', 'Register form submitted');
        e.preventDefault();
        clearMessages();

        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();

        logger.debug('AUTH', 'Register form data', {
            username: username ? `${username.substring(0, 3)}...` : '(empty)',
            email: email ? `${email.substring(0, 3)}...` : '(empty)',
            passwordEntered: !!password,
            confirmPasswordEntered: !!confirmPassword,
            passwordsMatch: password === confirmPassword
        });

        if (!username || !email || !password || !confirmPassword) {
            logger.warn('AUTH', 'Registration validation failed - empty fields');
            showMessage(registerMessage, 'Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            logger.warn('AUTH', 'Registration validation failed - passwords do not match');
            showMessage(registerMessage, 'Passwords do not match', 'error');
            return;
        }

        try {
            logger.debug('AUTH', 'Sending registration request to server');
            const response = await fetch('http://localhost:8080/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            logger.debug('AUTH', 'Registration response received', {
                status: response.status,
                success: data.success
            });

            if (response.ok) {
                // Clear any existing auth data since we're registering a new user
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                logger.info('AUTH', 'Cleared existing auth data for new registration');
                
                // Show success message and switch to login tab
                const successMessage = 'Registration successful! Please login.';
                logger.info('AUTH', 'Registration successful, redirecting to login');

                // Redirect to login tab with success message
                window.location.href = `auth.html?message=${encodeURIComponent(successMessage)}`;
            } else {
                logger.warn('AUTH', 'Registration failed', { message: data.message });
                showMessage(registerMessage, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            logger.error('AUTH', 'Registration request failed', error);
            showMessage(registerMessage, 'Connection error. Please try again.', 'error');
        }
    });

    // Helper functions
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'auth-message';
        element.classList.add(`${type}-message`);
        logger.debug('AUTH', `Message displayed: ${type}`, { message });
    }

    function clearMessages() {
        logger.debug('AUTH', 'Clearing all messages');
        loginMessage.textContent = '';
        loginMessage.className = 'auth-message';
        registerMessage.textContent = '';
        registerMessage.className = 'auth-message';
    }

    // Password toggle functionality
    function setupPasswordToggles() {
        logger.debug('AUTH', 'Setting up password toggles');
        // Setup for login password
        const loginToggle = document.getElementById('login-toggle');
        const loginPassword = document.getElementById('login-password');
        const loginEye = document.getElementById('login-eye');

        if (loginToggle && loginPassword && loginEye) {
            loginToggle.addEventListener('click', () => {
                logger.debug('AUTH', 'Login password visibility toggled');
                togglePasswordVisibility(loginPassword, loginEye);
            });
        } else {
            logger.warn('AUTH', 'Missing login password toggle elements', {
                loginToggle: !!loginToggle,
                loginPassword: !!loginPassword,
                loginEye: !!loginEye
            });
        }

        // Setup for register password
        const registerToggle = document.getElementById('register-toggle');
        const registerPassword = document.getElementById('register-password');
        const registerEye = document.getElementById('register-eye');

        if (registerToggle && registerPassword && registerEye) {
            registerToggle.addEventListener('click', () => {
                logger.debug('AUTH', 'Register password visibility toggled');
                togglePasswordVisibility(registerPassword, registerEye);
            });
        } else {
            logger.warn('AUTH', 'Missing register password toggle elements');
        }

        // Setup for confirm password
        const confirmToggle = document.getElementById('register-confirm-toggle');
        const confirmPassword = document.getElementById('register-confirm-password');
        const confirmEye = document.getElementById('register-confirm-eye');

        if (confirmToggle && confirmPassword && confirmEye) {
            confirmToggle.addEventListener('click', () => {
                logger.debug('AUTH', 'Confirm password visibility toggled');
                togglePasswordVisibility(confirmPassword, confirmEye);
            });
        } else {
            logger.warn('AUTH', 'Missing confirm password toggle elements');
        }
    }

    function togglePasswordVisibility(inputElement, iconElement) {
        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            iconElement.className = 'fa-regular fa-eye';
        } else {
            inputElement.type = 'password';
            iconElement.className = 'fa-regular fa-eye-slash';
        }
        logger.debug('AUTH', `Password visibility changed to ${inputElement.type}`);
    }

    logger.info('AUTH', 'Authentication script fully initialized');
});
