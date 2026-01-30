class WelcomeSystem {
    constructor() {
        this.init();
    }

    init() {
        this.displayUserName();
        this.animateElements();
        this.setupEventListeners();
    }

    displayUserName() {
        const userSession = localStorage.getItem('userSession');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (userSession && welcomeMessage) {
            const userData = JSON.parse(userSession);
            const name = userData.fullName || userData.username || 'there';
            const firstName = name.split(' ')[0];
            
            welcomeMessage.textContent = `Welcome back, ${firstName}! Ready to continue your learning journey?`;
            
            // Add personalized animation
            setTimeout(() => {
                welcomeMessage.style.background = 'linear-gradient(45deg, #667eea, #764ba2, #f093fb)';
                welcomeMessage.style.backgroundSize = '200% 200%';
                welcomeMessage.style.webkitBackgroundClip = 'text';
                welcomeMessage.style.webkitTextFillColor = 'transparent';
                welcomeMessage.style.animation = 'gradientShift 3s ease infinite';
            }, 1000);
        }
    }

    animateElements() {
        // Add staggered animation to feature items
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 1500 + (index * 200));
        });

        // Add button animations
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                button.style.opacity = '1';
                button.style.transform = 'scale(1)';
            }, 2200 + (index * 150));
        });
    }

    setupEventListeners() {
        // Add CSS for gradient animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);
    }

    simulateProgress() {
        const progressContainer = document.querySelector('.progress-container');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.querySelector('.progress-text');
        
        progressContainer.classList.add('show');
        
        const messages = [
            'Setting up your workspace...',
            'Loading AI models...',
            'Initializing focus tracking...',
            'Preparing study materials...',
            'Almost ready!'
        ];
        
        let progress = 0;
        let messageIndex = 0;
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            
            if (messageIndex < messages.length - 1 && progress > (messageIndex + 1) * 20) {
                messageIndex++;
                progressText.textContent = messages[messageIndex];
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                progressText.textContent = 'Ready to go!';
                
                setTimeout(() => {
                    this.transitionToMainApp();
                }, 1000);
            }
        }, 200);
    }

    transitionToMainApp() {
        // Create a smooth transition effect
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 600);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `welcome-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions
function startLearning() {
    const welcomeSystem = new WelcomeSystem();
    welcomeSystem.showNotification('Starting your learning session...', 'success');
    welcomeSystem.simulateProgress();
}

function takeTour() {
    const welcomeSystem = new WelcomeSystem();
    welcomeSystem.showNotification('Tour feature coming soon!', 'info');
    
    // For now, just go to main app after a delay
    setTimeout(() => {
        welcomeSystem.transitionToMainApp();
    }, 2000);
}

function skipIntro() {
    if (confirm('Are you sure you want to skip the introduction?')) {
        const welcomeSystem = new WelcomeSystem();
        welcomeSystem.transitionToMainApp();
    }
}

// Initialize welcome system
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeSystem();
    
    // Add some interactive hover effects
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(-5px) scale(1)';
        });
    });
    
    // Add click effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            button.style.position = 'relative';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);