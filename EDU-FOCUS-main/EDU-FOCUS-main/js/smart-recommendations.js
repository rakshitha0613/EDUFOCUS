// Smart Recommendations - AI-suggested study topics based on performance
class SmartRecommendations {
    constructor() {
        this.apiKey = 'sk-proj-3arCQq4G1mlnNrC4mq6L870GQp-nvbsK2Bn1syYWPCGDvmv_CxtaaWju-SYVShB6Wu5XCpUoLHEpT3Blbk-FJF150m9fxPPyeGCh8lCd4mOC9wi6ujx-B81cTvatmWmHuH-WhqAGE9MykYC_mjNcFNEbSkh_gyAA';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.recommendations = [];
        this.userPerformance = null;
        
        this.init();
    }

    init() {
        this.loadUserPerformance();
        this.setupEventListeners();
        this.generateRecommendations();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-recommendations');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.generateRecommendations());
        }

        // Listen for performance updates
        document.addEventListener('performanceUpdate', () => {
            this.loadUserPerformance();
            this.generateRecommendations();
        });
    }

    loadUserPerformance() {
        // Gather performance data from various sources
        const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        const userData = JSON.parse(localStorage.getItem('eduFocusUserData') || '{}');
        const pdfsSummarized = userData.stats?.pdfsSummarized || 0;
        const studyStreak = userData.stats?.studyStreak || 0;

        // Calculate performance metrics
        const avgFocus = this.calculateAverageFocus(focusSessions);
        const studyTime = this.calculateTotalStudyTime(focusSessions);
        const focusTrend = this.calculateFocusTrend(focusSessions);
        const studyPattern = this.analyzeStudyPattern(focusSessions);

        this.userPerformance = {
            averageFocus: avgFocus,
            totalStudyTime: studyTime,
            focusTrend: focusTrend,
            studyPattern: studyPattern,
            pdfsSummarized: pdfsSummarized,
            studyStreak: studyStreak,
            recentSessions: focusSessions.slice(-5)
        };
    }

    calculateAverageFocus(sessions) {
        if (sessions.length === 0) return 0;
        const sum = sessions.reduce((acc, session) => acc + (session.averageFocus || 0), 0);
        return Math.round(sum / sessions.length);
    }

    calculateTotalStudyTime(sessions) {
        return sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    }

    calculateFocusTrend(sessions) {
        if (sessions.length < 3) return 'stable';
        
        const recent = sessions.slice(-5);
        const older = sessions.slice(-10, -5);
        
        const recentAvg = recent.reduce((acc, s) => acc + (s.averageFocus || 0), 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((acc, s) => acc + (s.averageFocus || 0), 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg + 5) return 'improving';
        if (recentAvg < olderAvg - 5) return 'declining';
        return 'stable';
    }

    analyzeStudyPattern(sessions) {
        if (sessions.length === 0) return 'beginner';
        
        const sessionsPerWeek = sessions.filter(s => {
            const sessionDate = new Date(s.startTime);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate > weekAgo;
        }).length;

        if (sessionsPerWeek >= 5) return 'consistent';
        if (sessionsPerWeek >= 3) return 'regular';
        if (sessionsPerWeek >= 1) return 'occasional';
        return 'beginner';
    }

    async generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-list');
        if (!recommendationsContainer) return;

        // Show loading state
        recommendationsContainer.innerHTML = `
            <div class="loading-recommendations">
                <div class="spinner"></div>
                <p>Analyzing your performance...</p>
            </div>
        `;

        try {
            // Generate AI recommendations
            const aiRecommendations = await this.getAIRecommendations();
            
            // Parse and display recommendations
            this.recommendations = this.parseRecommendations(aiRecommendations);
            this.displayRecommendations();

        } catch (error) {
            console.error('Error generating recommendations:', error);
            this.displayDefaultRecommendations();
        }
    }

    async getAIRecommendations() {
        const prompt = `
Based on the following student performance data, provide 5 personalized study recommendations:

Performance Metrics:
- Average Focus Level: ${this.userPerformance.averageFocus}%
- Total Study Time: ${Math.round(this.userPerformance.totalStudyTime / 60)} minutes
- Focus Trend: ${this.userPerformance.focusTrend}
- Study Pattern: ${this.userPerformance.studyPattern}
- PDFs Summarized: ${this.userPerformance.pdfsSummarized}
- Study Streak: ${this.userPerformance.studyStreak} days

Provide recommendations in this format:
1. [ICON: emoji] [TITLE]: [Description]

Focus on:
- Study habits improvement
- Focus enhancement techniques
- Time management
- Learning strategies
- Motivation and engagement

Each recommendation should be actionable and specific to their performance level.
        `;

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are an expert educational advisor providing personalized study recommendations based on student performance data.' 
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    parseRecommendations(aiText) {
        const lines = aiText.split('\n').filter(line => line.trim());
        const recommendations = [];

        lines.forEach(line => {
            const match = line.match(/\d+\.\s*\[ICON:\s*(\S+)\]\s*\[(.+?)\]:\s*(.+)/);
            if (match) {
                recommendations.push({
                    icon: match[1],
                    title: match[2],
                    description: match[3],
                    priority: 'medium'
                });
            }
        });

        return recommendations.length > 0 ? recommendations : this.getDefaultRecommendations();
    }

    getDefaultRecommendations() {
        const { averageFocus, studyPattern, focusTrend } = this.userPerformance;

        const recommendations = [];

        // Focus-based recommendations
        if (averageFocus < 60) {
            recommendations.push({
                icon: '🎯',
                title: 'Improve Focus Levels',
                description: 'Try the Pomodoro technique: 25 min focused study, 5 min break. Eliminate distractions before starting.',
                priority: 'high'
            });
        }

        // Pattern-based recommendations
        if (studyPattern === 'occasional' || studyPattern === 'beginner') {
            recommendations.push({
                icon: '📅',
                title: 'Build Consistent Study Habit',
                description: 'Set a regular study schedule. Start with 30 minutes daily at the same time to build consistency.',
                priority: 'high'
            });
        }

        // Trend-based recommendations
        if (focusTrend === 'declining') {
            recommendations.push({
                icon: '⚡',
                title: 'Revitalize Your Study Routine',
                description: 'Your focus is declining. Try changing your study environment or time. Take more breaks.',
                priority: 'high'
            });
        } else if (focusTrend === 'improving') {
            recommendations.push({
                icon: '🌟',
                title: 'Great Progress! Keep It Up',
                description: 'Your focus is improving! Maintain this momentum by tracking what works and doing more of it.',
                priority: 'medium'
            });
        }

        // General recommendations
        recommendations.push({
            icon: '📚',
            title: 'Use Active Recall Technique',
            description: 'After studying, close your materials and write down everything you remember. This strengthens memory.',
            priority: 'medium'
        });

        recommendations.push({
            icon: '💪',
            title: 'Take Regular Breaks',
            description: 'Stand up, stretch, and rest your eyes every 25-30 minutes. Physical activity boosts cognitive performance.',
            priority: 'low'
        });

        return recommendations.slice(0, 5);
    }

    displayRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-list');
        if (!recommendationsContainer) return;

        recommendationsContainer.innerHTML = this.recommendations.map((rec, index) => `
            <div class="recommendation-card priority-${rec.priority}" data-index="${index}">
                <div class="rec-icon">${rec.icon}</div>
                <div class="rec-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
                <div class="rec-actions">
                    <button onclick="smartRecommendations.markAsRead(${index})" class="btn-small btn-secondary">
                        <i class="fas fa-check"></i> Got it
                    </button>
                </div>
            </div>
        `).join('');

        // Display performance summary
        this.displayPerformanceSummary();
    }

    displayDefaultRecommendations() {
        this.recommendations = this.getDefaultRecommendations();
        this.displayRecommendations();
    }

    displayPerformanceSummary() {
        const summaryContainer = document.getElementById('performance-summary');
        if (!summaryContainer) return;

        const { averageFocus, studyPattern, focusTrend } = this.userPerformance;

        const trendIcon = {
            'improving': '📈',
            'declining': '📉',
            'stable': '➡️'
        }[focusTrend];

        const patternText = {
            'consistent': 'Excellent - Very Consistent',
            'regular': 'Good - Regular Study',
            'occasional': 'Fair - Occasional Study',
            'beginner': 'Getting Started'
        }[studyPattern];

        summaryContainer.innerHTML = `
            <div class="performance-stats">
                <div class="perf-stat">
                    <div class="perf-label">Focus Level</div>
                    <div class="perf-value">${averageFocus}%</div>
                </div>
                <div class="perf-stat">
                    <div class="perf-label">Trend</div>
                    <div class="perf-value">${trendIcon} ${focusTrend}</div>
                </div>
                <div class="perf-stat">
                    <div class="perf-label">Study Pattern</div>
                    <div class="perf-value">${patternText}</div>
                </div>
            </div>
        `;
    }

    markAsRead(index) {
        const card = document.querySelector(`.recommendation-card[data-index="${index}"]`);
        if (card) {
            card.style.opacity = '0.5';
            card.querySelector('.rec-actions').innerHTML = '<span style="color: #4ecdc4;"><i class="fas fa-check-circle"></i> Completed</span>';
        }
    }
}

// Initialize
let smartRecommendations;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        smartRecommendations = new SmartRecommendations();
    });
} else {
    smartRecommendations = new SmartRecommendations();
}
