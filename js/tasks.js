import { userAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Task completion functionality
    const taskButtons = document.querySelectorAll('.btn-task');
    
    taskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskType = this.getAttribute('data-task');
            completeTask(taskType, this);
        });
    });
});

async function completeTask(taskType, button) {
    // Disable button during task
    button.disabled = true;
    button.textContent = 'Completing...';
    
    const result = await userAPI.completeTask(taskType);
    
    if (result.success) {
        // Update button
        button.textContent = 'Completed!';
        button.style.background = '#10b981';
        
        // Show success message
        alert(`Task completed! You earned $${result.data.earnings}\nNew balance: $${result.data.newBalance.toFixed(2)}`);
        
    } else {
        alert('Error: ' + result.message);
        button.textContent = 'Start Task';
        button.disabled = false;
    }
    
    // Reset button after delay
    setTimeout(() => {
        button.disabled = false;
        button.textContent = 'Start Task';
        button.style.background = '';
    }, 3000);
}