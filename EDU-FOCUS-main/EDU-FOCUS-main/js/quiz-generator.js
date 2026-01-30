class QuizGenerator {
    constructor() {
        this.quizzes = [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.init();
    }

    init() {
        this.loadQuizzes();
        this.setupListeners();
        this.renderQuizzes();
    }

    setupListeners() {
        document.getElementById('generateQuizBtn')?.addEventListener('click', () => this.openGenerateModal());
        document.getElementById('generateForm')?.addEventListener('submit', (e) => this.generateQuiz(e));
        document.getElementById('closeGenerateModal')?.addEventListener('click', () => this.closeGenerateModal());
        
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitQuizBtn')?.addEventListener('click', () => this.submitQuiz());
        document.getElementById('retakeQuizBtn')?.addEventListener('click', () => this.retakeQuiz());
    }

    openGenerateModal() {
        document.getElementById('generateModal').style.display = 'block';
    }

    closeGenerateModal() {
        document.getElementById('generateModal').style.display = 'none';
        document.getElementById('generateForm').reset();
    }

    generateQuiz(e) {
        e.preventDefault();

        const topic = document.getElementById('quizTopic').value;
        const difficulty = document.getElementById('quizDifficulty').value;
        const questionCount = parseInt(document.getElementById('questionCount').value);

        const quiz = {
            id: Date.now(),
            title: `${topic} Quiz`,
            topic: topic,
            difficulty: difficulty,
            questions: this.generateQuestions(topic, difficulty, questionCount),
            createdDate: new Date().toISOString(),
            attempts: [],
            status: 'pending'
        };

        this.quizzes.push(quiz);
        this.saveQuizzes();
        this.closeGenerateModal();
        this.renderQuizzes();
    }

    generateQuestions(topic, difficulty, count) {
        const questionTemplates = {
            'Mathematics': [
                { q: 'What is 15 × 8?', a: 'a) 100', b: 'b) 120', c: 'c) 140', d: 'd) 150', correct: 'b' },
                { q: 'Solve: 3x + 5 = 20', a: 'a) 3', b: 'b) 5', c: 'c) 7', d: 'd) 10', correct: 'b' },
                { q: 'What is √144?', a: 'a) 10', b: 'b) 11', c: 'c) 12', d: 'd) 13', correct: 'c' },
                { q: 'Find the area of a circle with radius 5:', a: 'a) 25π', b: 'b) 10π', c: 'c) 50π', d: 'd) 5π', correct: 'a' },
                { q: 'What is 2^8?', a: 'a) 128', b: 'b) 256', c: 'c) 512', d: 'd) 1024', correct: 'b' }
            ],
            'Science': [
                { q: 'What is the chemical formula for water?', a: 'a) H2O', b: 'b) CO2', c: 'c) O2', d: 'd) NaCl', correct: 'a' },
                { q: 'What is the speed of light?', a: 'a) 3×10^8 m/s', b: 'b) 3×10^6 m/s', c: 'c) 3×10^10 m/s', d: 'd) 3×10^4 m/s', correct: 'a' },
                { q: 'What is the powerhouse of the cell?', a: 'a) Nucleus', b: 'b) Mitochondria', c: 'c) Ribosome', d: 'd) Chloroplast', correct: 'b' },
                { q: 'How many planets in our solar system?', a: 'a) 7', b: 'b) 8', c: 'c) 9', d: 'd) 10', correct: 'b' },
                { q: 'What is the smallest unit of life?', a: 'a) Atom', b: 'b) Molecule', c: 'c) Cell', d: 'd) Organism', correct: 'c' }
            ],
            'History': [
                { q: 'In which year did World War II end?', a: 'a) 1943', b: 'b) 1944', c: 'c) 1945', d: 'd) 1946', correct: 'c' },
                { q: 'Who was the first President of the USA?', a: 'a) Thomas Jefferson', b: 'b) George Washington', c: 'c) John Adams', d: 'd) Benjamin Franklin', correct: 'b' },
                { q: 'When did the Renaissance begin?', a: 'a) 13th century', b: 'b) 14th century', c: 'c) 15th century', d: 'd) 16th century', correct: 'b' },
                { q: 'What year was the Magna Carta signed?', a: 'a) 1215', b: 'b) 1265', c: 'c) 1315', d: 'd) 1365', correct: 'a' },
                { q: 'Which ancient wonder is in Egypt?', a: 'a) Colossus', b: 'b) Great Pyramid', c: 'c) Hanging Gardens', d: 'd) Lighthouse', correct: 'b' }
            ],
            'English': [
                { q: 'Who wrote Romeo and Juliet?', a: 'a) Christopher Marlowe', b: 'b) William Shakespeare', c: 'c) Ben Jonson', d: 'd) John Milton', correct: 'b' },
                { q: 'What is a metaphor?', a: 'a) A comparison using "like"', b: 'b) A direct comparison without "like"', c: 'c) A repeated sound', d: 'd) A type of poem', correct: 'b' },
                { q: 'Who wrote Pride and Prejudice?', a: 'a) Jane Austen', b: 'b) Charlotte Brontë', c: 'c) Mary Shelley', d: 'd) Emily Dickinson', correct: 'a' },
                { q: 'What is an oxymoron?', a: 'a) Repetition of sounds', b: 'b) Contradiction in terms', c: 'c) Exaggeration', d: 'd) Understatement', correct: 'b' },
                { q: 'Who wrote 1984?', a: 'a) George Orwell', b: 'b) Aldous Huxley', c: 'c) Ray Bradbury', d: 'd) Philip K. Dick', correct: 'a' }
            ]
        };

        const templates = questionTemplates[topic] || questionTemplates['Mathematics'];
        const questions = [];

        for (let i = 0; i < Math.min(count, templates.length); i++) {
            const template = templates[i];
            questions.push({
                question: template.q,
                options: [template.a, template.b, template.c, template.d],
                correctAnswer: template.correct,
                difficulty: difficulty,
                userAnswer: null
            });
        }

        return questions;
    }

    selectQuiz(quizId) {
        this.currentQuiz = this.quizzes.find(q => q.id === quizId);
        this.currentQuestionIndex = 0;
        this.score = 0;
        document.getElementById('quizzesList').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
        this.renderQuizContent();
    }

    backToQuizzes() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        document.getElementById('quizzesList').style.display = 'block';
        document.getElementById('quizContent').style.display = 'none';
        this.renderQuizzes();
    }

    renderQuizContent() {
        if (!this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const content = document.getElementById('quizContent');

        content.innerHTML = `
            <div class="quiz-header">
                <button class="btn-back" onclick="quizGenerator.backToQuizzes()">← Back</button>
                <h2>${this.currentQuiz.title}</h2>
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100}%"></div>
                    </div>
                    <p>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</p>
                </div>
            </div>

            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="quiz-options" id="optionsContainer">
                    ${question.options.map((option, idx) => `
                        <label class="option-label">
                            <input type="radio" name="answer" value="${String.fromCharCode(97 + idx)}" onchange="quizGenerator.selectAnswer('${String.fromCharCode(97 + idx)}')">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="quiz-actions">
                <button id="nextQuestionBtn" class="btn-primary" ${this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? 'style="display:none"' : ''}>Next Question →</button>
                <button id="submitQuizBtn" class="btn-success" ${this.currentQuestionIndex !== this.currentQuiz.questions.length - 1 ? 'style="display:none"' : ''}>Submit Quiz</button>
            </div>
        `;

        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitQuizBtn')?.addEventListener('click', () => this.submitQuiz());
    }

    selectAnswer(answer) {
        this.currentQuiz.questions[this.currentQuestionIndex].userAnswer = answer;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuizContent();
        }
    }

    submitQuiz() {
        let correct = 0;
        this.currentQuiz.questions.forEach(q => {
            if (q.userAnswer === q.correctAnswer) correct++;
        });

        const percentage = ((correct / this.currentQuiz.questions.length) * 100).toFixed(2);
        
        const attempt = {
            date: new Date().toISOString(),
            score: correct,
            total: this.currentQuiz.questions.length,
            percentage: percentage
        };

        this.currentQuiz.attempts.push(attempt);
        this.currentQuiz.status = 'completed';
        this.saveQuizzes();

        this.showResults(correct, this.currentQuiz.questions.length, percentage);
    }

    showResults(correct, total, percentage) {
        const content = document.getElementById('quizContent');
        
        const performance = percentage >= 80 ? '🌟 Excellent!' : percentage >= 60 ? '👍 Good' : '📚 Keep Practicing';
        
        content.innerHTML = `
            <div class="quiz-results">
                <h2>Quiz Complete!</h2>
                <div class="results-score">
                    <span class="score-number">${percentage}%</span>
                    <span class="score-text">${performance}</span>
                </div>
                <div class="results-details">
                    <p><strong>Correct Answers:</strong> ${correct} / ${total}</p>
                    <p><strong>Incorrect:</strong> ${total - correct}</p>
                </div>

                <div class="review-section">
                    <h3>Answer Review:</h3>
                    <div class="review-list">
                        ${this.currentQuiz.questions.map((q, idx) => `
                            <div class="review-item ${q.userAnswer === q.correctAnswer ? 'correct' : 'incorrect'}">
                                <h4>Q${idx + 1}: ${q.question}</h4>
                                <p><strong>Your Answer:</strong> ${q.userAnswer}</p>
                                <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="results-actions">
                    <button id="retakeQuizBtn" class="btn-primary">🔄 Retake Quiz</button>
                    <button class="btn-secondary" onclick="quizGenerator.backToQuizzes()">← Back to Quizzes</button>
                </div>
            </div>
        `;

        document.getElementById('retakeQuizBtn')?.addEventListener('click', () => this.retakeQuiz());
    }

    retakeQuiz() {
        const quizId = this.currentQuiz.id;
        this.currentQuiz = this.quizzes.find(q => q.id === quizId);
        this.currentQuiz.status = 'pending';
        this.currentQuiz.questions.forEach(q => q.userAnswer = null);
        this.currentQuestionIndex = 0;
        this.renderQuizContent();
    }

    renderQuizzes() {
        const container = document.getElementById('quizzesList');
        if (!container) return;

        container.innerHTML = `
            <div class="quizzes-header">
                <h2>📝 My Quizzes</h2>
                <button id="generateQuizBtn" class="btn-primary">➕ Generate Quiz</button>
            </div>
            <div class="quizzes-grid">
                ${this.quizzes.map(quiz => {
                    const attempts = quiz.attempts.length;
                    const avgScore = attempts > 0 
                        ? (quiz.attempts.reduce((sum, a) => sum + parseFloat(a.percentage), 0) / attempts).toFixed(1)
                        : 'N/A';
                    
                    return `
                        <div class="quiz-card" onclick="quizGenerator.selectQuiz(${quiz.id})">
                            <h3>${quiz.title}</h3>
                            <p class="quiz-topic">${quiz.topic} • ${quiz.difficulty}</p>
                            <div class="quiz-card-stats">
                                <span>📋 ${quiz.questions.length} questions</span>
                                <span>📊 ${attempts} attempts</span>
                                <span>⭐ ${avgScore}% avg</span>
                            </div>
                            <p class="quiz-status">${quiz.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        document.getElementById('generateQuizBtn')?.addEventListener('click', () => this.openGenerateModal());
    }

    saveQuizzes() {
        localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
    }

    loadQuizzes() {
        const saved = localStorage.getItem('quizzes');
        this.quizzes = saved ? JSON.parse(saved) : [];
    }
}

// Global reference
let quizGenerator;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quizzesList')) {
        quizGenerator = new QuizGenerator();
    }
});
