// Dashboard - Analytics and Charts
class Dashboard {
    constructor() {
        this.focusChart = null;
        this.chartData = [];
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Initialize when dashboard becomes visible
        this.setupChartData();
        this.createFocusChart();
        this.updateStatistics();
        this.isInitialized = true;
    }
    
    // Method to refresh chart when dashboard becomes visible
    refreshChart() {
        if (this.isInitialized) {
            this.setupChartData();
            this.createFocusChart();
        }
    }
    
    // Method to update chart when theme changes
    updateChartTheme() {
        if (this.focusChart) {
            this.createFocusChart();
        }
    }

    setupChartData() {
        // Load focus sessions from localStorage
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        
        // Prepare data for chart
        this.chartData = this.prepareFocusChartData(sessions);
    }

    prepareFocusChartData(sessions) {
        const last7Days = this.getLast7Days();
        const dayData = {};
        
        // Initialize with zeros
        last7Days.forEach(day => {
            dayData[day] = {
                totalFocus: 0,
                sessionCount: 0,
                averageFocus: 0
            };
        });
        
        // Aggregate session data by day
        sessions.forEach(session => {
            const sessionDate = new Date(session.startTime).toDateString();
            if (dayData[sessionDate]) {
                dayData[sessionDate].totalFocus += session.averageFocus;
                dayData[sessionDate].sessionCount += 1;
            }
        });
        
        // Calculate averages
        Object.keys(dayData).forEach(day => {
            const data = dayData[day];
            if (data.sessionCount > 0) {
                data.averageFocus = Math.round(data.totalFocus / data.sessionCount);
            }
        });
        
        return last7Days.map(day => ({
            date: day,
            focus: dayData[day].averageFocus
        }));
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toDateString());
        }
        return days;
    }

    createFocusChart() {
        const canvas = document.getElementById('focus-chart');
        if (!canvas) {
            console.error('Focus chart canvas not found!');
            return;
        }

        console.log('Creating focus chart with data:', this.chartData);

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.focusChart) {
            this.focusChart.destroy();
        }

        // Ensure canvas has proper dimensions
        canvas.style.backgroundColor = 'transparent';
        canvas.parentElement.style.height = '400px';

        const labels = this.chartData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });

        const data = this.chartData.map(item => item.focus);

        console.log('Chart labels:', labels);
        console.log('Chart data:', data);

        // Check if we're in dark theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#ffffff' : '#333333';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.focusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Focus Level (%)',
                    data: data,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#6c5ce7',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: textColor,
                            font: {
                                size: 13,
                                family: 'Inter, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6c5ce7',
                        borderWidth: 1,
                        displayColors: true,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `Focus Level: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: gridColor,
                            borderColor: gridColor,
                            lineWidth: 1
                        },
                        border: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11,
                                family: 'Inter, sans-serif'
                            },
                            padding: 8,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Focus Level (%)',
                            color: textColor,
                            font: {
                                size: 12,
                                family: 'Inter, sans-serif'
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: gridColor,
                            borderColor: gridColor,
                            lineWidth: 1
                        },
                        border: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11,
                                family: 'Inter, sans-serif'
                            },
                            padding: 8
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#6c5ce7',
                        hoverBorderColor: '#ffffff',
                        hoverBorderWidth: 3
                    },
                    line: {
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round'
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutCubic'
                }
            }
        });

        // Make canvas responsive
        canvas.style.height = '300px';
    }

    updateChart() {
        if (!this.isInitialized) return;
        
        this.setupChartData();
        
        if (this.focusChart) {
            const labels = this.chartData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            });
            
            const data = this.chartData.map(item => item.focus);
            
            this.focusChart.data.labels = labels;
            this.focusChart.data.datasets[0].data = data;
            this.focusChart.update();
        }
    }

    calculateWeeklyStats() {
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const weekSessions = sessions.filter(session => session.startTime >= weekAgo);
        
        if (weekSessions.length === 0) {
            return {
                totalTime: 0,
                averageFocus: 0,
                sessionsCount: 0,
                bestDay: 'N/A',
                improvement: 0
            };
        }
        
        const totalTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
        const totalFocus = weekSessions.reduce((sum, session) => sum + session.averageFocus, 0);
        const averageFocus = Math.round(totalFocus / weekSessions.length);
        
        // Find best performing day
        const dayStats = {};
        weekSessions.forEach(session => {
            const day = new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dayStats[day]) {
                dayStats[day] = { focus: 0, count: 0 };
            }
            dayStats[day].focus += session.averageFocus;
            dayStats[day].count += 1;
        });
        
        let bestDay = 'N/A';
        let bestFocus = 0;
        Object.keys(dayStats).forEach(day => {
            const avgFocus = dayStats[day].focus / dayStats[day].count;
            if (avgFocus > bestFocus) {
                bestFocus = avgFocus;
                bestDay = day;
            }
        });
        
        // Calculate improvement (compare first half to second half of week)
        const midWeek = weekAgo + (3.5 * 24 * 60 * 60 * 1000);
        const firstHalf = weekSessions.filter(s => s.startTime < midWeek);
        const secondHalf = weekSessions.filter(s => s.startTime >= midWeek);
        
        let improvement = 0;
        if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstAvg = firstHalf.reduce((sum, s) => sum + s.averageFocus, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, s) => sum + s.averageFocus, 0) / secondHalf.length;
            improvement = Math.round(secondAvg - firstAvg);
        }
        
        return {
            totalTime: Math.round(totalTime / 60000), // Convert to minutes
            averageFocus,
            sessionsCount: weekSessions.length,
            bestDay,
            improvement
        };
    }

    generateInsights() {
        const stats = this.calculateWeeklyStats();
        const insights = [];
        
        if (stats.sessionsCount === 0) {
            insights.push({
                type: 'info',
                title: 'Get Started',
                message: 'Start your first focus tracking session to see personalized insights here.'
            });
            return insights;
        }
        
        // Focus level insights
        if (stats.averageFocus >= 80) {
            insights.push({
                type: 'success',
                title: 'Excellent Focus!',
                message: `Your average focus this week is ${stats.averageFocus}%. Keep up the great work!`
            });
        } else if (stats.averageFocus >= 60) {
            insights.push({
                type: 'info',
                title: 'Good Progress',
                message: `Your focus level is ${stats.averageFocus}%. Try minimizing distractions to improve further.`
            });
        } else {
            insights.push({
                type: 'warning',
                title: 'Room for Improvement',
                message: `Your focus level is ${stats.averageFocus}%. Consider using the Pomodoro technique for better concentration.`
            });
        }
        
        // Study time insights
        if (stats.totalTime >= 300) { // 5 hours
            insights.push({
                type: 'success',
                title: 'Dedicated Learner',
                message: `You've studied for ${Math.round(stats.totalTime / 60)} hours this week. Excellent dedication!`
            });
        } else if (stats.totalTime >= 120) { // 2 hours
            insights.push({
                type: 'info',
                title: 'Steady Progress',
                message: `You've studied for ${Math.round(stats.totalTime / 60)} hours this week. Try to increase gradually.`
            });
        }
        
        // Best day insight
        if (stats.bestDay !== 'N/A') {
            insights.push({
                type: 'info',
                title: 'Peak Performance',
                message: `${stats.bestDay} was your most focused day. What made it special?`
            });
        }
        
        // Improvement insight
        if (stats.improvement > 10) {
            insights.push({
                type: 'success',
                title: 'Improving Trend',
                message: `Your focus improved by ${stats.improvement}% this week. Great progress!`
            });
        } else if (stats.improvement < -10) {
            insights.push({
                type: 'warning',
                title: 'Focus Declining',
                message: `Your focus decreased by ${Math.abs(stats.improvement)}% this week. Take breaks and stay motivated.`
            });
        }
        
        return insights;
    }

    displayInsights() {
        const insights = this.generateInsights();
        const container = document.querySelector('#insights-container');
        
        if (!container) return;
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-card insight-${insight.type}">
                <div class="insight-icon">
                    ${this.getInsightIcon(insight.type)}
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            </div>
        `).join('');
    }

    getInsightIcon(type) {
        const icons = {
            success: '<i class="fas fa-trophy"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-lightbulb"></i>',
            error: '<i class="fas fa-times-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    exportData() {
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        const userData = JSON.parse(localStorage.getItem('eduFocusUserData') || '{}');
        
        const exportData = {
            exportDate: new Date().toISOString(),
            sessions: sessions,
            userData: userData,
            summary: this.calculateWeeklyStats()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `edufocus-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Public methods
    refresh() {
        this.updateChart();
        this.displayInsights();
        
        // Update other dashboard elements if app is available
        if (window.app) {
            window.app.updateDashboard();
        }
    }

    getChartInstance() {
        return this.focusChart;
    }

    destroy() {
        if (this.focusChart) {
            this.focusChart.destroy();
            this.focusChart = null;
        }
    }
}

