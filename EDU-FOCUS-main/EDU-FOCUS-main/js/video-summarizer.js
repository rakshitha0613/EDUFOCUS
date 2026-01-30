// Video Summarizer - YouTube & Video Content Summarization
class VideoSummarizer {
    constructor() {
        this.apiKey = 'sk-proj-3arCQq4G1mlnNrC4mq6L870GQp-nvbsK2Bn1syYWPCGDvmv_CxtaaWju-SYVShB6Wu5XCpUoLHEpT3Blbk-FJF150m9fxPPyeGCh8lCd4mOC9wi6ujx-B81cTvatmWmHuH-WhqAGE9MykYC_mjNcFNEbSkh_gyAA';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.isProcessing = false;
        this.summaryHistory = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSummaryHistory();
        this.displayHistory();
    }

    setupEventListeners() {
        const summarizeBtn = document.getElementById('summarize-video-btn');
        const videoInput = document.getElementById('video-url-input');

        if (summarizeBtn) {
            summarizeBtn.addEventListener('click', () => this.summarizeVideo());
        }

        if (videoInput) {
            videoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.summarizeVideo();
                }
            });

            videoInput.addEventListener('input', (e) => {
                this.validateVideoUrl(e.target.value);
            });
        }
    }

    validateVideoUrl(url) {
        const videoInput = document.getElementById('video-url-input');
        const summarizeBtn = document.getElementById('summarize-video-btn');
        
        if (!url) {
            summarizeBtn.disabled = true;
            return false;
        }

        // Check if it's a valid YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const isValid = youtubeRegex.test(url);

        summarizeBtn.disabled = !isValid;
        
        if (url && !isValid) {
            this.showError('Please enter a valid YouTube URL');
        } else {
            this.clearError();
        }

        return isValid;
    }

    extractVideoId(url) {
        // Extract YouTube video ID from URL
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    async summarizeVideo() {
        const videoInput = document.getElementById('video-url-input');
        const url = videoInput.value.trim();

        if (!this.validateVideoUrl(url) || this.isProcessing) return;

        const videoId = this.extractVideoId(url);
        if (!videoId) {
            this.showError('Could not extract video ID from URL');
            return;
        }

        this.isProcessing = true;
        this.showProcessingState();

        try {
            // Get video metadata
            const videoInfo = await this.getVideoInfo(videoId);
            
            // Generate summary using AI
            const summary = await this.generateSummary(videoInfo);

            // Display results
            this.displaySummary(videoInfo, summary);

            // Save to history
            this.addToHistory(videoInfo, summary);

            // Clear input
            videoInput.value = '';

            // Update stats
            if (window.app) {
                window.app.addActivity('video', `Summarized: ${videoInfo.title}`);
            }

        } catch (error) {
            console.error('Error summarizing video:', error);
            this.showError('Failed to summarize video. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideProcessingState();
        }
    }

    async getVideoInfo(videoId) {
        // Note: In production, you'd use YouTube Data API
        // For demo, we'll simulate with a placeholder
        
        // Simulated video info (in production, fetch from YouTube API)
        return {
            id: videoId,
            title: 'Educational Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: 'N/A',
            channel: 'Educational Channel',
            description: 'This is an educational video that needs summarization.',
            url: `https://www.youtube.com/watch?v=${videoId}`
        };
    }

    async generateSummary(videoInfo) {
        try {
            const prompt = `
Summarize this educational video based on the following information:

Title: ${videoInfo.title}
Channel: ${videoInfo.channel}
Description: ${videoInfo.description}

Provide a comprehensive summary including:
1. Main Topics Covered (bullet points)
2. Key Takeaways (3-5 points)
3. Important Concepts Explained
4. Practical Applications
5. Recommended For (who should watch this)

Format the response clearly with sections.
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
                            content: 'You are an expert at summarizing educational videos. Provide clear, structured summaries that help students understand the content without watching the full video.' 
                        },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                return this.getFallbackSummary(videoInfo);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Summary generation error:', error);
            return this.getFallbackSummary(videoInfo);
        }
    }

    getFallbackSummary(videoInfo) {
        return `**Video Summary (Demo Mode)**

📹 **Title:** ${videoInfo.title}
👤 **Channel:** ${videoInfo.channel}

**Main Topics Covered:**
• Educational content from this video
• Key concepts and explanations
• Practical examples and demonstrations
• Important takeaways for learners

**Key Takeaways:**
1. This is a comprehensive educational video covering important concepts
2. The content is structured for effective learning
3. Practical applications are demonstrated throughout
4. Suitable for students learning this topic

**Recommended For:**
Students and learners interested in this subject matter who want to understand the core concepts presented in the video.

**Note:** This is a demo summary. For AI-generated summaries with detailed analysis:
• Configure a valid OpenAI API key in the code
• The full API integration will provide comprehensive, accurate summaries
• Watch the video directly for complete information: ${videoInfo.url}

💡 **Tip:** The video title and description provide good context about the content!`;
    }

    displaySummary(videoInfo, summary) {
        const resultsArea = document.getElementById('video-summary-results');
        const summaryContent = document.getElementById('video-summary-content');

        resultsArea.style.display = 'block';

        summaryContent.innerHTML = `
            <div class="video-summary-card">
                <div class="video-info">
                    <img src="${videoInfo.thumbnail}" alt="${videoInfo.title}" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/480x360?text=Video'">
                    <div class="video-details">
                        <h3>${videoInfo.title}</h3>
                        <p class="video-channel"><i class="fas fa-user"></i> ${videoInfo.channel}</p>
                        <a href="${videoInfo.url}" target="_blank" class="btn btn-secondary btn-small">
                            <i class="fab fa-youtube"></i> Watch Video
                        </a>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4><i class="fas fa-file-alt"></i> Video Summary</h4>
                    <div class="summary-text">${this.formatSummary(summary)}</div>
                </div>

                <div class="summary-actions">
                    <button onclick="videoSummarizer.copySummary()" class="btn btn-secondary">
                        <i class="fas fa-copy"></i> Copy Summary
                    </button>
                    <button onclick="videoSummarizer.speakSummary()" class="btn btn-secondary">
                        <i class="fas fa-volume-up"></i> Read Aloud
                    </button>
                    <button onclick="videoSummarizer.exportSummary()" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
        `;

        // Scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    formatSummary(summary) {
        // Convert markdown-style formatting to HTML
        return summary
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^(\d+\.|•)\s/gm, '<br>$1 ');
    }

    addToHistory(videoInfo, summary) {
        const historyItem = {
            id: videoInfo.id,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            summary: summary,
            url: videoInfo.url,
            timestamp: new Date().toISOString()
        };

        this.summaryHistory.unshift(historyItem);
        
        // Keep only last 10
        if (this.summaryHistory.length > 10) {
            this.summaryHistory = this.summaryHistory.slice(0, 10);
        }

        this.saveSummaryHistory();
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('video-summary-history');
        if (!historyList) return;

        if (this.summaryHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">No video summaries yet</p>';
            return;
        }

        historyList.innerHTML = this.summaryHistory.map((item, index) => `
            <div class="history-item" onclick="videoSummarizer.loadFromHistory(${index})">
                <img src="${item.thumbnail}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/120x90?text=Video'">
                <div class="history-item-info">
                    <h4>${item.title}</h4>
                    <p>${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    loadFromHistory(index) {
        const item = this.summaryHistory[index];
        this.displaySummary(
            { 
                id: item.id,
                title: item.title, 
                thumbnail: item.thumbnail, 
                url: item.url,
                channel: 'From History',
                description: ''
            }, 
            item.summary
        );
    }

    copySummary() {
        const summaryText = document.querySelector('.summary-text').innerText;
        navigator.clipboard.writeText(summaryText).then(() => {
            this.showSuccess('Summary copied to clipboard!');
        });
    }

    speakSummary() {
        const summaryText = document.querySelector('.summary-text').innerText;
        if (window.textToSpeech) {
            window.textToSpeech.speak(summaryText);
        } else {
            this.showError('Text-to-Speech feature not available');
        }
    }

    exportSummary() {
        const summaryText = document.querySelector('.summary-text').innerText;
        const videoTitle = document.querySelector('.video-details h3').innerText;
        
        const blob = new Blob([`${videoTitle}\n\n${summaryText}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_')}_summary.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showProcessingState() {
        const resultsArea = document.getElementById('video-summary-results');
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `
            <div class="processing-video">
                <div class="spinner"></div>
                <h3>Analyzing Video...</h3>
                <p>Generating comprehensive summary</p>
            </div>
        `;
    }

    hideProcessingState() {
        // Handled by displaySummary
    }

    showError(message) {
        const errorDiv = document.getElementById('video-error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    clearError() {
        const errorDiv = document.getElementById('video-error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    showSuccess(message) {
        // Reuse error div for success messages
        const errorDiv = document.getElementById('video-error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.background = '#4ecdc4';
            setTimeout(() => {
                errorDiv.style.display = 'none';
                errorDiv.style.background = '';
            }, 3000);
        }
    }

    saveSummaryHistory() {
        localStorage.setItem('videoSummaryHistory', JSON.stringify(this.summaryHistory));
    }

    loadSummaryHistory() {
        const saved = localStorage.getItem('videoSummaryHistory');
        if (saved) {
            this.summaryHistory = JSON.parse(saved);
        }
    }
}

// Initialize
let videoSummarizer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoSummarizer = new VideoSummarizer();
    });
} else {
    videoSummarizer = new VideoSummarizer();
}
