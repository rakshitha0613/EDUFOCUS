// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark theme
        this.init();
    }

    init() {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        // Update UI to reflect current theme
        this.updateToggleState();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
                this.animateThemeTransition();
                this.updateToggleState();
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update meta theme color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Trigger theme change event
        this.dispatchThemeChangeEvent(theme);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }
        
        const color = theme === 'dark' ? '#0c0c0c' : '#ffffff';
        metaThemeColor.setAttribute('content', color);
    }

    updateToggleState() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = this.currentTheme === 'dark';
        }
    }

    animateThemeTransition() {
        // Add transition class for smooth theme switching
        document.body.classList.add('theme-transitioning');
        
        // Create ripple effect from toggle button
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            this.createThemeRipple(toggle);
        }
        
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);
    }

    createThemeRipple(element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'theme-ripple';
        
        // Position ripple at toggle center
        ripple.style.left = rect.left + rect.width / 2 + 'px';
        ripple.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(ripple);
        
        // Animate ripple
        requestAnimationFrame(() => {
            ripple.classList.add('active');
        });
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChange', {
            detail: { theme: theme }
        });
        document.dispatchEvent(event);
    }

    getTheme() {
        return this.currentTheme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.updateToggleState();
        this.animateThemeTransition();
    }
}

// Theme transition styles
const themeStyles = `
.theme-transitioning * {
    transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease !important;
}

.theme-ripple {
    position: fixed;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent-color);
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    pointer-events: none;
    z-index: 10000;
    opacity: 0.6;
}

.theme-ripple.active {
    transform: translate(-50%, -50%) scale(100);
    opacity: 0;
}

/* Enhanced preference card styles */
.preferences-card {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: var(--transition);
}

[data-theme="light"] .preferences-card {
    background: var(--surface-color);
    border-color: rgba(0, 0, 0, 0.1);
}

.preferences-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.preferences-card h3 {
    color: var(--text-color);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
}

/* Responsive theme toggle for mobile */
@media (max-width: 768px) {
    .theme-switcher {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }
    
    .toggle-switch {
        width: 45px;
        height: 22px;
    }
    
    .slider:before {
        height: 14px;
        width: 14px;
    }
    
    input:checked + .slider:before {
        transform: translateX(23px);
    }
}
`;

// Add styles to document
const styleElement = document.createElement('style');
styleElement.textContent = themeStyles;
document.head.appendChild(styleElement);

// Initialize theme manager
let themeManager;
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});

// Listen for theme changes to update other components
document.addEventListener('themeChange', (e) => {
    console.log('Theme changed to:', e.detail.theme);
    
    // Update any theme-specific components here
    if (window.particleSystem) {
        window.particleSystem.updateTheme(e.detail.theme);
    }
});

// Export for global access
window.themeManager = themeManager;