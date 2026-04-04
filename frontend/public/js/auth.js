/*
--This script manages user authentication on the frontend. 
--It handles signup, login, logout, and session validation by communicating with the backend authentication API. 
--The script stores the JWT token in localStorage, ensures only authenticated users can access protected pages, 
and redirects users to the appropriate pages based on their login status. */
// Authentication helper script

// useful globals: API_BASE_URL, getAuthHeaders()

// perform redirection if not authenticated
function ensureAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) {
        // if user is not on login/signup page, redirect
        const path = window.location.pathname.split('/').pop();
        if (path !== 'login.html' && path !== 'signup.html') {
            window.location.href = 'login.html';
        }
    }
}

// if already logged in, steer away from login/signup
function redirectIfAuthenticated() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'index.html';
    }
}

/**
 * Send signup request to backend
 */
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + '/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        // store token and redirect
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
    } catch (err) {
        alert('Signup error: ' + err.message);
    }
}

/**
 * Send login request to backend
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
    } catch (err) {
        alert('Login error: ' + err.message);
    }
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

// Attach to global for use in HTML onclick
window.logout = logout;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.ensureAuthenticated = ensureAuthenticated;
window.redirectIfAuthenticated = redirectIfAuthenticated;

// run guard on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname.split('/').pop();
        if (path === 'index.html' || path === '' || path === 'ats-checker.html') {
            ensureAuthenticated();
        } else if (path === 'login.html' || path === 'signup.html') {
            redirectIfAuthenticated();
        }
    });
}
