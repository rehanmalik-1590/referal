import { adminAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    const adminToken = sessionStorage.getItem('dribzap_current_admin');
    if (adminToken) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Authenticating...';
            submitBtn.disabled = true;

            // Demo admin credentials
            if (email === 'admin@dribzap.com' && password === 'admin123') {
                // Simulate API call
                setTimeout(() => {
                    const adminUser = {
                        id: 1,
                        name: 'Admin User',
                        email: 'admin@dribzap.com',
                        role: 'superadmin'
                    };
                    sessionStorage.setItem('dribzap_current_admin', JSON.stringify(adminUser));
                    submitBtn.textContent = 'Login Successful!';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                }, 1500);
                return;
            }

            const result = await adminAPI.login(email, password);
            
            if (result.success) {
                submitBtn.textContent = 'Login Successful!';
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                alert('Error: ' + result.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Admin register form (for demo purposes)
    const adminRegisterForm = document.getElementById('adminRegisterForm');
    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fullName = document.getElementById('adminFullName').value;
            const email = document.getElementById('adminRegEmail').value;
            const password = document.getElementById('adminRegPassword').value;
            const confirmPassword = document.getElementById('adminConfirmPassword').value;
            const secretKey = document.getElementById('adminSecretKey').value;

            // Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }

            if (secretKey !== 'ADMIN_SECRET_2024') {
                alert('Invalid admin secret key');
                return;
            }

            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Admin Account...';
            submitBtn.disabled = true;

            // For demo - just show success message
            setTimeout(() => {
                alert('Admin account created successfully! Please login with:\nEmail: ' + email + '\nPassword: ' + password);
                document.querySelector('[data-tab="login"]').click();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
});