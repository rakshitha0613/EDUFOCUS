// PDF Summarizer - Document Processing and AI Summarization
class PDFSummarizer {
    constructor() {
        this.apiKey = 'sk-proj-3arCQq4G1mlnNrC4mq6L870GQp-nvbsK2Bn1syYWPCGDvmv_CxtaaWju-SYVShB6Wu5XCpUoLHEpT3Blbk-FJF150m9fxPPyeGCh8lCd4mOC9wi6ujx-B81cTvatmWmHuH-WhqAGE9MykYC_mjNcFNEbSkh_gyAA';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.maxTokens = 4000;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const pdfInput = document.getElementById('pdf-input');
        const uploadArea = document.getElementById('upload-area');

        if (pdfInput) {
            pdfInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                pdfInput.click();
            });
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('upload-area');
        
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });

        uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        try {
            this.showProcessing(file.name);
            
            // Extract text from PDF
            const text = await this.extractTextFromPDF(file);
            
            if (!text || text.trim().length === 0) {
                throw new Error('No text content found in PDF');
            }

            // Summarize with OpenAI
            const summary = await this.summarizeText(text, file.name);
            
            // Display results
            this.displaySummary(file.name, summary);
            
            // Update stats
            if (window.app) {
                window.app.incrementPdfCount();
                window.app.addActivity('pdf', `Summarized document: ${file.name}`);
            }
            
        } catch (error) {
            console.error('Error processing PDF:', error);
            this.showError(error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    validateFile(file) {
        // Check file type
        if (file.type !== 'application/pdf') {
            this.showError('Please select a PDF file');
            return false;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showError('File size too large. Please select a file smaller than 10MB');
            return false;
        }

        return true;
    }

    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    
                    let fullText = '';
                    
                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        
                        const pageText = textContent.items
                            .map(item => item.str)
                            .join(' ');
                        
                        fullText += pageText + '\n\n';
                        
                        // Limit text length to avoid API limits
                        if (fullText.length > 15000) {
                            fullText += '\n[Document truncated to stay within processing limits]';
                            break;
                        }
                    }
                    
                    resolve(fullText.trim());
                } catch (error) {
                    reject(new Error('Failed to extract text from PDF: ' + error.message));
                }
            };
            
            fileReader.onerror = () => {
                reject(new Error('Failed to read PDF file'));
            };
            
            fileReader.readAsArrayBuffer(file);
        });
    }

    async summarizeText(text, fileName) {
        try {
            const prompt = this.createSummarizationPrompt(text, fileName);
            
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
                            content: 'You are an expert educational assistant that creates comprehensive, well-structured summaries of academic documents. Focus on key concepts, main ideas, and important details that would be valuable for students studying this material.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            return this.formatSummary(data.choices[0].message.content);
            
        } catch (error) {
            console.error('Summarization error:', error);
            
            // Fallback to local summarization if API fails
            if (error.message.includes('API') || error.message.includes('fetch')) {
                return this.generateFallbackSummary(text);
            }
            
            throw error;
        }
    }

    createSummarizationPrompt(text, fileName) {
        return `Please create a comprehensive summary of the following document titled "${fileName}". 

Structure your response with these sections:
1. **Overview**: Brief description of what the document is about
2. **Key Topics**: Main subjects covered (as bullet points)
3. **Important Concepts**: Detailed explanations of crucial ideas
4. **Key Takeaways**: Main insights and conclusions
5. **Study Tips**: Suggestions for how students can best learn from this material

Make sure the summary is educational, well-organized, and suitable for students. Focus on the most important information while maintaining clarity.

Document content:
${text}`;
    }

    formatSummary(summaryText) {
        // Clean up and format the summary
        let formatted = summaryText.trim();
        
        // Convert **text** to <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert bullet points to HTML lists
        formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // Convert numbered lists
        formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
        
        // Add line breaks for paragraphs
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = '<p>' + formatted + '</p>';
        
        // Clean up empty paragraphs
        formatted = formatted.replace(/<p><\/p>/g, '');
        formatted = formatted.replace(/<p>\s*<\/p>/g, '');
        
        return formatted;
    }

    generateFallbackSummary(text) {
        // Simple fallback summarization when API is not available
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const wordCount = text.split(/\s+/).length;
        const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed
        
        // Take first few sentences as a basic summary
        const summarySentences = sentences.slice(0, Math.min(5, sentences.length));
        
        return `
            <div class="fallback-summary">
                <h4>Document Overview</h4>
                <p><strong>Word Count:</strong> ${wordCount} words</p>
                <p><strong>Estimated Reading Time:</strong> ${estimatedReadingTime} minutes</p>
                
                <h4>Key Content Preview</h4>
                <p>${summarySentences.join('. ').trim()}.</p>
                
                <h4>Note</h4>
                <p>This is a basic preview. For detailed AI-powered summaries, please check your internet connection and try again.</p>
                
                <h4>Study Tips</h4>
                <ul>
                    <li>Read through the document systematically</li>
                    <li>Take notes on key concepts</li>
                    <li>Review and summarize each section</li>
                    <li>Use the focus tracker while studying</li>
                </ul>
            </div>
        `;
    }

    showProcessing(fileName) {
        this.isProcessing = true;
        
        const uploadArea = document.getElementById('upload-area');
        const processingArea = document.getElementById('processing-area');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (processingArea) {
            processingArea.style.display = 'block';
            const processingContent = processingArea.querySelector('.processing-content');
            if (processingContent) {
                processingContent.innerHTML = `
                    <div class="spinner"></div>
                    <h3>Processing ${fileName}...</h3>
                    <p>Extracting text and generating AI summary</p>
                    <div class="progress-steps">
                        <div class="step active">📄 Reading PDF</div>
                        <div class="step active">🔍 Extracting Text</div>
                        <div class="step active">🤖 AI Analysis</div>
                        <div class="step">✨ Generating Summary</div>
                    </div>
                `;
            }
        }
    }

    displaySummary(fileName, summary) {
        const processingArea = document.getElementById('processing-area');
        const summaryArea = document.getElementById('summary-area');
        
        if (processingArea) processingArea.style.display = 'none';
        if (summaryArea) {
            summaryArea.style.display = 'block';
            
            const titleElement = document.getElementById('pdf-title');
            const contentElement = document.getElementById('summary-content');
            
            if (titleElement) {
                titleElement.textContent = `Summary: ${fileName}`;
            }
            
            if (contentElement) {
                contentElement.innerHTML = summary;
            }
        }
        
        // Show success notification
        if (window.app) {
            window.app.showNotification('PDF summarized successfully!', 'success');
        }
    }

    showError(message) {
        this.reset();
        
        if (window.app) {
            window.app.showNotification(message, 'error');
        } else {
            alert('Error: ' + message);
        }
    }

    reset() {
        this.isProcessing = false;
        
        const uploadArea = document.getElementById('upload-area');
        const processingArea = document.getElementById('processing-area');
        const summaryArea = document.getElementById('summary-area');
        const pdfInput = document.getElementById('pdf-input');
        
        if (uploadArea) uploadArea.style.display = 'block';
        if (processingArea) processingArea.style.display = 'none';
        if (summaryArea) summaryArea.style.display = 'none';
        if (pdfInput) pdfInput.value = '';
        
        // Remove dragover class
        uploadArea?.classList.remove('dragover');
    }

    // Public methods
    isCurrentlyProcessing() {
        return this.isProcessing;
    }

    getSupportedFormats() {
        return ['application/pdf'];
    }

    getMaxFileSize() {
        return 10 * 1024 * 1024; // 10MB
    }
}

