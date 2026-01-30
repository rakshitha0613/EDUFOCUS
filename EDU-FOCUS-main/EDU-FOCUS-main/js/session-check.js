class SessionManager {
    constructor() {
        this.initializeSession();
    }

    initializeSession() {
        this.checkLoginStatus();
    }

    checkLoginStatus() {
        // Don't redirect if we're already on login or welcome pages
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('welcome.html')) {
            return true;
        }

        const userSession = localStorage.getItem('userSession');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (!userSession && !rememberMe) {
            this.redirectToLogin();
            return false;
        }
        
        if (userSession) {
            try {
                const session = JSON.parse(userSession);
                const currentTime = new Date().getTime();
                
                // Check if session has expired (8 hours)
                if (currentTime - session.timestamp > (8 * 60 * 60 * 1000)) {
                    this.clearSession();
                    this.redirectToLogin();
                    return false;
                }
                
                // Update last activity
                session.lastActivity = currentTime;
                localStorage.setItem('userSession', JSON.stringify(session));
                return true;
            } catch (error) {
                console.error('Invalid session data:', error);
                this.clearSession();
                this.redirectToLogin();
                return false;
            }
        }
        
        // If rememberMe is set but no active session, allow access
        if (rememberMe) {
            return true;
        }
        
        return false;
    }

    redirectToLogin() {
        // Add a smooth transition before redirect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 300);
    }

    clearSession() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userPreferences');
    }

    getUserInfo() {
        const session = localStorage.getItem('userSession');
        if (session) {
            return JSON.parse(session);
        }
        return null;
    }

    displayUserInfo() {
        const userInfo = this.getUserInfo();
        if (userInfo) {
            // Update user display elements
            const userNameElements = document.querySelectorAll('.user-name');
            const userAvatarElements = document.querySelectorAll('.user-avatar');
            
            userNameElements.forEach(element => {
                element.textContent = userInfo.fullName || userInfo.username || 'Student';
            });
            
            userAvatarElements.forEach(element => {
                if (userInfo.avatar) {
                    element.src = userInfo.avatar;
                } else {
                    // Generate initials avatar
                    const initials = (userInfo.fullName || userInfo.username || 'U').charAt(0).toUpperCase();
                    element.textContent = initials;
                    element.style.backgroundColor = this.generateAvatarColor(userInfo.username || 'user');
                }
            });
        }
    }

    generateAvatarColor(username) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
        const hash = username.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    updateActivity() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            const session = JSON.parse(userSession);
            session.lastActivity = new Date().getTime();
            localStorage.setItem('userSession', JSON.stringify(session));
        }
    }

    extendSession() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            const session = JSON.parse(userSession);
            session.timestamp = new Date().getTime();
            localStorage.setItem('userSession', JSON.stringify(session));
        }
    }
}

// Global logout function
function logout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        // Clear all session data
        localStorage.removeItem('userSession');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('focusData');
        localStorage.removeItem('studyProgress');
        
        // Add logout animation
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
        document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Show logout message
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <div class="logout-content">
                <i class="fas fa-check-circle"></i>
                <span>Logged out successfully!</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Track user activity to extend session
function trackUserActivity() {
    let activityTimer;
    
    const resetTimer = () => {
        clearTimeout(activityTimer);
        sessionManager.updateActivity();
        
        // Auto-extend session after 30 minutes of activity
        activityTimer = setTimeout(() => {
            sessionManager.extendSession();
        }, 30 * 60 * 1000);
    };
    
    // Track various user interactions
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('click', resetTimer);
    document.addEventListener('scroll', resetTimer);
    document.addEventListener('touchstart', resetTimer);
}

// Initialize session management
const sessionManager = new SessionManager();

// Wait for DOM to load before displaying user info
document.addEventListener('DOMContentLoaded', () => {
    sessionManager.displayUserInfo();
    trackUserActivity();
    
    // Update user activity every 5 minutes
    setInterval(() => {
        sessionManager.updateActivity();
    }, 5 * 60 * 1000);
});