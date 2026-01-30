// Text-to-Speech - Convert notes/summaries to audio
class TextToSpeech {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.voices = [];
        this.selectedVoice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        
        this.init();
    }

    init() {
        this.loadVoices();
        this.setupEventListeners();
        
        // Load saved preferences
        this.loadPreferences();
        
        // Voices load asynchronously, so we need to listen for that
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        this.populateVoiceList();
        
        // Set default voice if not already set
        if (!this.selectedVoice && this.voices.length > 0) {
            this.selectedVoice = this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
        }
    }

    populateVoiceList() {
        const voiceSelect = document.getElementById('tts-voice-select');
        if (!voiceSelect || this.voices.length === 0) return;

        voiceSelect.innerHTML = '';
        
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' — DEFAULT';
            }
            voiceSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        // Control buttons
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        
        // Settings
        const voiceSelect = document.getElementById('tts-voice-select');
        const rateSlider = document.getElementById('tts-rate');
        const pitchSlider = document.getElementById('tts-pitch');
        const volumeSlider = document.getElementById('tts-volume');
        
        // Text input
        const textInput = document.getElementById('tts-text-input');
        const speakBtn = document.getElementById('tts-speak-btn');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.resume());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.selectedVoice = this.voices[e.target.value];
                this.savePreferences();
            });
        }

        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                this.rate = parseFloat(e.target.value);
                document.getElementById('rate-value').textContent = this.rate.toFixed(1);
                this.savePreferences();
            });
        }

        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                this.pitch = parseFloat(e.target.value);
                document.getElementById('pitch-value').textContent = this.pitch.toFixed(1);
                this.savePreferences();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = parseFloat(e.target.value);
                document.getElementById('volume-value').textContent = Math.round(this.volume * 100) + '%';
                this.savePreferences();
            });
        }

        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                const text = textInput.value.trim();
                if (text) {
                    this.speak(text);
                }
            });
        }

        // Quick action buttons for summaries
        document.querySelectorAll('.speak-summary-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                if (text) {
                    this.speak(text);
                }
            });
        });
    }

    speak(text) {
        if (!text) return;

        // Stop any ongoing speech
        this.stop();

        // Create new utterance
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Set properties
        if (this.selectedVoice) {
            this.utterance.voice = this.selectedVoice;
        }
        this.utterance.rate = this.rate;
        this.utterance.pitch = this.pitch;
        this.utterance.volume = this.volume;

        // Event listeners
        this.utterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateUI();
            this.highlightCurrentText();
        };

        this.utterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateUI();
            this.clearHighlight();
        };

        this.utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.updateUI();
        };

        this.utterance.onpause = () => {
            this.isPaused = true;
            this.updateUI();
        };

        this.utterance.onresume = () => {
            this.isPaused = false;
            this.updateUI();
        };

        // Speak
        this.synthesis.speak(this.utterance);
    }

    pause() {
        if (this.isSpeaking && !this.isPaused) {
            this.synthesis.pause();
        }
    }

    resume() {
        if (this.isPaused) {
            this.synthesis.resume();
        }
    }

    stop() {
        this.synthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.updateUI();
        this.clearHighlight();
    }

    updateUI() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        const statusText = document.getElementById('tts-status');

        if (!playBtn || !pauseBtn || !stopBtn) return;

        if (this.isSpeaking && !this.isPaused) {
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            if (statusText) statusText.textContent = 'Speaking...';
        } else if (this.isPaused) {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = false;
            if (statusText) statusText.textContent = 'Paused';
        } else {
            playBtn.disabled = true;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            if (statusText) statusText.textContent = 'Ready';
        }
    }

    highlightCurrentText() {
        const textInput = document.getElementById('tts-text-input');
        if (textInput) {
            textInput.style.background = 'rgba(108, 92, 231, 0.1)';
        }
    }

    clearHighlight() {
        const textInput = document.getElementById('tts-text-input');
        if (textInput) {
            textInput.style.background = '';
        }
    }

    // Helper method to speak any text from anywhere in the app
    speakText(text, options = {}) {
        const settings = { ...options };
        
        if (settings.rate) this.rate = settings.rate;
        if (settings.pitch) this.pitch = settings.pitch;
        if (settings.volume) this.volume = settings.volume;

        this.speak(text);
    }

    savePreferences() {
        const preferences = {
            voiceIndex: this.voices.indexOf(this.selectedVoice),
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume
        };
        localStorage.setItem('ttsPreferences', JSON.stringify(preferences));
    }

    loadPreferences() {
        const saved = localStorage.getItem('ttsPreferences');
        if (!saved) return;

        try {
            const preferences = JSON.parse(saved);
            
            if (preferences.voiceIndex >= 0 && this.voices[preferences.voiceIndex]) {
                this.selectedVoice = this.voices[preferences.voiceIndex];
                const voiceSelect = document.getElementById('tts-voice-select');
                if (voiceSelect) voiceSelect.value = preferences.voiceIndex;
            }

            if (preferences.rate) {
                this.rate = preferences.rate;
                const rateSlider = document.getElementById('tts-rate');
                const rateValue = document.getElementById('rate-value');
                if (rateSlider) rateSlider.value = this.rate;
                if (rateValue) rateValue.textContent = this.rate.toFixed(1);
            }

            if (preferences.pitch) {
                this.pitch = preferences.pitch;
                const pitchSlider = document.getElementById('tts-pitch');
                const pitchValue = document.getElementById('pitch-value');
                if (pitchSlider) pitchSlider.value = this.pitch;
                if (pitchValue) pitchValue.textContent = this.pitch.toFixed(1);
            }

            if (preferences.volume) {
                this.volume = preferences.volume;
                const volumeSlider = document.getElementById('tts-volume');
                const volumeValue = document.getElementById('volume-value');
                if (volumeSlider) volumeSlider.value = this.volume;
                if (volumeValue) volumeValue.textContent = Math.round(this.volume * 100) + '%';
            }
        } catch (error) {
            console.error('Error loading TTS preferences:', error);
        }
    }

    // Check if TTS is supported
    isSupported() {
        return 'speechSynthesis' in window;
    }
}

// Initialize and make globally available
let textToSpeech;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if ('speechSynthesis' in window) {
            textToSpeech = new TextToSpeech();
            window.textToSpeech = textToSpeech;
        } else {
            console.warn('Text-to-Speech not supported in this browser');
        }
    });
} else {
    if ('speechSynthesis' in window) {
        textToSpeech = new TextToSpeech();
        window.textToSpeech = textToSpeech;
    }
}
