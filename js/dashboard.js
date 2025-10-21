import { userAPI, logout } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Check if user is admin and show admin panel link
    if (currentUser.isAdmin) {
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) {
            adminLink.style.display = 'block';
        }
    }

    // Load dashboard data
    await loadDashboardData();

    // Logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            window.location.href = 'index.html';
        });
    }
});

async function loadDashboardData() {
    try {
        const result = await userAPI.getDashboard();
        
        if (result.success) {
            const { user } = result.data;
            
            // Update welcome message
            const welcomeElement = document.getElementById('welcomeMessage');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome, ${user.fullName}`;
            }

            // Update stats
            updateStats(user);
        } else {
            alert('Failed to load dashboard: ' + result.message);
            // If not authenticated, redirect to login
            if (result.message.includes('authenticated')) {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        alert('Error loading dashboard data');
    }
}

function updateStats(user) {
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = `$${user.walletBalance?.toFixed(2) || '0.00'}`;
        statCards[1].textContent = user.videosWatched || 0;
        statCards[2].textContent = user.totalReferrals || 0;
        statCards[3].textContent = `$${user.walletBalance?.toFixed(2) || '0.00'}`;
    }
}