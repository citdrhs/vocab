// API variable is defined in shared/api.js

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
    document.getElementById("reg-error").textContent   = "";
    document.getElementById("reg-success").textContent = "";
}

function attemptLogin() {
    var username = document.getElementById("login-username").value.trim();
    var password = document.getElementById("login-password").value;
    var errorEl  = document.getElementById("login-error");

    errorEl.textContent = "";

    if (!username || !password) {
        errorEl.textContent = "Please enter both username and password.";
        return;
    }

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) {
            errorEl.textContent = data.error;
            return;
        }

        sessionStorage.setItem("logged_in", "true");
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("student_name", data.username);
        sessionStorage.setItem("class_num", data.class_num || "");

        if (data.role === "admin") {
            window.location.href = "../admin/admin.html";
        } else {
            window.location.href = "../index/index.html";
        }
    })
    .catch(function() {
        errorEl.textContent = "Could not connect to server. Is the server running?";
    });
}

function attemptRegister() {
    var username  = document.getElementById("reg-username").value.trim();
    var password  = document.getElementById("reg-password").value;
    var confirm   = document.getElementById("reg-confirm").value;
    var classNum  = document.getElementById("reg-class").value.trim();
    var errorEl   = document.getElementById("reg-error");
    var successEl = document.getElementById("reg-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!username || !password || !confirm || !classNum) {
        errorEl.textContent = "Please fill in all fields.";
        return;
    }

    if (password !== confirm) {
        errorEl.textContent = "Passwords do not match.";
        return;
    }

    fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password, class_num: classNum })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) {
            errorEl.textContent = data.error;
            return;
        }

        successEl.textContent = data.message;
        document.getElementById("reg-username").value = "";
        document.getElementById("reg-password").value = "";
        document.getElementById("reg-confirm").value  = "";
        document.getElementById("reg-class").value    = "";

        setTimeout(showLogin, 1500);
    })
    .catch(function() {
        errorEl.textContent = "Could not connect to server. Is the server running?";
    });
}