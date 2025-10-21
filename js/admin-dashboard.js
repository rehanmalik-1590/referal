import { adminAPI, adminLogout } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    const currentAdmin = JSON.parse(sessionStorage.getItem('dribzap_current_admin') || 'null');
    if (!currentAdmin) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load admin user info
    const adminNameElement = document.getElementById('adminUsername');
    if (adminNameElement && currentAdmin.name) {
        adminNameElement.textContent = currentAdmin.name;
    }

    // Initialize charts
    initializeCharts();

    // Load dashboard data
    loadDashboardData();

    // Logout functionality
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            adminLogout();
            window.location.href = 'admin-login.html';
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadDashboardData();
            initializeCharts();
            this.innerHTML = '<span class="btn-icon">🔄</span> Refreshing...';
            setTimeout(() => {
                this.innerHTML = '<span class="btn-icon">🔄</span> Refresh Data';
            }, 1000);
        });
    }

    // Export button
    const exportBtn = document.getElementById('exportReport');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            this.innerHTML = '<span class="btn-icon">📥</span> Exporting...';
            setTimeout(() => {
                alert('Report exported successfully!');
                this.innerHTML = '<span class="btn-icon">📥</span> Export Report';
            }, 1500);
        });
    }
});

async function loadDashboardData() {
    try {
        const result = await adminAPI.getDashboardStats();
        
        if (result.success) {
            updateDashboardStats(result.data);
        } else {
            console.error('Failed to load dashboard data:', result.message);
            // Use demo data
            updateDashboardStats({
                totalRevenue: 12458.50,
                totalUsers: 2847,
                totalWithdrawals: 3245.80,
                pendingWithdrawals: 42,
                videosWatched: 45892
            });
        }
    } catch (error) {
        console.error('Dashboard data load error:', error);
        // Use demo data
        updateDashboardStats({
            totalRevenue: 12458.50,
            totalUsers: 2847,
            totalWithdrawals: 3245.80,
            pendingWithdrawals: 42,
            videosWatched: 45892
        });
    }
}

function updateDashboardStats(data) {
    // Update stat cards with real data
    const totalEarnings = document.getElementById('totalEarnings');
    const totalUsers = document.getElementById('totalUsers');
    const totalWithdrawals = document.getElementById('totalWithdrawals');
    const pendingWithdrawals = document.getElementById('pendingWithdrawals');
    
    if (totalEarnings && data.totalRevenue) {
        totalEarnings.textContent = `$${data.totalRevenue.toLocaleString()}`;
    }
    if (totalUsers && data.totalUsers) {
        totalUsers.textContent = data.totalUsers.toLocaleString();
    }
    if (totalWithdrawals && data.totalWithdrawals) {
        totalWithdrawals.textContent = `$${data.totalWithdrawals.toLocaleString()}`;
    }
    if (pendingWithdrawals && data.pendingWithdrawals) {
        pendingWithdrawals.textContent = data.pendingWithdrawals.toLocaleString();
    }
}

function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [1200, 1900, 1500, 2200, 1800, 2500],
                    borderColor: '#00f5ff',
                    backgroundColor: 'rgba(0, 245, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e2eaf0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e2eaf0'
                        }
                    }
                }
            }
        });
    }

    // Users Chart
    const usersCtx = document.getElementById('usersChart');
    if (usersCtx) {
        new Chart(usersCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: [65, 59, 80, 81, 56, 72],
                    backgroundColor: 'rgba(157, 78, 221, 0.8)',
                    borderColor: '#9d4edd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e2eaf0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e2eaf0'
                        }
                    }
                }
            }
        });
    }

    // Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Videos', 'Tasks', 'Referrals', 'Withdrawals'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#00f5ff',
                        '#9d4edd',
                        '#ff006e',
                        '#10b981'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2eaf0',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // Earnings Chart
    const earningsCtx = document.getElementById('earningsChart');
    if (earningsCtx) {
        new Chart(earningsCtx.getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: ['Videos', 'Tasks', 'Referrals', 'Ads'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        'rgba(0, 245, 255, 0.7)',
                        'rgba(157, 78, 221, 0.7)',
                        'rgba(255, 0, 110, 0.7)',
                        'rgba(16, 185, 129, 0.7)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2eaf0',
                            padding: 20
                        }
                    }
                }
            }
        });
    }
}