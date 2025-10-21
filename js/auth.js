import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = sessionStorage.getItem('dribzap_current_user');
    if (token) {
        // Redirect to dashboard if already logged in
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            const result = await authAPI.login(email, password);
            
            if (result.success) {
                alert('Login successful!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Error: ' + result.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const referralCode = getReferralCodeFromURL();

            // Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;

            const userData = {
                fullName: fullname,
                email,
                password,
                referralCode: referralCode
            };

            const result = await authAPI.signup(userData);
            
            if (result.success) {
                alert('Registration successful!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Error: ' + result.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Get referral code from URL
function getReferralCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}