// Add insight styles
const insightStyles = `
#insights-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.insight-card {
    background: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: var(--transition);
    border-left: 4px solid var(--gray-300);
}

.insight-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.insight-card.insight-success {
    border-left-color: var(--success-color);
}

.insight-card.insight-warning {
    border-left-color: var(--warning-color);
}

.insight-card.insight-info {
    border-left-color: var(--primary-color);
}

.insight-card.insight-error {
    border-left-color: var(--danger-color);
}

.insight-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.insight-success .insight-icon {
    background: var(--success-color);
    color: white;
}

.insight-warning .insight-icon {
    background: var(--warning-color);
    color: white;
}

.insight-info .insight-icon {
    background: var(--primary-color);
    color: white;
}

.insight-error .insight-icon {
    background: var(--danger-color);
    color: white;
}

.insight-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--dark-color);
    font-size: 1.1rem;
}

.insight-content p {
    margin: 0;
    color: var(--gray-600);
    line-height: 1.5;
    font-size: 0.95rem;
}

.chart-container {
    position: relative;
    height: 350px;
}

.dashboard-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.export-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--secondary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 0.9rem;
    transition: var(--transition);
}

.export-btn:hover {
    background: #7c3aed;
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    #insights-container {
        grid-template-columns: 1fr;
    }
    
    .dashboard-actions {
        flex-direction: column;
        align-items: stretch;
    }
    
    .chart-container {
        height: 250px;
    }
}
`;

