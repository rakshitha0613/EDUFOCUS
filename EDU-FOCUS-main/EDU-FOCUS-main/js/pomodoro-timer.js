class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60; // 25 minutes default
        this.breakDuration = 5 * 60; // 5 minutes default
        this.isRunning = false;
        this.isWorkPhase = true;
        this.timeRemaining = this.workDuration;
        this.sessionsCompleted = 0;
        this.totalFocusTime = 0;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupListeners();
        this.updateDisplay();
        this.loadStats();
    }

    setupListeners() {
        document.getElementById('workInput')?.addEventListener('change', (e) => {
            this.workDuration = parseInt(e.target.value) * 60;
            this.resetTimer();
        });

        document.getElementById('breakInput')?.addEventListener('change', (e) => {
            this.breakDuration = parseInt(e.target.value) * 60;
        });

        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pause());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetTimer());
        document.getElementById('skipBtn')?.addEventListener('click', () => this.skipPhase());
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.interval = setInterval(() => this.tick(), 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    tick() {
        this.timeRemaining--;
        this.updateDisplay();

        if (this.timeRemaining <= 0) {
            this.phaseComplete();
        }

        // Low time warning (30 seconds)
        if (this.timeRemaining === 30) {
            this.playNotification();
        }
    }

    phaseComplete() {
        this.pause();
        this.playAlarm();
        
        if (this.isWorkPhase) {
            this.sessionsCompleted++;
            this.totalFocusTime += this.workDuration;
            this.showNotification('Work session complete!', 'Take a break now');
            this.isWorkPhase = false;
            this.timeRemaining = this.breakDuration;
        } else {
            this.showNotification('Break complete!', 'Ready for another session?');
            this.isWorkPhase = true;
            this.timeRemaining = this.workDuration;
        }

        this.saveStats();
        this.updateDisplay();
    }

    skipPhase() {
        this.pause();
        this.isWorkPhase = !this.isWorkPhase;
        this.timeRemaining = this.isWorkPhase ? this.workDuration : this.breakDuration;
        this.updateDisplay();
        document.getElementById('startBtn').disabled = false;
    }

    resetTimer() {
        this.pause();
        this.isWorkPhase = true;
        this.timeRemaining = this.workDuration;
        this.updateDisplay();
        document.getElementById('startBtn').disabled = false;
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
            timerDisplay.className = this.isWorkPhase ? 'work-phase' : 'break-phase';
        }

        const phaseLabel = document.getElementById('phaseLabel');
        if (phaseLabel) {
            phaseLabel.textContent = this.isWorkPhase ? 'Work Session' : 'Break Time';
        }

        const statsDisplay = document.getElementById('pomodoroStats');
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Sessions Completed</span>
                    <span class="stat-value">${this.sessionsCompleted}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Focus Time</span>
                    <span class="stat-value">${Math.floor(this.totalFocusTime / 60)} min</span>
                </div>
            `;
        }
    }

    playNotification() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    playAlarm() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                
                oscillator.frequency.value = 1000 + (i * 200);
                oscillator.type = 'sine';
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }, i * 250);
        }
    }

    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '⏲️' });
        }
    }

    saveStats() {
        const stats = {
            sessionsCompleted: this.sessionsCompleted,
            totalFocusTime: this.totalFocusTime,
            lastSessionDate: new Date().toISOString()
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    loadStats() {
        const saved = localStorage.getItem('pomodoroStats');
        if (saved) {
            const stats = JSON.parse(saved);
            this.sessionsCompleted = stats.sessionsCompleted || 0;
            this.totalFocusTime = stats.totalFocusTime || 0;
        }
    }

    saveSettings() {
        const settings = {
            workDuration: this.workDuration,
            breakDuration: this.breakDuration
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.workDuration = settings.workDuration || 25 * 60;
            this.breakDuration = settings.breakDuration || 5 * 60;
            this.timeRemaining = this.workDuration;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('timerDisplay')) {
        new PomodoroTimer();
    }
});
