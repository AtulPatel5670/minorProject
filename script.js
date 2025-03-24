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

// Form submission logic
document.getElementById("authForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        document.getElementById("error-message").textContent = "Please fill out all fields.";
        return;
    }

    if (isLogin) {
        const storedData = JSON.parse(localStorage.getItem("users")) || [];
        const user = storedData.find(u => u.username === username && u.password === password);
        if (user) {
            if (document.getElementById("rememberMe").checked) {
                localStorage.setItem("rememberedUser", username);
            } else {
                localStorage.removeItem("rememberedUser");
            }
            alert("Login successful!");
            window.location.href = "home.html";
        } else {
            document.getElementById("error-message").textContent = "Invalid username or password.";
        }
    } else {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            document.getElementById("error-message").textContent = "Username already exists.";
        } else {
            users.push({ username, password });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Account created successfully! Please log in.");
            isLogin = true;
            document.getElementById("form-title").textContent = "Login";
            document.querySelector("button").textContent = "Login";
            document.getElementById("toggleForm").textContent = "Don't have an account? Sign up";
            document.getElementById("rememberMeContainer").style.display = "flex";
        }
    }
});

// Show/Hide Password Toggle
document.getElementById("showPassword").addEventListener("change", function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type = this.checked ? "text" : "password";
});

// Google Sign-In Configuration
window.onload = function () {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
        document.getElementById("username").value = rememberedUser;
        document.getElementById("rememberMe").checked = true;
    }

    google.accounts.id.initialize({
        client_id: "553504102-u9ba2l6tvtjbd1o5sjlklje6578ef65n.apps.googleusercontent.com",
        callback: handleGoogleLogin,
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large"} // Customize the button style
    );
};

// Google Login Callback
function handleGoogleLogin(response) {
    const userCredential = jwt_decode(response.credential);
    console.log("Google User:", userCredential);

    // Save user details in localStorage for session purposes
    localStorage.setItem("googleUser", JSON.stringify(userCredential));
    alert("Login successful with Google!");
    window.location.href = "home.html";
}

