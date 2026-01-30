class StudyPlanner {
    constructor() {
        this.sessions = [];
        this.init();
    }

    init() {
        this.loadSessions();
        this.setupListeners();
        this.renderCalendar();
        this.renderSessions();
        this.displayUpcomingSessions();
    }

    setupListeners() {
        document.getElementById('createSessionBtn')?.addEventListener('click', () => this.openSessionModal());
        document.getElementById('sessionForm')?.addEventListener('submit', (e) => this.saveSession(e));
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
    }

    openSessionModal() {
        document.getElementById('sessionModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('sessionModal').style.display = 'none';
        document.getElementById('sessionForm').reset();
    }

    saveSession(e) {
        e.preventDefault();

        const session = {
            id: Date.now(),
            subject: document.getElementById('subject').value,
            date: document.getElementById('sessionDate').value,
            time: document.getElementById('sessionTime').value,
            duration: parseInt(document.getElementById('duration').value),
            goals: document.getElementById('sessionGoals').value,
            status: 'scheduled'
        };

        this.sessions.push(session);
        this.saveSessions();
        this.closeModal();
        this.renderSessions();
        this.renderCalendar();
        this.displayUpcomingSessions();

        this.showNotification('Session Created', `${session.subject} scheduled for ${session.date} at ${session.time}`);
    }

    deleteSession(id) {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.saveSessions();
        this.renderSessions();
        this.renderCalendar();
        this.displayUpcomingSessions();
    }

    completeSession(id) {
        const session = this.sessions.find(s => s.id === id);
        if (session) {
            session.status = 'completed';
            this.saveSessions();
            this.renderSessions();
            this.displayUpcomingSessions();
            this.showNotification('Session Completed', `Great job on ${session.subject}!`);
        }
    }

    renderSessions() {
        const container = document.getElementById('sessionsList');
        if (!container) return;

        const sorted = this.sessions.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        container.innerHTML = sorted.map(session => `
            <div class="session-card ${session.status}">
                <div class="session-header">
                    <h3>${session.subject}</h3>
                    <span class="session-status">${session.status.toUpperCase()}</span>
                </div>
                <div class="session-details">
                    <p><strong>📅 Date:</strong> ${new Date(session.date).toLocaleDateString()}</p>
                    <p><strong>⏰ Time:</strong> ${session.time}</p>
                    <p><strong>⌛ Duration:</strong> ${session.duration} minutes</p>
                    <p><strong>🎯 Goals:</strong> ${session.goals}</p>
                </div>
                <div class="session-actions">
                    ${session.status === 'scheduled' ? `<button class="btn-complete" onclick="studyPlanner.completeSession(${session.id})">✓ Complete</button>` : ''}
                    <button class="btn-delete" onclick="studyPlanner.deleteSession(${session.id})">🗑 Delete</button>
                </div>
            </div>
        `).join('');

        if (sorted.length === 0) {
            container.innerHTML = '<p class="no-sessions">No study sessions planned. Create one to get started!</p>';
        }
    }

    displayUpcomingSessions() {
        const container = document.getElementById('upcomingSessions');
        if (!container) return;

        const now = new Date();
        const upcoming = this.sessions
            .filter(s => s.status === 'scheduled' && new Date(`${s.date}T${s.time}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 5);

        container.innerHTML = upcoming.map(session => `
            <div class="upcoming-item">
                <div class="upcoming-time">${session.time}</div>
                <div class="upcoming-info">
                    <h4>${session.subject}</h4>
                    <p>${new Date(session.date).toLocaleDateString()} • ${session.duration} min</p>
                </div>
            </div>
        `).join('');

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="no-upcoming">No upcoming sessions</p>';
        }
    }

    renderCalendar() {
        const container = document.getElementById('plannerCalendar');
        if (!container) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = `<div class="calendar-month">`;
        html += `<h3>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>`;
        html += '<div class="weekdays">';
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => html += `<div class="weekday">${day}</div>`);
        html += '</div><div class="calendar-grid">';

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const sessionsOnDay = this.sessions.filter(s => s.date === dateStr && s.status === 'scheduled');
            
            html += `<div class="calendar-day ${sessionsOnDay.length > 0 ? 'has-sessions' : ''}">
                <span>${day}</span>
                ${sessionsOnDay.length > 0 ? `<span class="session-count">${sessionsOnDay.length}</span>` : ''}
            </div>`;
        }

        html += '</div></div>';
        container.innerHTML = html;
    }

    saveSessions() {
        localStorage.setItem('studySessions', JSON.stringify(this.sessions));
    }

    loadSessions() {
        const saved = localStorage.getItem('studySessions');
        this.sessions = saved ? JSON.parse(saved) : [];
    }

    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '📚' });
        }
    }

    getStatistics() {
        const stats = {
            totalSessions: this.sessions.length,
            completedSessions: this.sessions.filter(s => s.status === 'completed').length,
            totalHours: Math.round(this.sessions.reduce((sum, s) => sum + s.duration, 0) / 60),
            subjectBreakdown: {}
        };

        this.sessions.forEach(session => {
            stats.subjectBreakdown[session.subject] = (stats.subjectBreakdown[session.subject] || 0) + session.duration;
        });

        return stats;
    }
}

// Global reference
let studyPlanner;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sessionsList')) {
        studyPlanner = new StudyPlanner();
    }
});
