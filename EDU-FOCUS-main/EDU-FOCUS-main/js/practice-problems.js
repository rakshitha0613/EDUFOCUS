class PracticeProblems {
    constructor() {
        this.problems = [];
        this.currentProblem = null;
        this.currentProblemIndex = 0;
        this.userAnswer = '';
        this.init();
    }

    init() {
        this.loadProblems();
        this.initializeSampleProblems();
        this.setupListeners();
        this.renderProblems();
    }

    initializeSampleProblems() {
        if (this.problems.length > 0) return;

        this.problems = [
            {
                id: 1,
                subject: 'Mathematics',
                difficulty: 'Easy',
                title: 'Basic Algebra',
                problem: 'Solve for x: 2x + 5 = 13',
                solution: 'x = 4\n\nStep 1: 2x + 5 = 13\nStep 2: 2x = 13 - 5\nStep 3: 2x = 8\nStep 4: x = 8/2 = 4',
                explanation: 'To solve for x, isolate x by moving constants to the other side and dividing by the coefficient.',
                topic: 'Algebra'
            },
            {
                id: 2,
                subject: 'Science',
                difficulty: 'Medium',
                title: 'Photosynthesis',
                problem: 'Explain the process of photosynthesis in plants.',
                solution: 'Photosynthesis is a process where plants convert light energy into chemical energy. Formula: 6CO2 + 6H2O + light → C6H12O6 + 6O2',
                explanation: 'Plants use chlorophyll to absorb light energy, which powers the conversion of carbon dioxide and water into glucose (food) and oxygen.',
                topic: 'Biology'
            },
            {
                id: 3,
                subject: 'Programming',
                difficulty: 'Easy',
                title: 'Variables in Python',
                problem: 'Write Python code to create a variable named "age" with value 25 and print it.',
                solution: 'age = 25\nprint(age)',
                explanation: 'Variables are containers for storing data values. In Python, you assign a value with = and print() displays the value.',
                topic: 'Python Basics'
            },
            {
                id: 4,
                subject: 'Mathematics',
                difficulty: 'Hard',
                title: 'Calculus - Integration',
                problem: 'Find the integral of 3x² + 2x',
                solution: '∫(3x² + 2x)dx = x³ + x² + C',
                explanation: 'Use the power rule: ∫xⁿdx = xⁿ⁺¹/(n+1) + C\nFor 3x²: 3 × x³/3 = x³\nFor 2x: 2 × x²/2 = x²',
                topic: 'Calculus'
            },
            {
                id: 5,
                subject: 'History',
                difficulty: 'Medium',
                title: 'World War II',
                problem: 'What year did World War II end? Name 2 key outcomes.',
                solution: '1945\nKey Outcomes:\n1. Creation of United Nations\n2. Emergence of USA and USSR as superpowers',
                explanation: 'WWII ended on September 2, 1945. It reshaped international relations and geopolitics.',
                topic: 'Modern History'
            },
            {
                id: 6,
                subject: 'Programming',
                difficulty: 'Medium',
                title: 'JavaScript Functions',
                problem: 'Write a JavaScript function that returns the square of a number.',
                solution: 'function square(num) {\n  return num * num;\n}\n\nconsole.log(square(5)); // Output: 25',
                explanation: 'Functions are reusable blocks of code. This function takes a parameter "num" and returns its square.',
                topic: 'JavaScript'
            }
        ];

        this.saveProblems();
    }

    setupListeners() {
        document.getElementById('filterSubject')?.addEventListener('change', (e) => this.filterProblems(e.target.value));
        document.getElementById('filterDifficulty')?.addEventListener('change', (e) => this.filterByDifficulty(e.target.value));
        document.getElementById('submitAnswerBtn')?.addEventListener('click', () => this.submitAnswer());
        document.getElementById('viewSolutionBtn')?.addEventListener('click', () => this.viewSolution());
        document.getElementById('nextProblemBtn')?.addEventListener('click', () => this.nextProblem());
        document.getElementById('previousProblemBtn')?.addEventListener('click', () => this.previousProblem());
        document.getElementById('backToProblemListBtn')?.addEventListener('click', () => this.backToProblemList());
    }

    renderProblems() {
        const container = document.getElementById('problemsList');
        if (!container) return;

        const bySubject = {};
        this.problems.forEach(p => {
            if (!bySubject[p.subject]) bySubject[p.subject] = [];
            bySubject[p.subject].push(p);
        });

        container.innerHTML = `
            <div class="problems-header">
                <h2>💪 Practice Problems</h2>
                <div class="filter-controls">
                    <select id="filterSubject" class="filter-select">
                        <option value="">All Subjects</option>
                        ${Object.keys(bySubject).map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                    </select>
                    <select id="filterDifficulty" class="filter-select">
                        <option value="">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <div class="problems-grid" id="problemsGrid">
                ${this.problems.map(problem => `
                    <div class="problem-card" onclick="practiceProblems.selectProblem(${problem.id})">
                        <div class="problem-badge">${problem.difficulty}</div>
                        <h3>${problem.title}</h3>
                        <p class="problem-subject">${problem.subject} • ${problem.topic}</p>
                        <p class="problem-preview">${problem.problem.substring(0, 80)}...</p>
                        <div class="problem-footer">
                            <span class="view-solution">View →</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('filterSubject')?.addEventListener('change', (e) => this.filterProblems(e.target.value));
        document.getElementById('filterDifficulty')?.addEventListener('change', (e) => this.filterByDifficulty(e.target.value));
    }

    selectProblem(problemId) {
        this.currentProblem = this.problems.find(p => p.id === problemId);
        this.currentProblemIndex = this.problems.findIndex(p => p.id === problemId);
        this.userAnswer = '';
        document.getElementById('problemsList').style.display = 'none';
        document.getElementById('problemViewer').style.display = 'block';
        this.renderProblemViewer();
    }

    backToProblemList() {
        this.currentProblem = null;
        document.getElementById('problemsList').style.display = 'block';
        document.getElementById('problemViewer').style.display = 'none';
        this.renderProblems();
    }

    renderProblemViewer() {
        if (!this.currentProblem) return;

        const viewer = document.getElementById('problemViewer');
        viewer.innerHTML = `
            <div class="problem-viewer-header">
                <button id="backToProblemListBtn" class="btn-back">← Back</button>
                <h2>${this.currentProblem.title}</h2>
                <div class="problem-meta">
                    <span class="badge-subject">${this.currentProblem.subject}</span>
                    <span class="badge-difficulty ${this.currentProblem.difficulty.toLowerCase()}">${this.currentProblem.difficulty}</span>
                    <span class="badge-topic">${this.currentProblem.topic}</span>
                </div>
            </div>

            <div class="problem-content">
                <div class="problem-statement">
                    <h3>Problem:</h3>
                    <p>${this.currentProblem.problem}</p>
                </div>

                <div class="answer-section">
                    <h3>Your Answer:</h3>
                    <textarea id="answerInput" class="answer-input" placeholder="Type or paste your answer here..."></textarea>
                    <div class="answer-buttons">
                        <button id="submitAnswerBtn" class="btn-primary">✓ Submit Answer</button>
                        <button id="viewSolutionBtn" class="btn-secondary">👁 View Solution</button>
                    </div>
                </div>

                <div id="solutionSection" class="solution-section" style="display: none;">
                    <h3>Solution:</h3>
                    <pre class="solution-text">${this.currentProblem.solution}</pre>
                    <h4>Explanation:</h4>
                    <p>${this.currentProblem.explanation}</p>
                </div>
            </div>

            <div class="problem-navigation">
                <button id="previousProblemBtn" class="btn-nav" ${this.currentProblemIndex === 0 ? 'disabled' : ''}>← Previous</button>
                <span class="problem-counter">${this.currentProblemIndex + 1} / ${this.problems.length}</span>
                <button id="nextProblemBtn" class="btn-nav" ${this.currentProblemIndex === this.problems.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
        `;

        this.setupListeners();
    }

    submitAnswer() {
        this.userAnswer = document.getElementById('answerInput').value;
        
        if (!this.userAnswer.trim()) {
            alert('Please enter your answer first!');
            return;
        }

        const feedback = this.evaluateAnswer(this.userAnswer, this.currentProblem.solution);
        
        const sectionElement = document.getElementById('solutionSection');
        if (sectionElement) {
            sectionElement.innerHTML = `
                <div class="feedback ${feedback.correct ? 'correct' : 'incorrect'}">
                    <h3>${feedback.message}</h3>
                    <p>${feedback.details}</p>
                </div>
                <h3>Correct Solution:</h3>
                <pre class="solution-text">${this.currentProblem.solution}</pre>
                <h4>Explanation:</h4>
                <p>${this.currentProblem.explanation}</p>
            `;
            sectionElement.style.display = 'block';
        }
    }

    evaluateAnswer(userAnswer, correctSolution) {
        const userText = userAnswer.toLowerCase().replace(/\s+/g, '');
        const correctText = correctSolution.toLowerCase().replace(/\s+/g, '');

        if (userText.includes(correctText.substring(0, 20))) {
            return {
                correct: true,
                message: '✅ Excellent! Your answer is correct!',
                details: 'Great job! You understand this concept well.'
            };
        } else {
            return {
                correct: false,
                message: '❌ Not quite right',
                details: 'Review the solution and explanation to understand the correct approach.'
            };
        }
    }

    viewSolution() {
        const solutionSection = document.getElementById('solutionSection');
        if (solutionSection) {
            solutionSection.style.display = solutionSection.style.display === 'none' ? 'block' : 'none';
        }
    }

    nextProblem() {
        if (this.currentProblemIndex < this.problems.length - 1) {
            this.selectProblem(this.problems[this.currentProblemIndex + 1].id);
        }
    }

    previousProblem() {
        if (this.currentProblemIndex > 0) {
            this.selectProblem(this.problems[this.currentProblemIndex - 1].id);
        }
    }

    filterProblems(subject) {
        const grid = document.getElementById('problemsGrid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.problem-card');
        cards.forEach(card => {
            const cardSubject = card.querySelector('.problem-subject').textContent.split(' •')[0].trim();
            card.style.display = subject === '' || cardSubject === subject ? 'block' : 'none';
        });
    }

    filterByDifficulty(difficulty) {
        const cards = document.querySelectorAll('.problem-card');
        cards.forEach(card => {
            const badge = card.querySelector('.problem-badge').textContent;
            card.style.display = difficulty === '' || badge === difficulty ? 'block' : 'none';
        });
    }

    saveProblems() {
        localStorage.setItem('practiceProblems', JSON.stringify(this.problems));
    }

    loadProblems() {
        const saved = localStorage.getItem('practiceProblems');
        this.problems = saved ? JSON.parse(saved) : [];
    }
}

// Global reference
let practiceProblems;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('problemsList')) {
        practiceProblems = new PracticeProblems();
    }
});
