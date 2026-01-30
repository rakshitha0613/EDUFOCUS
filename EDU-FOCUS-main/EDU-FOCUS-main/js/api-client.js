// API Client for EDU-FOCUS Backend
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('access_token');
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    // Get authorization headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API call
    async call(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const config = {
            method,
            headers: this.getHeaders(requiresAuth)
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== Authentication ====================
    async register(username, email, password, fullName = '') {
        const result = await this.call('/auth/register', 'POST', {
            username,
            email,
            password,
            full_name: fullName
        }, false);
        
        this.setToken(result.access_token);
        return result;
    }

    async login(username, password) {
        const result = await this.call('/auth/login', 'POST', {
            username,
            password
        }, false);
        
        this.setToken(result.access_token);
        return result;
    }

    async getCurrentUser() {
        return await this.call('/auth/me');
    }

    async updateProfile(data) {
        return await this.call('/auth/update-profile', 'PUT', data);
    }

    logout() {
        this.token = null;
        localStorage.removeItem('access_token');
    }

    // ==================== Study Sessions ====================
    async getSessions() {
        return await this.call('/study/sessions');
    }

    async createSession(sessionData) {
        return await this.call('/study/sessions', 'POST', sessionData);
    }

    async updateSession(sessionId, sessionData) {
        return await this.call(`/study/sessions/${sessionId}`, 'PUT', sessionData);
    }

    async deleteSession(sessionId) {
        return await this.call(`/study/sessions/${sessionId}`, 'DELETE');
    }

    // ==================== Flashcards ====================
    async getFlashcardDecks() {
        return await this.call('/study/flashcards/decks');
    }

    async createDeck(name, description = '') {
        return await this.call('/study/flashcards/decks', 'POST', {
            name,
            description
        });
    }

    async deleteDeck(deckId) {
        return await this.call(`/study/flashcards/decks/${deckId}`, 'DELETE');
    }

    async addCard(deckId, question, answer, difficulty = 'medium') {
        return await this.call(`/study/flashcards/decks/${deckId}/cards`, 'POST', {
            question,
            answer,
            difficulty
        });
    }

    async deleteCard(cardId) {
        return await this.call(`/study/flashcards/cards/${cardId}`, 'DELETE');
    }

    // ==================== Notes ====================
    async getNotes() {
        return await this.call('/study/notes');
    }

    async createNote(title, content, tags = []) {
        return await this.call('/study/notes', 'POST', {
            title,
            content,
            tags
        });
    }

    async updateNote(noteId, title, content, tags = []) {
        return await this.call(`/study/notes/${noteId}`, 'PUT', {
            title,
            content,
            tags
        });
    }

    async deleteNote(noteId) {
        return await this.call(`/study/notes/${noteId}`, 'DELETE');
    }

    // ==================== Quizzes ====================
    async getQuizzes() {
        return await this.call('/study/quizzes');
    }

    async createQuiz(title, topic, difficulty, questions) {
        return await this.call('/study/quizzes', 'POST', {
            title,
            topic,
            difficulty,
            questions
        });
    }

    async deleteQuiz(quizId) {
        return await this.call(`/study/quizzes/${quizId}`, 'DELETE');
    }

    // ==================== Mind Maps ====================
    async getMindMaps() {
        return await this.call('/study/mindmaps');
    }

    async createMindMap(title, description, mapData) {
        return await this.call('/study/mindmaps', 'POST', {
            title,
            description,
            map_data: mapData
        });
    }

    async updateMindMap(mapId, title, description, mapData) {
        return await this.call(`/study/mindmaps/${mapId}`, 'PUT', {
            title,
            description,
            map_data: mapData
        });
    }

    async deleteMindMap(mapId) {
        return await this.call(`/study/mindmaps/${mapId}`, 'DELETE');
    }

    // ==================== Pomodoro Stats ====================
    async getPomodoroStats() {
        return await this.call('/study/pomodoro/stats');
    }

    async updatePomodoroStats(sessionsCompleted, totalFocusTime) {
        return await this.call('/study/pomodoro/stats', 'POST', {
            sessions_completed: sessionsCompleted,
            total_focus_time: totalFocusTime
        });
    }

    // ==================== AI Features ====================
    async chatWithAI(message, conversationHistory = []) {
        return await this.call('/ai/chat', 'POST', {
            message,
            history: conversationHistory
        });
    }

    async summarizeVideo(title, transcript) {
        return await this.call('/ai/summarize-video', 'POST', {
            title,
            transcript
        });
    }

    async summarizePDF(text) {
        return await this.call('/ai/summarize-pdf', 'POST', {
            text
        });
    }

    async getRecommendations(performanceData, studyHistory) {
        return await this.call('/ai/recommendations', 'POST', {
            performance: performanceData,
            study_history: studyHistory
        });
    }

    async generateStudyGuide(topic, format = 'comprehensive') {
        return await this.call('/ai/study-guide', 'POST', {
            topic,
            format
        });
    }

    async analyzeMaterial(content, question = '') {
        return await this.call('/ai/analyze-material', 'POST', {
            content,
            question
        });
    }
}

// Create global API client instance
const api = new APIClient();

// Example Usage:
/*
// Register
await api.register('john_doe', 'john@example.com', 'password123', 'John Doe');

// Login
await api.login('john_doe', 'password123');

// Create a study session
await api.createSession({
    subject: 'Mathematics',
    date: '2026-02-01',
    time: '14:00',
    duration: 60,
    goals: 'Complete calculus homework'
});

// Chat with AI
const response = await api.chatWithAI('Explain photosynthesis');
console.log(response.reply);

// Logout
api.logout();
*/
