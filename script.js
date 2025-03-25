let isLogin = true;

// Toggle between Login and Sign Up
document.getElementById("toggleForm").addEventListener("click", function () {
    isLogin = !isLogin;
    document.getElementById("form-title").textContent = isLogin ? "Login" : "Sign Up";
    document.querySelector("button").textContent = isLogin ? "Login" : "Sign Up";
    document.getElementById("toggleForm").textContent = isLogin
        ? "Don't have an account? Sign up"
        : "Already have an account? Login";
    document.getElementById("rememberMeContainer").style.display = isLogin ? "flex" : "none";
});

// Password hashing function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Input validation
function validateInput(username, password) {
    const errors = [];
    if (username.length < 3) {
        errors.push("Username must be at least 3 characters long");
    }
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    return errors;
}

// Rate limiting
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkLoginAttempts(username) {
    const attempts = loginAttempts.get(username) || { count: 0, timestamp: Date.now() };
    if (attempts.count >= MAX_ATTEMPTS) {
        const timeLeft = LOCKOUT_TIME - (Date.now() - attempts.timestamp);
        if (timeLeft > 0) {
            return Math.ceil(timeLeft / 60000); // Convert to minutes
        }
        attempts.count = 0;
    }
    loginAttempts.set(username, attempts);
    return 0;
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form submission logic
document.getElementById("authForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = "";

    const usernameOrEmail = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usernameOrEmail || !password) {
        errorElement.textContent = "Please fill out all fields.";
        return;
    }

    if (isLogin) {
        const lockoutMinutes = checkLoginAttempts(usernameOrEmail);
        if (lockoutMinutes > 0) {
            errorElement.textContent = `Account is locked. Please try again in ${lockoutMinutes} minutes.`;
            return;
        }

        const storedData = JSON.parse(localStorage.getItem("users")) || [];
        let user;
        
        // Check if input is email or username
        if (isValidEmail(usernameOrEmail)) {
            user = storedData.find(u => u.email === usernameOrEmail);
        } else {
            user = storedData.find(u => u.username === usernameOrEmail);
        }
        
        if (user && user.password === await hashPassword(password)) {
            const attempts = loginAttempts.get(usernameOrEmail);
            if (attempts) {
                attempts.count = 0;
            }
            
            if (document.getElementById("rememberMe").checked) {
                localStorage.setItem("rememberedUser", usernameOrEmail);
            } else {
                localStorage.removeItem("rememberedUser");
            }
            
            // Create session token
            const sessionToken = await hashPassword(usernameOrEmail + Date.now());
            localStorage.setItem("currentSession", JSON.stringify({
                username: user.username,
                email: user.email,
                name: user.name,
                picture: user.picture,
                token: sessionToken,
                timestamp: Date.now()
            }));
            
            showSuccessMessage("Login successful!");
            setTimeout(() => window.location.href = "home.html", 1000);
        } else {
            const attempts = loginAttempts.get(usernameOrEmail) || { count: 0, timestamp: Date.now() };
            attempts.count++;
            loginAttempts.set(usernameOrEmail, attempts);
            
            errorElement.textContent = "Invalid username/email or password.";
            if (attempts.count >= MAX_ATTEMPTS) {
                errorElement.textContent = `Account locked for ${LOCKOUT_TIME/60000} minutes due to too many failed attempts.`;
            }
        }
    } else {
        // For sign up, validate email if provided
        if (isValidEmail(usernameOrEmail)) {
            const validationErrors = validateInput(usernameOrEmail.split('@')[0], password);
            if (validationErrors.length > 0) {
                errorElement.textContent = validationErrors.join("\n");
                return;
            }

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.some(u => u.email === usernameOrEmail || u.username === usernameOrEmail.split('@')[0]);
            if (userExists) {
                errorElement.textContent = "Email or username already exists.";
            } else {
                const hashedPassword = await hashPassword(password);
                users.push({ 
                    username: usernameOrEmail.split('@')[0],
                    email: usernameOrEmail,
                    password: hashedPassword 
                });
                localStorage.setItem("users", JSON.stringify(users));
                showSuccessMessage("Account created successfully! Please log in.");
                setTimeout(() => {
                    isLogin = true;
                    document.getElementById("form-title").textContent = "Login";
                    document.querySelector("button").textContent = "Login";
                    document.getElementById("toggleForm").textContent = "Don't have an account? Sign up";
                    document.getElementById("rememberMeContainer").style.display = "flex";
                }, 1500);
            }
        } else {
            errorElement.textContent = "Please enter a valid email address for sign up.";
        }
    }
});

// Success message animation
function showSuccessMessage(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.style.color = "green";
    errorElement.style.animation = "fadeIn 0.5s ease-in";
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Show/Hide Password Toggle
document.getElementById("showPassword").addEventListener("change", function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type = this.checked ? "text" : "password";
});

// Google Sign-In Configuration
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: '553504102-u9ba2l6tvtjbd1o5sjlklje6578ef65n.apps.googleusercontent.com',
        callback: handleGoogleLogin,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignIn'),
        { theme: 'outline', size: 'large', width: '100%' }
    );
}

// Handle Google Login
async function handleGoogleLogin(response) {
    try {
        const payload = jwt_decode(response.credential);
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === payload.email);

        if (!existingUser) {
            // Create new user
            const newUser = {
                username: payload.email.split('@')[0],
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                isGoogleUser: true
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Set current session
        const currentSession = {
            username: payload.email.split('@')[0],
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            isGoogleUser: true
        };
        localStorage.setItem('currentSession', JSON.stringify(currentSession));

        // Show success message and redirect
        showSuccessMessage('Successfully logged in with Google!');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);

    } catch (error) {
        console.error('Google login error:', error);
        document.getElementById('error-message').textContent = 'Failed to login with Google. Please try again.';
    }
}

// Initialize Google Sign-In when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
        window.location.href = 'home.html';
        return;
    }

    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
        initializeGoogleSignIn();
    }

    // Rest of your existing DOMContentLoaded code...
});