// Inject insight styles
const insightStyleSheet = document.createElement('style');
insightStyleSheet.textContent = insightStyles;
document.head.appendChild(insightStyleSheet);

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Add insights container to dashboard section if it doesn't exist
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && !document.getElementById('insights-container')) {
        const insightsContainer = document.createElement('div');
        insightsContainer.id = 'insights-container';
        
        const insightsTitle = document.createElement('h3');
        insightsTitle.textContent = 'Insights & Recommendations';
        insightsTitle.style.marginBottom = '1rem';
        insightsTitle.style.color = 'var(--dark-color)';
        
        dashboardSection.appendChild(insightsTitle);
        dashboardSection.appendChild(insightsContainer);
        
        // Add export button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data';
        exportBtn.onclick = () => window.dashboard.exportData();
        
        const chartContainer = dashboardSection.querySelector('.chart-container');
        if (chartContainer) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'dashboard-actions';
            actionsDiv.innerHTML = '<div></div>'; // Empty div for spacing
            actionsDiv.appendChild(exportBtn);
            
            chartContainer.parentNode.insertBefore(actionsDiv, chartContainer);
        }
    }
    
    // Update dashboard statistics
    updateStatistics() {
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        const pdfs = JSON.parse(localStorage.getItem('summarizedPdfs') || '[]');
        
        // Calculate total study time
        let totalStudyTime = 0;
        sessions.forEach(session => {
            if (session.duration) {
                totalStudyTime += session.duration;
            }
        });
        
        // Convert to hours and minutes
        const hours = Math.floor(totalStudyTime / 3600);
        const minutes = Math.floor((totalStudyTime % 3600) / 60);
        
        // Calculate average focus
        let averageFocus = 0;
        if (sessions.length > 0) {
            const totalFocus = sessions.reduce((sum, session) => sum + (session.averageFocus || 0), 0);
            averageFocus = Math.round(totalFocus / sessions.length);
        }
        
        // Calculate study streak
        const studyStreak = this.calculateStudyStreak(sessions);
        
        // Update DOM elements
        const totalStudyTimeEl = document.getElementById('total-study-time');
        const averageFocusEl = document.getElementById('average-focus');
        const pdfsSummarizedEl = document.getElementById('pdfs-summarized');
        const studyStreakEl = document.getElementById('study-streak');
        
        if (totalStudyTimeEl) {
            totalStudyTimeEl.textContent = `${hours}h ${minutes}m`;
        }
        
        if (averageFocusEl) {
            averageFocusEl.textContent = `${averageFocus}%`;
        }
        
        if (pdfsSummarizedEl) {
            pdfsSummarizedEl.textContent = pdfs.length.toString();
        }
        
        if (studyStreakEl) {
            studyStreakEl.textContent = studyStreak.toString();
        }
        
        // Update recent activity
        this.updateRecentActivity(sessions, pdfs);\n        \n        // Update wavelength visualization\n        this.updateWavelengthVisualization(averageFocus);
    }
    
    calculateStudyStreak(sessions) {
        if (sessions.length === 0) return 0;
        
        // Sort sessions by date
        const sortedSessions = sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const session of sortedSessions) {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            
            const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === streak) {
                streak++;
            } else if (dayDiff > streak) {
                break;
            }
        }
        
        return streak;
    }
    
    updateRecentActivity(sessions, pdfs) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Clear existing activity items except the first one (welcome message)
        const welcomeItem = activityList.querySelector('.activity-item');
        activityList.innerHTML = '';
        if (welcomeItem && welcomeItem.textContent.includes('Welcome')) {
            activityList.appendChild(welcomeItem);
        }
        
        // Combine and sort recent activities
        const activities = [];
        
        // Add recent focus sessions
        sessions.slice(-5).forEach(session => {
            activities.push({
                type: 'focus',
                time: session.startTime,
                text: `Focus session completed with ${session.averageFocus || 0}% average attention`,
                icon: 'fas fa-eye'
            });
        });
        
        // Add recent PDF summaries
        pdfs.slice(-5).forEach(pdf => {
            activities.push({
                type: 'pdf',
                time: pdf.timestamp || Date.now(),
                text: `PDF "${pdf.name || 'Document'}" was summarized`,
                icon: 'fas fa-file-pdf'
            });
        });
        
        // Sort by time (most recent first)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Add recent activities to DOM
        activities.slice(0, 5).forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const timeAgo = this.getTimeAgo(activity.time);
            
            activityItem.innerHTML = `
                <i class="${activity.icon}"></i>
                <div class="activity-content">
                    <span>${activity.text}</span>
                    <small>${timeAgo}</small>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        
        // If no activities, show a message
        if (activities.length === 0) {
            const noActivity = document.createElement('div');
            noActivity.className = 'activity-item';
            noActivity.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <div class="activity-content">
                    <span>No recent activity. Start a focus session or upload a PDF to see your progress!</span>
                </div>
            `;
            activityList.appendChild(noActivity);
        }
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return time.toLocaleDateString();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create sample data if none exists
    if (!localStorage.getItem('focusSessions')) {
        const sampleSessions = [];
        
        // Create data for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0); // Random hour between 10-18
            
            sampleSessions.push({
                startTime: date.getTime(),
                duration: 1200 + Math.floor(Math.random() * 2400), // 20-60 minutes
                averageFocus: 65 + Math.floor(Math.random() * 30) // 65-95%
            });
        }
        
        localStorage.setItem('focusSessions', JSON.stringify(sampleSessions));
        console.log('Created sample focus sessions:', sampleSessions);
    }
    
    if (!localStorage.getItem('summarizedPdfs')) {
        const samplePdfs = [
            {
                name: 'Introduction to Machine Learning.pdf',
                timestamp: Date.now() - 86400000
            },
            {
                name: 'Calculus Study Guide.pdf', 
                timestamp: Date.now() - 172800000
            }
        ];
        localStorage.setItem('summarizedPdfs', JSON.stringify(samplePdfs));
    }
    
    window.dashboard = new Dashboard();
    
    // Update statistics when dashboard becomes visible
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && window.dashboard) {
                    window.dashboard.updateStatistics();
                }
            });
        });
        observer.observe(dashboardSection);
    }
    
    // Update statistics immediately if dashboard is already visible
    if (window.dashboard) {
        window.dashboard.updateStatistics();
    }
});