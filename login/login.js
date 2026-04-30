var ADMIN_USERNAME = "admin";
var ADMIN_PASSWORD = "admin123";
 
function login_onload() {
    // If already logged in, redirect appropriately
    if (sessionStorage.getItem("logged_in") === "true") {
        var role = sessionStorage.getItem("role");
        if (role === "admin") {
            window.location.href = "../admin/admin.html";
        } else {
            window.location.href = "../index/index.html";
        }
    }
 
    // Allow enter key on login fields
    document.getElementById("login-password").addEventListener("keydown", function(e) {
        if (e.key === "Enter") attemptLogin();
    });
    document.getElementById("login-username").addEventListener("keydown", function(e) {
        if (e.key === "Enter") attemptLogin();
    });
    document.getElementById("reg-confirm").addEventListener("keydown", function(e) {
        if (e.key === "Enter") attemptRegister();
    });
}
 
function showRegister() {
    document.getElementById("login-card").style.display = "none";
    document.getElementById("register-card").style.display = "block";
    clearErrors();
}
 
function showLogin() {
    document.getElementById("register-card").style.display = "none";
    document.getElementById("login-card").style.display = "block";
    clearErrors();
}
 
function clearErrors() {
    document.getElementById("login-error").textContent = "";
    document.getElementById("reg-error").textContent = "";
    document.getElementById("reg-success").textContent = "";
}
 
function attemptLogin() {
    var username = document.getElementById("login-username").value.trim();
    var password = document.getElementById("login-password").value;
    var errorEl  = document.getElementById("login-error");
 
    if (!username || !password) {
        errorEl.textContent = "Please enter both username and password.";
        return;
    }
 
    // Check admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("logged_in", "true");
        sessionStorage.setItem("role", "admin");
        sessionStorage.setItem("student_name", "Admin");
        window.location.href = "../admin/admin.html";
        return;
    }
 
    // Check student credentials
    var users = getUsers();
    var user = users.find(function(u) { return u.username === username; });
 
    if (!user) {
        errorEl.textContent = "Username not found.";
        return;
    }
 
    if (user.password !== hashPassword(password)) {
        errorEl.textContent = "Incorrect password.";
        return;
    }
 
    // Successful student login
    sessionStorage.setItem("logged_in", "true");
    sessionStorage.setItem("role", "student");
    sessionStorage.setItem("student_name", user.username);
    window.location.href = "../index/index.html";
}
 
function attemptRegister() {
    var username  = document.getElementById("reg-username").value.trim();
    var password  = document.getElementById("reg-password").value;
    var confirm   = document.getElementById("reg-confirm").value;
    var errorEl   = document.getElementById("reg-error");
    var successEl = document.getElementById("reg-success");
 
    errorEl.textContent = "";
    successEl.textContent = "";
 
    if (!username || !password || !confirm) {
        errorEl.textContent = "Please fill in all fields.";
        return;
    }
 
    if (username === ADMIN_USERNAME) {
        errorEl.textContent = "That username is not allowed.";
        return;
    }
 
    if (username.length < 3) {
        errorEl.textContent = "Username must be at least 3 characters.";
        return;
    }
 
    if (password.length < 6) {
        errorEl.textContent = "Password must be at least 6 characters.";
        return;
    }
 
    if (password !== confirm) {
        errorEl.textContent = "Passwords do not match.";
        return;
    }
 
    var users  = getUsers();
    var exists = users.find(function(u) { return u.username === username; });
 
    if (exists) {
        errorEl.textContent = "Username already taken.";
        return;
    }
 
    // Save new user
    users.push({ username: username, password: hashPassword(password) });
    localStorage.setItem("users", JSON.stringify(users));
 
    successEl.textContent = "Account created! You can now log in.";
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-password").value = "";
    document.getElementById("reg-confirm").value  = "";
 
    setTimeout(showLogin, 1500);
}
 
function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}
 
// Simple hash — replace with bcrypt when using a real backend
function hashPassword(password) {
    var hash = 0;
    for (var i = 0; i < password.length; i++) {
        var char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}