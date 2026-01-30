// Automated Study Guide Generator
class StudyGuideGenerator {
    constructor() {
        this.apiKey = 'sk-proj-3arCQq4G1mlnNrC4mq6L870GQp-nvbsK2Bn1syYWPCGDvmv_CxtaaWju-SYVShB6Wu5XCpUoLHEpT3Blbk-FJF150m9fxPPyeGCh8lCd4mOC9wi6ujx-B81cTvatmWmHuH-WhqAGE9MykYC_mjNcFNEbSkh_gyAA';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.isGenerating = false;
        this.generatedGuides = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedGuides();
        this.displayGuidesHistory();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generate-guide-btn');
        const topicInput = document.getElementById('guide-topic-input');
        const fileInput = document.getElementById('guide-file-input');
        const uploadBtn = document.getElementById('upload-guide-material');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateStudyGuide());
        }

        if (topicInput) {
            topicInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.generateStudyGuide();
                }
            });
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Guide format options
        const formatOptions = document.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                formatOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    getSelectedFormat() {
        const selectedFormat = document.querySelector('.format-option.selected');
        return selectedFormat ? selectedFormat.getAttribute('data-format') : 'comprehensive';
    }

    async generateStudyGuide() {
        const topicInput = document.getElementById('guide-topic-input');
        const topic = topicInput.value.trim();

        if (!topic || this.isGenerating) return;

        this.isGenerating = true;
        this.showProcessingState();

        try {
            const format = this.getSelectedFormat();
            const guide = await this.callAIForGuide(topic, format);

            this.displayGuide(topic, guide, format);
            this.saveGuide(topic, guide, format);

            // Clear input
            topicInput.value = '';

            // Update stats
            if (window.app) {
                window.app.addActivity('guide', `Generated study guide: ${topic}`);
            }

        } catch (error) {
            console.error('Error generating study guide:', error);
            this.showError('Failed to generate study guide. Please try again.');
        } finally {
            this.isGenerating = false;
            this.hideProcessingState();
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await this.extractTextFromFile(file);
            
            this.showProcessingState('Analyzing uploaded material...');
            
            const format = this.getSelectedFormat();
            const guide = await this.callAIForGuide(`Content from ${file.name}`, format, content);

            this.displayGuide(file.name, guide, format);
            this.saveGuide(file.name, guide, format);

            this.showSuccess(`Study guide generated from ${file.name}!`);

        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('Error processing file. Please try again.');
        }
    }

    async extractTextFromFile(file) {
        if (file.type === 'application/pdf') {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedarray = new Uint8Array(e.target.result);
                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                        let fullText = '';
                        
                        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');
                            fullText += pageText + '\n';
                        }
                        
                        resolve(fullText);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        } else {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
    }

    async callAIForGuide(topic, format, additionalContent = '') {
        const formatInstructions = this.getFormatInstructions(format);
        
        const prompt = `
Create a comprehensive study guide for: ${topic}

${additionalContent ? `Based on this content:\n${additionalContent.substring(0, 3000)}\n\n` : ''}

${formatInstructions}

The study guide should be well-structured, easy to understand, and suitable for exam preparation.
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
                        content: 'You are an expert educator creating comprehensive study guides. Provide clear, organized, and thorough study materials.' 
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getFormatInstructions(format) {
        const formats = {
            'comprehensive': `
Include:
1. Overview and Introduction
2. Key Concepts and Definitions
3. Main Topics (with detailed explanations)
4. Important Formulas/Theories
5. Practice Questions (with answers)
6. Summary and Review Tips
7. Additional Resources
            `,
            'quick': `
Create a quick reference guide with:
1. Key Points (bullet points)
2. Essential Definitions
3. Quick Facts
4. Memory Aids
5. Exam Tips
            `,
            'flashcards': `
Create 15-20 flashcard-style Q&A pairs:
- Front: Question/Term
- Back: Answer/Definition
Format: Q: [question] | A: [answer]
            `,
            'mindmap': `
Create a text-based mind map structure:
- Central concept
- Main branches (3-5)
- Sub-branches under each
- Key connections
Use indentation to show hierarchy
            `
        };

        return formats[format] || formats['comprehensive'];
    }

    displayGuide(topic, guide, format) {
        const resultsArea = document.getElementById('study-guide-results');
        const guideContent = document.getElementById('study-guide-content');

        resultsArea.style.display = 'block';

        guideContent.innerHTML = `
            <div class="study-guide-card">
                <div class="guide-header">
                    <div class="guide-title-section">
                        <h3><i class="fas fa-book"></i> ${topic}</h3>
                        <span class="guide-format-badge">${format}</span>
                    </div>
                    <div class="guide-actions-top">
                        <button onclick="studyGuideGenerator.printGuide()" class="btn btn-secondary btn-small">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button onclick="studyGuideGenerator.downloadGuide()" class="btn btn-secondary btn-small">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button onclick="studyGuideGenerator.shareGuide()" class="btn btn-secondary btn-small">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>

                <div class="guide-body">
                    ${this.formatGuideContent(guide, format)}
                </div>

                <div class="guide-footer">
                    <div class="guide-meta">
                        <span><i class="fas fa-calendar"></i> Generated: ${new Date().toLocaleDateString()}</span>
                        <span><i class="fas fa-clock"></i> ${this.estimateReadTime(guide)} min read</span>
                    </div>
                    <div class="guide-actions">
                        <button onclick="studyGuideGenerator.speakGuide()" class="btn btn-primary">
                            <i class="fas fa-volume-up"></i> Read Aloud
                        </button>
                        <button onclick="studyGuideGenerator.createQuiz()" class="btn btn-primary">
                            <i class="fas fa-question-circle"></i> Generate Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;

        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    formatGuideContent(guide, format) {
        // Convert the guide text to HTML with proper formatting
        let formatted = guide
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^(#{1,3})\s(.+)$/gm, (match, hashes, text) => {
                const level = hashes.length;
                return `<h${level + 2}>${text}</h${level + 2}>`;
            });

        return `<div class="guide-content-${format}">${formatted}</div>`;
    }

    estimateReadTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    saveGuide(topic, content, format) {
        const guide = {
            id: Date.now(),
            topic: topic,
            content: content,
            format: format,
            createdAt: new Date().toISOString()
        };

        this.generatedGuides.unshift(guide);
        
        // Keep only last 20 guides
        if (this.generatedGuides.length > 20) {
            this.generatedGuides = this.generatedGuides.slice(0, 20);
        }

        localStorage.setItem('studyGuides', JSON.stringify(this.generatedGuides));
        this.displayGuidesHistory();
    }

    loadSavedGuides() {
        const saved = localStorage.getItem('studyGuides');
        if (saved) {
            this.generatedGuides = JSON.parse(saved);
        }
    }

    displayGuidesHistory() {
        const historyList = document.getElementById('guides-history-list');
        if (!historyList) return;

        if (this.generatedGuides.length === 0) {
            historyList.innerHTML = '<p class="no-guides">No study guides yet</p>';
            return;
        }

        historyList.innerHTML = this.generatedGuides.map((guide, index) => `
            <div class="guide-history-item" onclick="studyGuideGenerator.loadGuide(${index})">
                <div class="guide-item-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="guide-item-info">
                    <h4>${guide.topic}</h4>
                    <p>${new Date(guide.createdAt).toLocaleDateString()} • ${guide.format}</p>
                </div>
                <button onclick="event.stopPropagation(); studyGuideGenerator.deleteGuide(${index})" class="delete-guide-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    loadGuide(index) {
        const guide = this.generatedGuides[index];
        this.displayGuide(guide.topic, guide.content, guide.format);
    }

    deleteGuide(index) {
        if (confirm('Delete this study guide?')) {
            this.generatedGuides.splice(index, 1);
            localStorage.setItem('studyGuides', JSON.stringify(this.generatedGuides));
            this.displayGuidesHistory();
        }
    }

    printGuide() {
        window.print();
    }

    downloadGuide() {
        const guideContent = document.querySelector('.guide-body').innerText;
        const topic = document.querySelector('.guide-title-section h3').innerText;
        
        const blob = new Blob([guideContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}_study_guide.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    shareGuide() {
        const guideContent = document.querySelector('.guide-body').innerText;
        
        if (navigator.share) {
            navigator.share({
                title: 'Study Guide',
                text: guideContent
            });
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(guideContent).then(() => {
                this.showSuccess('Guide copied to clipboard!');
            });
        }
    }

    speakGuide() {
        const guideContent = document.querySelector('.guide-body').innerText;
        if (window.textToSpeech) {
            window.textToSpeech.speak(guideContent);
        } else {
            this.showError('Text-to-Speech feature not available');
        }
    }

    async createQuiz() {
        this.showSuccess('Quiz generation coming soon!');
    }

    showProcessingState(message = 'Generating your study guide...') {
        const resultsArea = document.getElementById('study-guide-results');
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `
            <div class="processing-guide">
                <div class="spinner"></div>
                <h3>${message}</h3>
                <p>This may take a moment</p>
            </div>
        `;
    }

    hideProcessingState() {
        // Handled by displayGuide
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        const resultsArea = document.getElementById('study-guide-results');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4ecdc4; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 1000;';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize
let studyGuideGenerator;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        studyGuideGenerator = new StudyGuideGenerator();
    });
} else {
    studyGuideGenerator = new StudyGuideGenerator();
}
