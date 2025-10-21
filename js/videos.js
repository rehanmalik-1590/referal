import { userAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('dribzap_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Video watching functionality
    const watchButtons = document.querySelectorAll('.btn-watch');
    
    watchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video');
            watchVideo(videoId, this);
        });
    });

    // Update video count
    updateVideoCount();
});

async function watchVideo(videoId, button) {
    // Disable button during watching
    button.disabled = true;
    button.textContent = 'Watching...';
    
    // Simulate video watching with timer
    let timeLeft = 5; // 5 seconds for demo
    const timer = setInterval(() => {
        button.textContent = `Watching... ${timeLeft}s`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            completeVideoWatching(videoId, button);
        }
    }, 1000);
}

async function completeVideoWatching(videoId, button) {
    const result = await userAPI.watchVideo(videoId);
    
    if (result.success) {
        // Update button
        button.textContent = 'Completed!';
        button.style.background = '#10b981';
        
        // Show success message
        alert(`Congratulations! You earned $${result.data.earnings}\nNew balance: $${result.data.newBalance.toFixed(2)}`);
        
        // Update video count
        updateVideoCount();
        
    } else {
        alert('Error: ' + result.message);
        button.textContent = 'Watch Now';
        button.disabled = false;
    }
    
    // Reset button after delay
    setTimeout(() => {
        button.disabled = false;
        button.textContent = 'Watch Now';
        button.style.background = '';
    }, 3000);
}

function updateVideoCount() {
    const videos = JSON.parse(sessionStorage.getItem('dribzap_videos') || '[]');
    const availableVideos = videos.filter(v => !v.watched).length;
    
    const videoCountElement = document.getElementById('videoCount');
    if (videoCountElement) {
        videoCountElement.textContent = availableVideos;
    }
    
    // Disable buttons if no videos left
    if (availableVideos === 0) {
        const buttons = document.querySelectorAll('.btn-watch');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.textContent = 'No Videos Available';
        });
    }
}