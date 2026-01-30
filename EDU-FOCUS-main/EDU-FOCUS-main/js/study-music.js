class StudyMusic {
    constructor() {
        this.tracks = [
            { name: 'Lo-Fi Hip Hop', url: 'https://www.youtube.com/embed/jfKfPfyJRdk', category: 'lofi' },
            { name: 'Chill Jazz', url: 'https://www.youtube.com/embed/Xr8E_D9OZHA', category: 'jazz' },
            { name: 'Classical Piano', url: 'https://www.youtube.com/embed/hEEAW5E8rqY', category: 'classical' },
            { name: 'Ambient Sounds', url: 'https://www.youtube.com/embed/nUIS0euTJlQ', category: 'ambient' },
            { name: 'Nature Sounds - Rain', url: 'https://www.youtube.com/embed/9tPrUa3ZnT4', category: 'nature' },
            { name: 'Deep Focus', url: 'https://www.youtube.com/embed/4xDzrJKXOOY', category: 'focus' }
        ];
        
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 70;
        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupListeners();
        this.renderMusicPlayer();
    }

    setupListeners() {
        document.getElementById('volumeControl')?.addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('playPauseBtn')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('muteBtn')?.addEventListener('click', () => this.toggleMute());
    }

    renderMusicPlayer() {
        const container = document.getElementById('musicPlayer');
        if (!container) return;

        container.innerHTML = `
            <div class="music-header">
                <h2>🎵 Study Music & Ambience</h2>
                <div class="volume-control">
                    <span>🔊</span>
                    <input type="range" id="volumeControl" min="0" max="100" value="${this.volume}" class="volume-slider">
                    <span id="volumePercent">${this.volume}%</span>
                    <button id="muteBtn" class="btn-icon">🔇</button>
                </div>
            </div>

            <div class="music-categories">
                <button class="category-btn active" onclick="studyMusic.filterCategory('all')">All</button>
                <button class="category-btn" onclick="studyMusic.filterCategory('lofi')">🎧 Lo-Fi</button>
                <button class="category-btn" onclick="studyMusic.filterCategory('jazz')">🎷 Jazz</button>
                <button class="category-btn" onclick="studyMusic.filterCategory('classical')">🎹 Classical</button>
                <button class="category-btn" onclick="studyMusic.filterCategory('nature')">🌿 Nature</button>
                <button class="category-btn" onclick="studyMusic.filterCategory('focus')">🧠 Focus</button>
            </div>

            <div class="music-tracks">
                ${this.tracks.map((track, idx) => `
                    <div class="music-track">
                        <div class="track-info">
                            <h3>${track.name}</h3>
                            <p class="track-category">${track.category.toUpperCase()}</p>
                        </div>
                        <button class="btn-play" onclick="studyMusic.playTrack(${idx})">▶ Play</button>
                    </div>
                `).join('')}
            </div>

            <div class="now-playing" id="nowPlaying" style="display: none;">
                <h3>Now Playing</h3>
                <div id="playerInfo"></div>
            </div>

            <div class="music-timer">
                <h3>⏱️ Study Timer</h3>
                <div class="timer-presets">
                    <button class="btn-preset" onclick="studyMusic.setTimer(15)">15 min</button>
                    <button class="btn-preset" onclick="studyMusic.setTimer(30)">30 min</button>
                    <button class="btn-preset" onclick="studyMusic.setTimer(45)">45 min</button>
                    <button class="btn-preset" onclick="studyMusic.setTimer(60)">1 hour</button>
                    <button class="btn-preset" onclick="studyMusic.setTimer(90)">1.5 hours</button>
                </div>
                <div class="timer-display" id="timerDisplay" style="display: none;">
                    <p id="timerText">25:00</p>
                    <button id="stopTimerBtn" class="btn-danger" onclick="studyMusic.stopTimer()">Stop</button>
                </div>
            </div>

            <div class="playback-controls">
                <button id="playPauseBtn" class="btn-large">▶ Play</button>
            </div>

            <div class="favorites-section">
                <h3>⭐ Favorite Tracks</h3>
                <div id="favoritesList" class="favorites-list"></div>
            </div>
        `;

        document.getElementById('volumeControl')?.addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('playPauseBtn')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('muteBtn')?.addEventListener('click', () => this.toggleMute());

        this.renderFavorites();
    }

    playTrack(index) {
        this.currentTrack = this.tracks[index];
        this.isPlaying = true;
        this.updateNowPlaying();
        this.addToFavorites(this.currentTrack.name);
    }

    updateNowPlaying() {
        if (!this.currentTrack) return;

        const nowPlayingDiv = document.getElementById('nowPlaying');
        const playerInfo = document.getElementById('playerInfo');

        if (nowPlayingDiv && playerInfo) {
            nowPlayingDiv.style.display = 'block';
            playerInfo.innerHTML = `
                <div class="player-embed">
                    <iframe width="100%" height="315" src="${this.currentTrack.url}" 
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
                <p class="now-playing-title">${this.currentTrack.name}</p>
            `;
        }

        document.getElementById('playPauseBtn').textContent = '⏸ Playing...';
    }

    togglePlayPause() {
        if (!this.currentTrack) {
            alert('Select a track first!');
            return;
        }

        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = this.isPlaying ? '⏸ Playing...' : '▶ Play';
    }

    toggleMute() {
        const muteBtn = document.getElementById('muteBtn');
        const volumeControl = document.getElementById('volumeControl');

        if (this.volume > 0) {
            this.volume = 0;
            muteBtn.textContent = '🔊';
        } else {
            this.volume = 70;
            muteBtn.textContent = '🔇';
        }

        if (volumeControl) volumeControl.value = this.volume;
        this.setVolume(this.volume);
    }

    setVolume(value) {
        this.volume = value;
        document.getElementById('volumePercent').textContent = value + '%';
        this.savePreferences();
    }

    filterCategory(category) {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const trackElements = document.querySelectorAll('.music-track');
        trackElements.forEach(el => {
            const trackCategory = el.querySelector('.track-category').textContent.toLowerCase();
            el.style.display = category === 'all' || trackCategory.includes(category) ? 'flex' : 'none';
        });
    }

    setTimer(minutes) {
        const timerDisplay = document.getElementById('timerDisplay');
        const timerText = document.getElementById('timerText');

        if (timerDisplay && timerText) {
            timerDisplay.style.display = 'block';
            timerText.textContent = `${minutes}:00`;

            let timeLeft = minutes * 60;

            const interval = setInterval(() => {
                timeLeft--;
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                timerText.textContent = `${mins}:${String(secs).padStart(2, '0')}`;

                if (timeLeft === 0) {
                    clearInterval(interval);
                    this.playAlarmSound();
                    alert(`⏰ Your ${minutes} minute study session is complete!`);
                }
            }, 1000);

            this.currentTimer = interval;
        }
    }

    stopTimer() {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }
        document.getElementById('timerDisplay').style.display = 'none';
    }

    playAlarmSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = 800 + (i * 200);
                oscillator.type = 'sine';
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 300);
        }
    }

    addToFavorites(trackName) {
        let favorites = JSON.parse(localStorage.getItem('favoriteMusic') || '[]');
        
        if (!favorites.includes(trackName)) {
            favorites.push(trackName);
            localStorage.setItem('favoriteMusic', JSON.stringify(favorites));
            this.renderFavorites();
        }
    }

    removeFromFavorites(trackName) {
        let favorites = JSON.parse(localStorage.getItem('favoriteMusic') || '[]');
        favorites = favorites.filter(f => f !== trackName);
        localStorage.setItem('favoriteMusic', JSON.stringify(favorites));
        this.renderFavorites();
    }

    renderFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favoriteMusic') || '[]');
        const container = document.getElementById('favoritesList');

        if (container) {
            container.innerHTML = favorites.length > 0 
                ? favorites.map(fav => `
                    <div class="favorite-item">
                        <span>${fav}</span>
                        <button onclick="studyMusic.removeFromFavorites('${fav}')" class="btn-delete">✕</button>
                    </div>
                `).join('')
                : '<p>No favorites yet. Play a track to add it!</p>';
        }
    }

    savePreferences() {
        const prefs = {
            volume: this.volume,
            lastTrack: this.currentTrack ? this.currentTrack.name : null
        };
        localStorage.setItem('musicPreferences', JSON.stringify(prefs));
    }

    loadPreferences() {
        const saved = localStorage.getItem('musicPreferences');
        if (saved) {
            const prefs = JSON.parse(saved);
            this.volume = prefs.volume || 70;
        }
    }
}

// Global reference
let studyMusic;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('musicPlayer')) {
        studyMusic = new StudyMusic();
    }
});
