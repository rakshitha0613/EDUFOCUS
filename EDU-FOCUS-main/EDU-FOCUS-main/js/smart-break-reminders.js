class SmartBreakReminders {
    constructor() {
        this.focusSessions = [];
        this.breakHistory = [];
        this.reminderSettings = {
            autoRemind: true,
            reminderInterval: 25,
            breakDuration: 5,
            reminderMethod: 'notification'
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupListeners();
        this.renderBreakReminder();
        this.startMonitoring();
    }

    setupListeners() {
        document.getElementById('autoRemindToggle')?.addEventListener('change', (e) => {
            this.reminderSettings.autoRemind = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('reminderIntervalInput')?.addEventListener('change', (e) => {
            this.reminderSettings.reminderInterval = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('breakDurationInput')?.addEventListener('change', (e) => {
            this.reminderSettings.breakDuration = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('takeBreakNowBtn')?.addEventListener('click', () => this.takeBreakNow());
        document.getElementById('skipBreakBtn')?.addEventListener('click', () => this.skipBreak());
    }

    startMonitoring() {
        // Monitor focus level every 5 minutes
        setInterval(() => {
            this.checkFocusLevel();
        }, 5 * 60 * 1000);
    }

    checkFocusLevel() {
        // Calculate current focus level
        const recentFocusTime = this.getRecentFocusTime(30); // Last 30 minutes
        const focusLevel = Math.min(100, (recentFocusTime / 30) * 100);

        if (this.reminderSettings.autoRemind && focusLevel < 60) {
            this.suggestBreak(focusLevel);
        }
    }

    getRecentFocusTime(minutes) {
        const now = Date.now();
        const timeLimit = minutes * 60 * 1000;
        
        return this.focusSessions
            .filter(s => now - s.timestamp < timeLimit && s.focused)
            .reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    }

    suggestBreak(focusLevel) {
        const suggestions = this.generateBreakSuggestions(focusLevel);
        this.showBreakReminder(suggestions);
    }

    generateBreakSuggestions(focusLevel) {
        const suggestions = [];

        if (focusLevel < 40) {
            suggestions.push({
                activity: '🚶 Take a Walk',
                duration: 10,
                description: 'Stand up and walk around for 10 minutes to refresh',
                benefit: 'Improves circulation and mental clarity'
            });
        } else if (focusLevel < 60) {
            suggestions.push({
                activity: '☕ Drink Water',
                duration: 3,
                description: 'Stay hydrated - drink a glass of water',
                benefit: 'Improves brain function'
            });
        }

        suggestions.push({
            activity: '👀 Eye Exercise',
            duration: 2,
            description: 'Look away from screen and focus on distant object',
            benefit: 'Reduces eye strain'
        });

        suggestions.push({
            activity: '🧘 Quick Meditation',
            duration: 5,
            description: 'Take 5 minutes for breathing exercises',
            benefit: 'Reduces stress and improves focus'
        });

        suggestions.push({
            activity: '🎵 Music Break',
            duration: 5,
            description: 'Listen to uplifting music',
            benefit: 'Boosts mood and energy'
        });

        return suggestions;
    }

    showBreakReminder(suggestions) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const reminder = new Notification('Time for a Break! 🌟', {
                body: 'Your focus is dropping. Take a short break to recharge!',
                icon: '⏰'
            });
        }
    }

    takeBreakNow() {
        const breakStartTime = Date.now();
        const breakDuration = this.reminderSettings.breakDuration * 60 * 1000;

        this.breakHistory.push({
            startTime: breakStartTime,
            duration: this.reminderSettings.breakDuration,
            activity: 'break',
            timestamp: new Date().toISOString()
        });

        alert(`✅ Break started! You have ${this.reminderSettings.breakDuration} minutes. Focus on relaxing!`);

        // Set timer for break
        setTimeout(() => {
            alert(`⏰ Break complete! Ready to get back to studying?`);
            this.showFocusEncouragement();
        }, breakDuration);

        this.saveBreakHistory();
        this.renderBreakReminder();
    }

    skipBreak() {
        alert('💪 Stay focused! You\'re doing great. You can take a break in a few minutes.');
    }

    showFocusEncouragement() {
        const encouragements = [
            '🌟 You\'ve got this!',
            '💪 Keep up the momentum!',
            '🚀 Great job staying focused!',
            '👏 You\'re making progress!',
            '🎯 Focus like a champion!'
        ];

        const random = encouragements[Math.floor(Math.random() * encouragements.length)];
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Ready to Continue?', {
                body: random,
                icon: '🎓'
            });
        }
    }

    renderBreakReminder() {
        const container = document.getElementById('breakReminder');
        if (!container) return;

        const recentBreaks = this.breakHistory.slice(-5).reverse();
        const avgBreakInterval = this.calculateAverageBreakInterval();

        container.innerHTML = `
            <div class="break-reminder-section">
                <h2>⏰ Smart Break Reminders</h2>

                <div class="reminder-settings">
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="autoRemindToggle" ${this.reminderSettings.autoRemind ? 'checked' : ''}>
                            Auto-suggest breaks when focus drops
                        </label>
                    </div>

                    <div class="setting-item">
                        <label>Reminder Interval (minutes):</label>
                        <input type="number" id="reminderIntervalInput" min="10" max="60" 
                               value="${this.reminderSettings.reminderInterval}" class="setting-input">
                    </div>

                    <div class="setting-item">
                        <label>Break Duration (minutes):</label>
                        <input type="number" id="breakDurationInput" min="2" max="30" 
                               value="${this.reminderSettings.breakDuration}" class="setting-input">
                    </div>
                </div>

                <div class="break-actions">
                    <button id="takeBreakNowBtn" class="btn-primary">☕ Take Break Now</button>
                    <button id="skipBreakBtn" class="btn-secondary">💪 Keep Studying</button>
                </div>

                <div class="break-statistics">
                    <h3>📊 Break Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <span class="stat-label">Total Breaks Today</span>
                            <span class="stat-value">${this.breakHistory.filter(b => this.isToday(b.timestamp)).length}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Total Break Time</span>
                            <span class="stat-value">${this.getTotalBreakTime()} min</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Avg Break Interval</span>
                            <span class="stat-value">${avgBreakInterval} min</span>
                        </div>
                    </div>
                </div>

                <div class="break-history">
                    <h3>📋 Recent Breaks</h3>
                    <div class="history-list">
                        ${recentBreaks.length > 0 
                            ? recentBreaks.map((b, idx) => `
                                <div class="history-item">
                                    <span class="break-time">${new Date(b.timestamp).toLocaleTimeString()}</span>
                                    <span class="break-duration">${b.duration} minutes</span>
                                </div>
                            `).join('')
                            : '<p>No breaks taken yet. Stay hydrated and take breaks regularly!</p>'
                        }
                    </div>
                </div>

                <div class="break-tips">
                    <h3>💡 Break Activity Ideas</h3>
                    <div class="tips-grid">
                        <div class="tip-card">
                            <h4>🚶 Physical Activity</h4>
                            <p>Walk around, stretch, or do light exercises</p>
                        </div>
                        <div class="tip-card">
                            <h4>👀 Eye Care</h4>
                            <p>Look away from screen and focus on distance</p>
                        </div>
                        <div class="tip-card">
                            <h4>🧘 Mindfulness</h4>
                            <p>Meditate or practice deep breathing</p>
                        </div>
                        <div class="tip-card">
                            <h4>☕ Hydration</h4>
                            <p>Drink water and eat a healthy snack</p>
                        </div>
                        <div class="tip-card">
                            <h4>🎵 Music</h4>
                            <p>Listen to uplifting music</p>
                        </div>
                        <div class="tip-card">
                            <h4>📞 Social</h4>
                            <p>Chat with a friend or family member</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Reattach listeners
        this.setupListeners();
    }

    isToday(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getTotalBreakTime() {
        return this.breakHistory
            .filter(b => this.isToday(b.timestamp))
            .reduce((sum, b) => sum + b.duration, 0);
    }

    calculateAverageBreakInterval() {
        if (this.breakHistory.length < 2) return 'N/A';

        const intervals = [];
        for (let i = 1; i < this.breakHistory.length; i++) {
            const diff = (this.breakHistory[i].timestamp - this.breakHistory[i-1].timestamp) / (60 * 1000);
            intervals.push(diff);
        }

        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return Math.round(avg);
    }

    saveSettings() {
        localStorage.setItem('breakReminderSettings', JSON.stringify(this.reminderSettings));
    }

    loadSettings() {
        const saved = localStorage.getItem('breakReminderSettings');
        if (saved) {
            this.reminderSettings = { ...this.reminderSettings, ...JSON.parse(saved) };
        }
    }

    saveBreakHistory() {
        localStorage.setItem('breakHistory', JSON.stringify(this.breakHistory));
    }

    loadBreakHistory() {
        const saved = localStorage.getItem('breakHistory');
        this.breakHistory = saved ? JSON.parse(saved) : [];
    }
}

// Global reference
let smartBreakReminders;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('breakReminder')) {
        smartBreakReminders = new SmartBreakReminders();
    }
});
