class FlashcardSystem {
    constructor() {
        this.decks = [];
        this.currentDeck = null;
        this.currentCardIndex = 0;
        this.studyMode = false;
        this.init();
    }

    init() {
        this.loadDecks();
        this.setupListeners();
        this.renderDecks();
    }

    setupListeners() {
        document.getElementById('createDeckBtn')?.addEventListener('click', () => this.openDeckModal());
        document.getElementById('deckForm')?.addEventListener('submit', (e) => this.createDeck(e));
        document.getElementById('closeDeckModal')?.addEventListener('click', () => this.closeDeckModal());
        
        document.getElementById('addCardBtn')?.addEventListener('click', () => this.openCardModal());
        document.getElementById('cardForm')?.addEventListener('submit', (e) => this.addCard(e));
        document.getElementById('closeCardModal')?.addEventListener('click', () => this.closeCardModal());

        document.getElementById('startStudyBtn')?.addEventListener('click', () => this.startStudy());
        document.getElementById('nextCardBtn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('prevCardBtn')?.addEventListener('click', () => this.previousCard());
        document.getElementById('flipCardBtn')?.addEventListener('click', () => this.flipCard());
        document.getElementById('markCorrectBtn')?.addEventListener('click', () => this.markCorrect());
        document.getElementById('markIncorrectBtn')?.addEventListener('click', () => this.markIncorrect());
        document.getElementById('exitStudyBtn')?.addEventListener('click', () => this.exitStudy());
    }

    openDeckModal() {
        document.getElementById('deckModal').style.display = 'block';
    }

    closeDeckModal() {
        document.getElementById('deckModal').style.display = 'none';
        document.getElementById('deckForm').reset();
    }

    createDeck(e) {
        e.preventDefault();

        const deck = {
            id: Date.now(),
            name: document.getElementById('deckName').value,
            description: document.getElementById('deckDescription').value,
            cards: [],
            createdDate: new Date().toISOString(),
            stats: {
                totalCards: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                lastReviewDate: null
            }
        };

        this.decks.push(deck);
        this.saveDecks();
        this.closeDeckModal();
        this.renderDecks();
    }

    selectDeck(deckId) {
        this.currentDeck = this.decks.find(d => d.id === deckId);
        this.currentCardIndex = 0;
        document.getElementById('decksList').style.display = 'none';
        document.getElementById('deckContent').style.display = 'block';
        this.renderDeckContent();
    }

    backToDecksList() {
        this.currentDeck = null;
        this.currentCardIndex = 0;
        document.getElementById('decksList').style.display = 'block';
        document.getElementById('deckContent').style.display = 'none';
        this.studyMode = false;
        this.renderDecks();
    }

    renderDeckContent() {
        if (!this.currentDeck) return;

        const content = document.getElementById('deckContent');
        content.innerHTML = `
            <div class="deck-header">
                <button class="btn-back" onclick="flashcardSystem.backToDecksList()">← Back</button>
                <h2>${this.currentDeck.name}</h2>
                <div class="deck-stats">
                    <span>📊 Cards: ${this.currentDeck.cards.length}</span>
                    <span>✅ Correct: ${this.currentDeck.stats.correctAnswers}</span>
                </div>
            </div>

            ${!this.studyMode ? `
                <div class="deck-actions">
                    <button id="addCardBtn" class="btn-primary">➕ Add Card</button>
                    <button id="startStudyBtn" class="btn-success">▶ Start Study</button>
                </div>
                <div class="cards-list" id="cardsList">
                    ${this.currentDeck.cards.map((card, idx) => `
                        <div class="card-item">
                            <div class="card-preview">
                                <p><strong>Q:</strong> ${card.question}</p>
                                <p><strong>A:</strong> ${card.answer}</p>
                            </div>
                            <button onclick="flashcardSystem.deleteCard(${idx})" class="btn-delete">🗑</button>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="study-view" id="studyView">
                    <div class="study-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.currentCardIndex + 1) / this.currentDeck.cards.length) * 100}%"></div>
                        </div>
                        <p>${this.currentCardIndex + 1} / ${this.currentDeck.cards.length}</p>
                    </div>

                    <div class="flashcard" id="flashcard">
                        <div class="card-inner" id="cardInner">
                            <div class="card-front">
                                <p class="card-question">${this.currentDeck.cards[this.currentCardIndex]?.question || ''}</p>
                                <p class="flip-hint">Click to reveal answer</p>
                            </div>
                            <div class="card-back" style="display: none;">
                                <p class="card-answer">${this.currentDeck.cards[this.currentCardIndex]?.answer || ''}</p>
                            </div>
                        </div>
                    </div>

                    <div class="study-controls">
                        <button id="prevCardBtn" class="btn-nav">← Previous</button>
                        <button id="flipCardBtn" class="btn-flip">🔄 Flip Card</button>
                        <button id="nextCardBtn" class="btn-nav">Next →</button>
                    </div>

                    <div class="study-feedback">
                        <button id="markIncorrectBtn" class="btn-incorrect">❌ Incorrect</button>
                        <button id="markCorrectBtn" class="btn-correct">✅ Correct</button>
                    </div>

                    <button id="exitStudyBtn" class="btn-danger">Exit Study Mode</button>
                </div>
            `}
        `;

        // Reattach listeners
        document.getElementById('addCardBtn')?.addEventListener('click', () => this.openCardModal());
        document.getElementById('startStudyBtn')?.addEventListener('click', () => this.startStudy());
        document.getElementById('nextCardBtn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('prevCardBtn')?.addEventListener('click', () => this.previousCard());
        document.getElementById('flipCardBtn')?.addEventListener('click', () => this.flipCard());
        document.getElementById('markCorrectBtn')?.addEventListener('click', () => this.markCorrect());
        document.getElementById('markIncorrectBtn')?.addEventListener('click', () => this.markIncorrect());
        document.getElementById('exitStudyBtn')?.addEventListener('click', () => this.exitStudy());
    }

    openCardModal() {
        document.getElementById('cardModal').style.display = 'block';
    }

    closeCardModal() {
        document.getElementById('cardModal').style.display = 'none';
        document.getElementById('cardForm').reset();
    }

    addCard(e) {
        e.preventDefault();

        const card = {
            question: document.getElementById('cardQuestion').value,
            answer: document.getElementById('cardAnswer').value,
            difficulty: document.getElementById('cardDifficulty').value,
            nextReview: new Date().toISOString(),
            reviewCount: 0
        };

        this.currentDeck.cards.push(card);
        this.currentDeck.stats.totalCards = this.currentDeck.cards.length;
        this.saveDecks();
        this.closeCardModal();
        this.renderDeckContent();
    }

    deleteCard(index) {
        this.currentDeck.cards.splice(index, 1);
        this.currentDeck.stats.totalCards = this.currentDeck.cards.length;
        this.saveDecks();
        this.renderDeckContent();
    }

    startStudy() {
        this.studyMode = true;
        this.currentCardIndex = 0;
        this.renderDeckContent();
        this.flipCard(); // Start with question visible
    }

    exitStudy() {
        this.studyMode = false;
        this.currentDeck.stats.lastReviewDate = new Date().toISOString();
        this.saveDecks();
        this.renderDeckContent();
    }

    nextCard() {
        if (this.currentCardIndex < this.currentDeck.cards.length - 1) {
            this.currentCardIndex++;
            this.resetCardFlip();
            this.renderDeckContent();
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.resetCardFlip();
            this.renderDeckContent();
        }
    }

    flipCard() {
        const cardFront = document.querySelector('.card-front');
        const cardBack = document.querySelector('.card-back');
        
        if (cardFront && cardBack) {
            cardFront.style.display = cardFront.style.display === 'none' ? 'block' : 'none';
            cardBack.style.display = cardBack.style.display === 'none' ? 'block' : 'none';
        }
    }

    resetCardFlip() {
        const cardFront = document.querySelector('.card-front');
        const cardBack = document.querySelector('.card-back');
        if (cardFront && cardBack) {
            cardFront.style.display = 'block';
            cardBack.style.display = 'none';
        }
    }

    markCorrect() {
        this.currentDeck.stats.correctAnswers++;
        this.currentDeck.cards[this.currentCardIndex].reviewCount++;
        this.saveDecks();
        this.nextCard();
    }

    markIncorrect() {
        this.currentDeck.stats.incorrectAnswers++;
        this.currentDeck.cards[this.currentCardIndex].reviewCount++;
        this.saveDecks();
        this.nextCard();
    }

    renderDecks() {
        const container = document.getElementById('decksList');
        if (!container) return;

        container.innerHTML = `
            <div class="decks-header">
                <h2>📚 My Flashcard Decks</h2>
                <button id="createDeckBtn" class="btn-primary">➕ Create Deck</button>
            </div>
            <div class="decks-grid">
                ${this.decks.map(deck => `
                    <div class="deck-card" onclick="flashcardSystem.selectDeck(${deck.id})">
                        <h3>${deck.name}</h3>
                        <p>${deck.description}</p>
                        <div class="deck-card-stats">
                            <span>📋 ${deck.cards.length} cards</span>
                            <span>📈 ${((deck.stats.correctAnswers / (deck.stats.correctAnswers + deck.stats.incorrectAnswers || 1)) * 100 || 0).toFixed(0)}% correct</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('createDeckBtn')?.addEventListener('click', () => this.openDeckModal());
    }

    saveDecks() {
        localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
    }

    loadDecks() {
        const saved = localStorage.getItem('flashcardDecks');
        this.decks = saved ? JSON.parse(saved) : [];
    }
}

// Global reference
let flashcardSystem;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('decksList')) {
        flashcardSystem = new FlashcardSystem();
    }
});