// Add processing styles
const processingStyles = `
.progress-steps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    align-items: center;
}

.step {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background: var(--gray-200);
    color: var(--gray-600);
    font-size: 0.9rem;
    transition: var(--transition);
}

.step.active {
    background: var(--primary-color);
    color: white;
}

.fallback-summary {
    background: var(--gray-100);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--warning-color);
}

.fallback-summary h4 {
    color: var(--warning-color);
    margin-bottom: 1rem;
}

.summary-content h4 {
    color: var(--primary-color);
    margin: 1.5rem 0 1rem 0;
    font-size: 1.2rem;
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 0.5rem;
}

.summary-content h4:first-child {
    margin-top: 0;
}

.summary-content p {
    margin-bottom: 1rem;
    line-height: 1.7;
}

.summary-content ul {
    margin: 1rem 0;
    padding-left: 2rem;
}

.summary-content li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.summary-content strong {
    color: var(--primary-color);
    font-weight: 600;
}

@media (max-width: 768px) {
    .progress-steps {
        flex-direction: column;
    }
    
    .step {
        width: 100%;
        text-align: center;
    }
}
`;

// Inject processing styles
const processingStyleSheet = document.createElement('style');
processingStyleSheet.textContent = processingStyles;
document.head.appendChild(processingStyleSheet);

// Initialize PDF summarizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pdfSummarizer = new PDFSummarizer();
});

// Global reset function
window.resetPdfUpload = function() {
    if (window.pdfSummarizer) {
        window.pdfSummarizer.reset();
    }
};