import { referralAPI } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load referral data
    await loadReferralData();

    // Copy referral link functionality
    const copyButton = document.getElementById('copyLink');
    const referralInput = document.getElementById('referralLink');
    
    if (copyButton && referralInput) {
        copyButton.addEventListener('click', function() {
            referralInput.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            copyButton.style.background = '#10b981';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.background = '';
            }, 2000);
        });
    }
});

async function loadReferralData() {
    try {
        // Get referral stats
        const statsResult = await referralAPI.getStats();
        const linkResult = await referralAPI.getLink();
        
        if (statsResult.success && linkResult.success) {
            updateReferralStats(statsResult.data);
            updateReferralLink(linkResult.data);
        } else {
            console.error('Failed to load referral data');
        }
    } catch (error) {
        console.error('Referral data load error:', error);
    }
}

function updateReferralStats(data) {
    // Update stat cards
    const statCards = document.querySelectorAll('.referral-stats .stat-card h3');
    if (statCards.length >= 3) {
        statCards[0].textContent = data.totalReferrals || 0;
        statCards[1].textContent = `$${data.totalEarnings?.toFixed(2) || '0.00'}`;
    }

    // Update referral list
    if (data.referrals && data.referrals.length > 0) {
        const referralList = document.querySelector('.referral-list');
        if (referralList) {
            referralList.innerHTML = '<h2>Your Referrals</h2>' +
                data.referrals.map(ref => `
                    <div class="referral-item">
                        <span>${ref.referredEmail}</span>
                        <span>Commission: $${ref.commission?.toFixed(2) || '0.00'}</span>
                    </div>
                `).join('');
        }
    } else {
        // Show demo referrals
        const referralList = document.querySelector('.referral-list');
        if (referralList) {
            referralList.innerHTML = `
                <h2>Your Referrals</h2>
                <div class="referral-item">
                    <span>user1@email.com</span>
                    <span>$2.50 earned</span>
                </div>
                <div class="referral-item">
                    <span>user2@email.com</span>
                    <span>$3.00 earned</span>
                </div>
            `;
        }
    }
}

function updateReferralLink(data) {
    const referralInput = document.getElementById('referralLink');
    if (referralInput && data.referralLink) {
        referralInput.value = data.referralLink;
    }
}