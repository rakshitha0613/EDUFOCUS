// Main Application JavaScript
class EduFocusApp {
    constructor() {
        this.currentSection = 'home';
        this.userData = this.loadUserData();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadUserProfile();
        this.updateDashboard();
    }

    // Navigation Management
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
                
                // Close mobile menu
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Initialize section-specific features
        this.initializeSectionFeatures(sectionId);
    }

    initializeSectionFeatures(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'focus-tracker':
                if (window.focusTracker) {
                    window.focusTracker.init();
                }
                break;
            case 'pdf-summarizer':
                if (window.pdfSummarizer) {
                    window.pdfSummarizer.init();
                }
                break;
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // Focus sensitivity slider
        const focusSensitivity = document.getElementById('focus-sensitivity');
        if (focusSensitivity) {
            focusSensitivity.addEventListener('input', (e) => {
                this.updateFocusSensitivity(e.target.value);
            });
        }

        // Notifications toggle
        const notifications = document.getElementById('notifications');
        if (notifications) {
            notifications.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }

        // Subject cards
        document.querySelectorAll('.subject-card').forEach(card => {
            card.addEventListener('click', () => {
                const subject = card.onclick.toString().match(/showSubjectDetails\('([^']+)'\)/);
                if (subject && subject[1]) {
                    this.showSubjectDetails(subject[1]);
                }
            });
        });

        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showToolModal(card);
            });
        });
    }

    // User Data Management
    loadUserData() {
        const savedData = localStorage.getItem('eduFocusUserData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        return {
            profile: {
                name: 'Student',
                email: 'student@example.com'
            },
            stats: {
                totalStudyTime: 0,
                averageFocus: 0,
                pdfsSummarized: 0,
                studyStreak: 0
            },
            focusData: [],
            preferences: {
                focusSensitivity: 5,
                notifications: true,
                darkMode: false
            },
            achievements: ['first-session']
        };
    }

    saveUserData() {
        localStorage.setItem('eduFocusUserData', JSON.stringify(this.userData));
    }

    loadUserProfile() {
        const nameElement = document.getElementById('user-name');
        const emailElement = document.getElementById('user-email');
        const darkModeToggle = document.getElementById('dark-mode');
        const notificationsToggle = document.getElementById('notifications');
        const focusSensitivity = document.getElementById('focus-sensitivity');

        if (nameElement) nameElement.textContent = this.userData.profile.name;
        if (emailElement) emailElement.textContent = this.userData.profile.email;
        if (darkModeToggle) darkModeToggle.checked = this.userData.preferences.darkMode;
        if (notificationsToggle) notificationsToggle.checked = this.userData.preferences.notifications;
        if (focusSensitivity) focusSensitivity.value = this.userData.preferences.focusSensitivity;

        // Apply dark mode if enabled
        if (this.userData.preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // Dashboard Updates
    updateDashboard() {
        this.updateStats();
        this.updateActivityList();
        this.updateAchievements();
        
        // Initialize or refresh the focus chart
        if (window.dashboard) {
            setTimeout(() => {
                window.dashboard.setupChartData();
                window.dashboard.createFocusChart();
                console.log('Dashboard chart refreshed');
            }, 100);
        }
    }

    updateStats() {
        const totalStudyTimeElement = document.getElementById('total-study-time');
        const averageFocusElement = document.getElementById('average-focus');
        const pdfsSummarizedElement = document.getElementById('pdfs-summarized');
        const studyStreakElement = document.getElementById('study-streak');

        if (totalStudyTimeElement) {
            const hours = Math.floor(this.userData.stats.totalStudyTime / 60);
            const minutes = this.userData.stats.totalStudyTime % 60;
            totalStudyTimeElement.textContent = `${hours}h ${minutes}m`;
        }

        if (averageFocusElement) {
            averageFocusElement.textContent = `${this.userData.stats.averageFocus}%`;
        }

        if (pdfsSummarizedElement) {
            pdfsSummarizedElement.textContent = this.userData.stats.pdfsSummarized;
        }

        if (studyStreakElement) {
            studyStreakElement.textContent = this.userData.stats.studyStreak;
        }
    }

    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        // Clear existing activities except the welcome message
        const welcomeMessage = activityList.querySelector('.activity-item');
        activityList.innerHTML = '';

        // Add recent activities
        const activities = this.getRecentActivities();
        if (activities.length === 0) {
            activityList.appendChild(welcomeMessage);
        } else {
            activities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <i class="fas ${activity.icon}"></i>
                    <span>${activity.text}</span>
                    <small class="activity-time">${activity.time}</small>
                `;
                activityList.appendChild(activityItem);
            });
        }
    }

    getRecentActivities() {
        // This would typically come from a database or local storage
        const activities = JSON.parse(localStorage.getItem('eduFocusActivities') || '[]');
        return activities.slice(-10).reverse(); // Show last 10 activities, most recent first
    }

    addActivity(type, description) {
        const activities = JSON.parse(localStorage.getItem('eduFocusActivities') || '[]');
        const activity = {
            type,
            text: description,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            icon: this.getActivityIcon(type)
        };
        activities.push(activity);
        localStorage.setItem('eduFocusActivities', JSON.stringify(activities));
        
        // Update the activity list if dashboard is active
        if (this.currentSection === 'dashboard') {
            this.updateActivityList();
        }
    }

    getActivityIcon(type) {
        const icons = {
            'focus': 'fa-eye',
            'pdf': 'fa-file-pdf',
            'study': 'fa-book',
            'achievement': 'fa-trophy',
            'session': 'fa-play'
        };
        return icons[type] || 'fa-info-circle';
    }

    updateAchievements() {
        const achievements = document.querySelectorAll('.achievement');
        achievements.forEach(achievement => {
            const achievementName = achievement.querySelector('span').textContent;
            const isUnlocked = this.checkAchievement(achievementName);
            
            if (isUnlocked) {
                achievement.classList.remove('locked');
            } else {
                achievement.classList.add('locked');
            }
        });
    }

    checkAchievement(achievementName) {
        switch (achievementName) {
            case 'First Study Session':
                return this.userData.stats.totalStudyTime > 0;
            case '1 Hour Focused':
                return this.userData.stats.totalStudyTime >= 60;
            case '10 PDFs Summarized':
                return this.userData.stats.pdfsSummarized >= 10;
            case '7-Day Streak':
                return this.userData.stats.studyStreak >= 7;
            default:
                return false;
        }
    }

    // Settings Management
    toggleDarkMode(enabled) {
        this.userData.preferences.darkMode = enabled;
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        this.saveUserData();
    }

    updateFocusSensitivity(value) {
        this.userData.preferences.focusSensitivity = parseInt(value);
        this.saveUserData();
        
        // Update focus tracker sensitivity if it exists
        if (window.focusTracker) {
            window.focusTracker.updateSensitivity(value);
        }
    }

    toggleNotifications(enabled) {
        this.userData.preferences.notifications = enabled;
        this.saveUserData();
        
        if (enabled) {
            this.requestNotificationPermission();
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('EduFocus', {
                    body: 'Notifications enabled! We\'ll keep you updated on your progress.',
                    icon: '/favicon.ico'
                });
            }
        }
    }

    // Subject Details
    showSubjectDetails(subject) {
        const modal = this.createModal(`${subject.charAt(0).toUpperCase() + subject.slice(1)} Resources`, this.getSubjectContent(subject));
        document.body.appendChild(modal);
    }

    getSubjectContent(subject) {
        const contentMap = {
            mathematics: `
                <div class="subject-resources">
                    <h4>Available Resources</h4>
                    <ul>
                        <li><i class="fas fa-book"></i> Algebra Fundamentals</li>
                        <li><i class="fas fa-book"></i> Calculus I & II</li>
                        <li><i class="fas fa-book"></i> Statistics & Probability</li>
                        <li><i class="fas fa-book"></i> Linear Algebra</li>
                    </ul>
                    
                    <h4>Practice Tools</h4>
                    <ul>
                        <li><i class="fas fa-calculator"></i> Equation Solver</li>
                        <li><i class="fas fa-chart-line"></i> Graphing Tool</li>
                        <li><i class="fas fa-puzzle-piece"></i> Practice Problems</li>
                    </ul>
                </div>
            `,
            science: `
                <div class="subject-resources">
                    <h4>Physics</h4>
                    <ul>
                        <li><i class="fas fa-atom"></i> Mechanics</li>
                        <li><i class="fas fa-bolt"></i> Electricity & Magnetism</li>
                        <li><i class="fas fa-wave-square"></i> Waves & Optics</li>
                    </ul>
                    
                    <h4>Chemistry</h4>
                    <ul>
                        <li><i class="fas fa-flask"></i> Organic Chemistry</li>
                        <li><i class="fas fa-microscope"></i> Inorganic Chemistry</li>
                        <li><i class="fas fa-fire"></i> Physical Chemistry</li>
                    </ul>
                    
                    <h4>Biology</h4>
                    <ul>
                        <li><i class="fas fa-dna"></i> Genetics</li>
                        <li><i class="fas fa-leaf"></i> Botany</li>
                        <li><i class="fas fa-heartbeat"></i> Human Anatomy</li>
                    </ul>
                </div>
            `,
            'computer-science': `
                <div class="subject-resources">
                    <h4>Programming Languages</h4>
                    <ul>
                        <li><i class="fab fa-python"></i> Python</li>
                        <li><i class="fab fa-js-square"></i> JavaScript</li>
                        <li><i class="fab fa-java"></i> Java</li>
                        <li><i class="fas fa-code"></i> C++</li>
                    </ul>
                    
                    <h4>Core Concepts</h4>
                    <ul>
                        <li><i class="fas fa-sitemap"></i> Data Structures</li>
                        <li><i class="fas fa-project-diagram"></i> Algorithms</li>
                        <li><i class="fas fa-database"></i> Database Systems</li>
                        <li><i class="fas fa-network-wired"></i> Computer Networks</li>
                    </ul>
                </div>
            `
        };
        
        return contentMap[subject] || `
            <div class="subject-resources">
                <p>Resources for ${subject} are being prepared. Check back soon!</p>
            </div>
        `;
    }

    // Tool Modal
    showToolModal(toolCard) {
        const toolName = toolCard.querySelector('h4').textContent;
        const toolDescription = toolCard.querySelector('p').textContent;
        
        const content = `
            <div class="tool-modal-content">
                <p>${toolDescription}</p>
                <div class="tool-actions">
                    <button class="btn btn-primary" onclick="app.launchTool('${toolName.toLowerCase().replace(/\s+/g, '-')}')">
                        Launch Tool
                    </button>
                </div>
            </div>
        `;
        
        const modal = this.createModal(toolName, content);
        document.body.appendChild(modal);
    }

    launchTool(toolId) {
        switch (toolId) {
            case 'flashcards':
                this.showNotification('Flashcards tool launching soon!');
                break;
            case 'pomodoro-timer':
                this.startPomodoroTimer();
                break;
            case 'todo-lists':
                this.showNotification('Todo lists tool launching soon!');
                break;
            case 'progress-tracker':
                this.showSection('dashboard');
                break;
            default:
                this.showNotification('Tool launching soon!');
        }
        this.closeModal();
    }

    startPomodoroTimer() {
        let timeLeft = 25 * 60; // 25 minutes
        const modal = this.createModal('Pomodoro Timer', `
            <div class="pomodoro-timer">
                <div class="timer-display" id="timer-display">25:00</div>
                <div class="timer-controls">
                    <button class="btn btn-primary" id="start-timer">Start</button>
                    <button class="btn btn-secondary" id="pause-timer" disabled>Pause</button>
                    <button class="btn btn-danger" id="reset-timer">Reset</button>
                </div>
                <div class="timer-phase">Focus Time</div>
            </div>
        `);
        
        document.body.appendChild(modal);
        
        let timerInterval;
        let isRunning = false;
        
        const startBtn = modal.querySelector('#start-timer');
        const pauseBtn = modal.querySelector('#pause-timer');
        const resetBtn = modal.querySelector('#reset-timer');
        const display = modal.querySelector('#timer-display');
        
        const updateDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                
                timerInterval = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        this.showNotification('Pomodoro session complete!');
                        this.addActivity('study', 'Completed a 25-minute focus session');
                        this.userData.stats.totalStudyTime += 25;
                        this.saveUserData();
                    }
                }, 1000);
            }
        });
        
        pauseBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        });
        
        resetBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            timeLeft = 25 * 60;
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            updateDisplay();
        });
    }

    // Modal Management
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Public Methods for Global Access
    updateStudyTime(minutes) {
        this.userData.stats.totalStudyTime += minutes;
        this.saveUserData();
        this.updateStats();
    }

    updateFocusStats(focusLevel) {
        this.userData.focusData.push({
            timestamp: Date.now(),
            focus: focusLevel
        });
        
        // Calculate average focus
        const totalFocus = this.userData.focusData.reduce((sum, data) => sum + data.focus, 0);
        this.userData.stats.averageFocus = Math.round(totalFocus / this.userData.focusData.length);
        
        this.saveUserData();
        this.updateStats();
    }

    incrementPdfCount() {
        this.userData.stats.pdfsSummarized++;
        this.saveUserData();
        this.updateStats();
    }
}

// Global Functions
window.showSection = function(sectionId) {
    if (window.app) {
        window.app.showSection(sectionId);
    }
};

window.showSubjectDetails = function(subject) {
    if (window.app) {
        window.app.showSubjectDetails(subject);
    }
};

window.resetPdfUpload = function() {
    if (window.pdfSummarizer) {
        window.pdfSummarizer.reset();
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EduFocusApp();
});

// Add modal styles to CSS
const modalStyles = `
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-xl);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: var(--dark-color);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--gray-600);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: var(--transition);
}

.modal-close:hover {
    background: var(--gray-100);
}

.modal-body {
    padding: 2rem;
}

.subject-resources h4 {
    margin: 1.5rem 0 1rem 0;
    color: var(--primary-color);
}

.subject-resources h4:first-child {
    margin-top: 0;
}

.subject-resources ul {
    list-style: none;
    padding: 0;
}

.subject-resources li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--gray-100);
}

.subject-resources li:last-child {
    border-bottom: none;
}

.subject-resources i {
    color: var(--primary-color);
    width: 20px;
}

.tool-actions {
    margin-top: 2rem;
    text-align: center;
}

.pomodoro-timer {
    text-align: center;
}

.timer-display {
    font-size: 4rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 2rem 0;
}

.timer-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.timer-phase {
    font-size: 1.2rem;
    color: var(--gray-600);
    font-weight: 500;
}

.notification {
    position: fixed;
    top: 90px;
    right: 20px;
    background: white;
    border-left: 4px solid var(--primary-color);
    box-shadow: var(--shadow-lg);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 9999;
    animation: slideIn 0.3s ease-in-out;
    max-width: 400px;
}

.notification i {
    color: var(--primary-color);
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray-600);
    font-size: 1.2rem;
    margin-left: auto;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);