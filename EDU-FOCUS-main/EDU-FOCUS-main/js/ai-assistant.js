// AI Study Assistant / Chatbot
class AIAssistant {
    constructor() {
        this.apiKey = 'sk-proj-3arCQq4G1mlnNrC4mq6L870GQp-nvbsK2Bn1syYWPCGDvmv_CxtaaWju-SYVShB6Wu5XCpUoLHEpT3Blbk-FJF150m9fxPPyeGCh8lCd4mOC9wi6ujx-B81cTvatmWmHuH-WhqAGE9MykYC_mjNcFNEbSkh_gyAA';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.conversationHistory = [];
        this.uploadedMaterials = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.loadConversationHistory();
        this.loadUploadedMaterials();
        this.setupEventListeners();
        this.displayWelcomeMessage();
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-chat');
        const clearButton = document.getElementById('clear-chat');
        const uploadMaterialBtn = document.getElementById('upload-material');
        const materialInput = document.getElementById('material-input');

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearChat());
        }

        if (uploadMaterialBtn) {
            uploadMaterialBtn.addEventListener('click', () => {
                materialInput.click();
            });
        }

        if (materialInput) {
            materialInput.addEventListener('change', (e) => this.handleMaterialUpload(e));
        }
    }

    displayWelcomeMessage() {
        const welcomeMsg = {
            role: 'assistant',
            content: '👋 Hello! I\'m your AI Study Assistant. I can help you with:\n\n• Answering questions about programming (Java, Python, JavaScript, etc.)\n• Study tips and learning strategies\n• Explaining concepts from uploaded materials\n• Creating study plans\n\n📚 **Pro Tip:** Upload your study materials (PDF/TXT) for more personalized answers!\n\n💡 Currently running in demo mode. Ask me anything to get started!'
        };
        
        this.addMessageToUI(welcomeMsg);
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message || this.isProcessing) return;

        // Clear input
        chatInput.value = '';

        // Add user message to UI
        this.addMessageToUI({ role: 'user', content: message });

        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });

        // Show typing indicator
        this.showTypingIndicator();

        this.isProcessing = true;

        try {
            // Prepare context from uploaded materials
            const contextPrompt = this.buildContextPrompt();
            
            // Call OpenAI API
            const response = await this.callOpenAI(contextPrompt + message);

            // Remove typing indicator
            this.hideTypingIndicator();

            // Add assistant response to UI
            this.addMessageToUI({ role: 'assistant', content: response });

            // Add to conversation history
            this.conversationHistory.push({ role: 'assistant', content: response });

            // Save history
            this.saveConversationHistory();

        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessageToUI({ 
                role: 'assistant', 
                content: '❌ Sorry, I encountered an error. Please try again.' 
            });
        }

        this.isProcessing = false;
    }

    buildContextPrompt() {
        if (this.uploadedMaterials.length === 0) {
            return 'You are a helpful study assistant. Answer the student\'s question: ';
        }

        let context = 'You are a helpful study assistant. The student has uploaded the following materials:\n\n';
        
        this.uploadedMaterials.forEach((material, index) => {
            context += `${index + 1}. ${material.name}:\n${material.content.substring(0, 2000)}...\n\n`;
        });

        context += 'Based on these materials and your knowledge, answer the student\'s question: ';
        return context;
    }

    async callOpenAI(prompt) {
        try {
            const messages = [
                { role: 'system', content: 'You are an expert study assistant helping students learn effectively. Provide clear, concise, and educational responses.' },
                ...this.conversationHistory.slice(-6), // Last 3 exchanges
                { role: 'user', content: prompt }
            ];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                console.warn('OpenAI API failed, using fallback response');
                return this.getFallbackResponse(prompt);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            return this.getFallbackResponse(prompt);
        }
    }

    getFallbackResponse(prompt) {
        // PRIORITY 1: Check if we have uploaded materials - answer based on them first
        if (this.uploadedMaterials.length > 0) {
            const material = this.uploadedMaterials[0];
            const lowerQuestion = prompt.toLowerCase();
            const materialContent = material.content;
            
            // Extract key information from the material
            const materialSummary = this.analyzeUploadedMaterial(materialContent);
            
            // Questions about the material itself
            if (lowerQuestion.includes('what is') || lowerQuestion.includes('explain') || lowerQuestion.includes('define')) {
                return `Based on **${material.name}**:\n\n${materialSummary.summary}\n\n**Key Topics Found:**\n${materialSummary.topics}\n\n**Detailed Content:**\n${materialContent.substring(0, 1200)}\n\n---\n**For more detailed answers**, the full AI service would analyze the complete document. Please review the full material for comprehensive information.`;
            }
            
            if (lowerQuestion.includes('content') || lowerQuestion.includes('index') || lowerQuestion.includes('topics') || lowerQuestion.includes('chapters') || lowerQuestion.includes('what does')) {
                return `**Content Analysis of "${material.name}":**\n\n${materialSummary.topics}\n\n**Main Sections:**\n${materialContent.split('\n').filter(line => line.trim().length > 5 && line.trim().length < 150).slice(0, 10).map((line, i) => `${i+1}. ${line.trim()}`).join('\n')}\n\n**Document Overview:**\n${materialSummary.summary}`;
            }
            
            if (lowerQuestion.includes('summarize') || lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
                return `**Summary of "${material.name}":**\n\n${materialSummary.summary}\n\n**Key Concepts:**\n${materialSummary.topics}\n\n**Full Content Preview:**\n${materialContent.substring(0, 1500)}...`;
            }
            
            // Generic question about the material
            if (prompt.trim().length > 0 && !prompt.toLowerCase().includes('java') && !prompt.toLowerCase().includes('python') && !prompt.toLowerCase().includes('study tips')) {
                return `Based on your uploaded material **"${material.name}"**, I found the following relevant information:\n\n${materialSummary.summary}\n\n**Related Content from Your Material:**\n${materialContent.substring(0, 1000)}\n\n---\n\nYour question: "${prompt}"\n\nThis question appears to be about your material. Here's the relevant section from the document. For AI-powered detailed analysis, configure an API key.`;
            }
        }
        
        // PRIORITY 2: General knowledge questions (when no material uploaded)
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('java') && !lowerPrompt.includes('javascript')) {
            return `**Java Programming Language**\n\nJava is a high-level, object-oriented programming language developed by Sun Microsystems (now Oracle).\n\n**Key Features:**\n• **Platform Independent:** Write Once, Run Anywhere (WORA)\n• **Object-Oriented:** Classes, inheritance, polymorphism\n• **Secure:** Built-in security mechanisms\n• **Robust:** Strong exception handling\n• **Multi-threaded:** Concurrent programming support\n\n**Common Applications:**\n• Enterprise software\n• Android app development\n• Web applications\n• Big data processing\n\n**Basic Example:**\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java!");\n    }\n}\n\`\`\`\n\nWould you like me to explain specific Java concepts? Upload a Java textbook for more detailed answers!`;
        }
        
        if (lowerPrompt.includes('javascript')) {
            return `**JavaScript Programming Language**\n\nJavaScript is a versatile, event-driven programming language primarily used in web development.\n\n**Key Features:**\n• **Dynamic:** Variables can change types\n• **Lightweight:** No compilation needed\n• **Event-Driven:** Responds to user interactions\n• **Functional:** First-class functions, higher-order functions\n• **Asynchronous:** Supports callbacks, promises, async/await\n\n**Common Uses:**\n• Frontend web development\n• DOM manipulation\n• Backend with Node.js\n• Mobile apps (React Native)\n\n**Basic Example:**\n\`\`\`javascript\nfunction greet(name) {\n    return \`Hello, \${name}!\`;\n}\nconsole.log(greet("World"));\n\`\`\`\n\nUpload your JavaScript textbook for detailed explanations!`;
        }
        
        if (lowerPrompt.includes('python')) {
            return `**Python Programming Language**\n\nPython is a high-level, interpreted language known for simplicity and readability.\n\n**Key Features:**\n• **Simple Syntax:** Easy to learn and read\n• **Versatile:** Supports multiple paradigms\n• **Interpreted:** No compilation needed\n• **Large Ecosystem:** Extensive libraries\n\n**Primary Uses:**\n• Data Science & Machine Learning\n• Web development (Django, Flask)\n• Automation and scripting\n• Scientific computing\n\n**Basic Example:**\n\`\`\`python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n\`\`\`\n\nFor detailed Python explanations, upload your Python textbook!`;
        }
        
        if (lowerPrompt.match(/study|learn|tip|strategy|focus|remember|improve/i)) {
            return `**Study Tips & Learning Strategies**\n\n**Active Learning Techniques:**\n• **Active Recall:** Test yourself without looking at notes\n• **Spaced Repetition:** Review at intervals (1 day, 3 days, 1 week)\n• **Teach Others:** Explain concepts to someone else\n• **Practice Problems:** Apply knowledge to exercises\n\n**Time Management:**\n• **Pomodoro:** 25 min focus + 5 min break\n• **Priority First:** Study hardest topics when fresh\n• **Consistent Schedule:** Same time daily for better habits\n\n**Memory Techniques:**\n• Mind mapping for visual organization\n• Mnemonics for memorization\n• Writing notes by hand (better retention)\n• Connecting new info to existing knowledge\n\n**Pro Tip:** Upload your textbook and ask specific questions about the content!`;
        }
        
        // Default response
        return `**Answer:** I'm ready to help!\n\n📚 **Best way to get accurate answers:**\n\n1. **Upload Your Textbook/Material** - Click "Upload Material"\n2. **Ask Specific Questions** - About topics in your book\n3. **Get Context-Based Answers** - I'll extract from your uploaded content\n\n**What I Can Help With:**\n• Explain concepts from your uploaded books\n• Answer questions based on your study materials\n• Programming language tutorials\n• Study strategies and tips\n\n**Your Question:** "${prompt}"\n\nUpload a textbook related to this topic, and I'll provide accurate, context-aware answers! 🚀`;
    }

    analyzeUploadedMaterial(content) {
        // Extract summary and topics from uploaded material
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        
        // Find key topics (lines that look like headings or important info)
        const topics = [];
        const keyTerms = [];
        
        for (let i = 0; i < Math.min(lines.length, 50); i++) {
            const line = lines[i].trim();
            
            // Detect headings and key information
            if (line.match(/^(Chapter|Unit|Section|Topic|Module|\d+\.|\*\*|###)/i) || 
                (line.length > 10 && line.length < 100 && line.match(/^[A-Z]/))) {
                topics.push(`• ${line.substring(0, 100)}`);
            }
            
            // Extract key terms (capitalized words)
            const words = line.split(' ');
            words.forEach(word => {
                if (word.match(/^[A-Z][a-z]+/) && word.length > 3) {
                    keyTerms.push(word);
                }
            });
        }
        
        // Create summary
        const summary = `This material covers important concepts. The document contains ${Math.round(content.length / 500)} main sections with detailed explanations.`;
        
        // Deduplicate topics
        const uniqueTopics = [...new Set(topics)].slice(0, 8);
        
        return {
            summary: summary,
            topics: uniqueTopics.length > 0 ? uniqueTopics.join('\n') : '• No specific topics detected. Please review the full material.',
            keyTerms: keyTerms.slice(0, 10)
        };
    }

    extractKeyTopics(content) {
        // Simple topic extraction from content
        const lines = content.split('\n').filter(line => line.trim().length > 10);
        const topics = [];
        
        // Look for lines that might be headings or important points
        for (let i = 0; i < Math.min(lines.length, 20); i++) {
            const line = lines[i].trim();
            if (line.length < 100 && line.length > 5) {
                // Check if it looks like a heading or key point
                if (line.match(/^[A-Z]/) || line.match(/^\d+\./) || line.match(/^Chapter/i) || line.match(/^Unit/i)) {
                    topics.push(`• ${line}`);
                }
            }
        }
        
        if (topics.length === 0) {
            return `The document contains ${Math.floor(content.length / 100)} sections of content covering various topics.`;
        }
        
        return topics.slice(0, 10).join('\n');
    }

    addMessageToUI(message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.role}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.role === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Format the content with basic markdown-like styling
        const formattedContent = message.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^(• )/gm, '<br>• ');
        
        content.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async handleMaterialUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await this.extractTextFromFile(file);
            
            this.uploadedMaterials.push({
                name: file.name,
                content: content,
                uploadDate: new Date().toISOString()
            });

            this.saveUploadedMaterials();
            this.displayUploadedMaterials();

            this.addMessageToUI({
                role: 'assistant',
                content: `✅ I've received "${file.name}". I can now answer questions about this material!`
            });

        } catch (error) {
            console.error('Error uploading material:', error);
            alert('Error uploading file. Please try again.');
        }
    }

    async extractTextFromFile(file) {
        if (file.type === 'application/pdf') {
            // For PDF files
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedarray = new Uint8Array(e.target.result);
                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                        let fullText = '';
                        
                        for (let i = 1; i <= pdf.numPages; i++) {
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
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        } else {
            // For text files
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
    }

    displayUploadedMaterials() {
        const materialsList = document.getElementById('uploaded-materials-list');
        if (!materialsList) return;

        materialsList.innerHTML = '';

        this.uploadedMaterials.forEach((material, index) => {
            const materialDiv = document.createElement('div');
            materialDiv.className = 'uploaded-material-item';
            materialDiv.innerHTML = `
                <i class="fas fa-file-alt"></i>
                <span>${material.name}</span>
                <button onclick="aiAssistant.removeMaterial(${index})" class="remove-material">
                    <i class="fas fa-times"></i>
                </button>
            `;
            materialsList.appendChild(materialDiv);
        });
    }

    removeMaterial(index) {
        this.uploadedMaterials.splice(index, 1);
        this.saveUploadedMaterials();
        this.displayUploadedMaterials();
    }

    clearChat() {
        if (confirm('Clear all chat history?')) {
            this.conversationHistory = [];
            this.saveConversationHistory();
            
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = '';
            
            this.displayWelcomeMessage();
        }
    }

    saveConversationHistory() {
        localStorage.setItem('aiAssistantHistory', JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('aiAssistantHistory');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }

    saveUploadedMaterials() {
        localStorage.setItem('aiAssistantMaterials', JSON.stringify(this.uploadedMaterials));
    }

    loadUploadedMaterials() {
        const saved = localStorage.getItem('aiAssistantMaterials');
        if (saved) {
            this.uploadedMaterials = JSON.parse(saved);
            this.displayUploadedMaterials();
        }
    }
}

// Initialize when DOM is loaded
let aiAssistant;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        aiAssistant = new AIAssistant();
    });
} else {
    aiAssistant = new AIAssistant();
}
