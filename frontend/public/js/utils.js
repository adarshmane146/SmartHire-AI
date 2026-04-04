/**
--This file contains frontend utility functions used across the application. 
--It defines the backend API base URL, authentication header helper, tab navigation, loading indicators, and UI helper functions such as formatting numbers, dates, and displaying success or error messages. 
--These utilities help simplify API requests and user interface interactions in the portal.
 * ========================================
 * Frontend Utilities
 * Helper functions for UI interactions
 * ========================================
 */

// Backend API URL – for local development we always talk to the API on localhost:3000.
// Using window.location.origin can inadvertently resolve to the machine's network address
// (e.g. "http://10.165.218.174:3001") when the browser is opened from another interface.
// To keep everything on 127.0.0.1 and avoid cross‑host issues, hardcode the address here.
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper to retrieve headers with authentication token (if available)
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// expose for other scripts if needed
window.API_BASE_URL = API_BASE_URL;
window.getAuthHeaders = getAuthHeaders;

// Helper to retrieve headers with authentication token (if available)
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// expose for other scripts if needed
window.API_BASE_URL = API_BASE_URL;
window.getAuthHeaders = getAuthHeaders;

/**
 * Tab Navigation
 * Switch between different application tabs
 */
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all nav buttons
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab and mark button as active
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Mark the clicked button as active
    event.target.classList.add('active');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Show loading spinner
 */
function showLoading(show = true) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }
}

/**
 * Display error message
 */
function showError(message) {
    alert('❌ Error: ' + message);
}

/**
 * Display success message
 */
function showSuccess(message) {
    alert('✅ Success: ' + message);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

/**
 * Get match badge class based on percentage
 */
function getMatchBadgeClass(percentage) {
    if (percentage >= 75) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
}
