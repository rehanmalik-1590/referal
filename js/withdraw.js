import { paymentAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Show/hide account details based on withdrawal method
    const withdrawMethod = document.getElementById('withdrawMethod');
    const accountDetails = document.getElementById('accountDetails');
    
    if (withdrawMethod && accountDetails) {
        withdrawMethod.addEventListener('change', function() {
            if (this.value) {
                accountDetails.style.display = 'block';
                
                // Update placeholder based on method
                const accountInput = document.getElementById('accountInfo');
                if (this.value === 'paypal') {
                    accountInput.placeholder = 'Enter your PayPal email';
                } else if (this.value === 'bank') {
                    accountInput.placeholder = 'Enter your bank account number';
                } else {
                    accountInput.placeholder = 'Enter your account details';
                }
            } else {
                accountDetails.style.display = 'none';
            }
        });
    }

    // Withdrawal form submission
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const method = document.getElementById('withdrawMethod').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const accountInfo = document.getElementById('accountInfo').value;
            
            // Validation
            if (!method) {
                alert('Please select a withdrawal method');
                return;
            }
            
            if (!accountInfo) {
                alert('Please enter your account details');
                return;
            }
            
            if (amount < 5) {
                alert('Minimum withdrawal amount is $5');
                return;
            }

            const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
            if (currentUser && amount > currentUser.walletBalance) {
                alert('Insufficient balance');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            // Process withdrawal
            const result = await paymentAPI.requestWithdrawal(amount, method, accountInfo);
            
            if (result.success) {
                alert(`Withdrawal request submitted!\n$${amount} will be sent to your ${method} account\nProcessing time: 30-40 minutes`);
                
                // Reset form
                withdrawForm.reset();
                document.getElementById('accountDetails').style.display = 'none';
                
                // Update balance display
                updateBalanceDisplay();
                
            } else {
                alert('Error: ' + result.message);
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // Load withdrawal history
    loadWithdrawalHistory();

    // Update balance display
    updateBalanceDisplay();
});

async function loadWithdrawalHistory() {
    try {
        const result = await paymentAPI.getWithdrawalHistory();
        
        if (result.success) {
            updateWithdrawalHistory(result.data.withdrawals);
        }
    } catch (error) {
        console.error('Withdrawal history load error:', error);
    }
}

function updateWithdrawalHistory(withdrawals) {
    const historyContainer = document.querySelector('.withdrawal-history');
    if (historyContainer) {
        if (withdrawals && withdrawals.length > 0) {
            historyContainer.innerHTML = `
                <h2>Withdrawal History</h2>
                ${withdrawals.map(wd => `
                    <div class="history-item">
                        <span>${new Date(wd.createdAt).toLocaleDateString()}</span>
                        <span>${wd.method}</span>
                        <span>$${wd.amount.toFixed(2)}</span>
                        <span class="status ${wd.status}">${wd.status}</span>
                    </div>
                `).join('')}
            `;
        } else {
            // Show demo history
            historyContainer.innerHTML = `
                <h2>Withdrawal History</h2>
                <div class="history-item">
                    <span>2024-01-15</span>
                    <span>PayPal</span>
                    <span>$5.00</span>
                    <span class="status completed">Completed</span>
                </div>
            `;
        }
    }
}

function updateBalanceDisplay() {
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    const balance = currentUser?.walletBalance || 0;
    
    const balanceElement = document.querySelector('.balance-card h2');
    if (balanceElement) {
        balanceElement.textContent = `Available Balance: $${balance.toFixed(2)}`;
    }
    
    // Update amount input max value
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.max = balance;
        amountInput.min = 5; // Minimum withdrawal
    }
}