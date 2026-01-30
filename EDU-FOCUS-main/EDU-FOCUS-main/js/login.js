// Login Page Interactive JavaScript
class LoginSystem {
    constructor() {
        this.currentMode = 'login';
        this.isLoading = false;
        
        this.init();
        this.initializeParticles();
        this.initializeAnimations();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.createMouseFollower();
        this.startBackgroundAnimations();
    }

    setupEventListeners() {
        // Mode toggle buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Form submissions
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        // Input interactions
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', this.onInputFocus);
            input.addEventListener('blur', this.onInputBlur);
            input.addEventListener('input', this.onInputChange);
        });

        // Password strength for signup
        const signupPassword = document.getElementById('signup-password');
        if (signupPassword) {
            signupPassword.addEventListener('input', this.checkPasswordStrength);
        }

        // Confirm password validation
        const confirmPassword = document.getElementById('confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', this.validatePasswordMatch);
        }

        // Social login buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', this.handleSocialLogin);
        });

        // Feature items hover effects
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', this.onFeatureHover);
            item.addEventListener('mouseleave', this.onFeatureLeave);
        });

        // Login card hover effect
        const loginCard = document.getElementById('login-card');
        loginCard.addEventListener('mousemove', this.onCardMouseMove);
        loginCard.addEventListener('mouseleave', this.onCardMouseLeave);

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts);
    }

    switchMode(mode) {
        if (this.isLoading) return;

        this.currentMode = mode;
        const toggle = document.querySelector('.toggle-mode');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const modeButtons = document.querySelectorAll('.mode-btn');

        // Update button states
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update toggle indicator
        toggle.classList.toggle('signup', mode === 'signup');

        // Animate form transition
        const currentForm = mode === 'login' ? signupForm : loginForm;
        const nextForm = mode === 'login' ? loginForm : signupForm;

        // Hide current form with animation
        currentForm.style.transform = 'translateX(-100%)';
        currentForm.style.opacity = '0';
        
        setTimeout(() => {
            currentForm.classList.add('hidden');
            nextForm.classList.remove('hidden');
            
            // Show next form with animation
            nextForm.style.transform = 'translateX(100%)';
            nextForm.style.opacity = '0';
            
            setTimeout(() => {
                nextForm.style.transform = 'translateX(0)';
                nextForm.style.opacity = '1';
                nextForm.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, 50);
        }, 300);

        // Add mode switch animation to card
        const loginCard = document.getElementById('login-card');
        loginCard.style.transform = 'scale(0.95)';
        setTimeout(() => {
            loginCard.style.transform = 'scale(1)';
        }, 200);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const form = e.target;
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        const remember = form.querySelector('#remember').checked;

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.setLoadingState(true, 'login');

        try {
            // Simulate API call
            await this.simulateLogin(email, password, remember);
            this.showSuccessAnimation();
            
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 2000);
            
        } catch (error) {
            this.showError(error.message);
            this.setLoadingState(false, 'login');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const form = e.target;
        const name = form.querySelector('#signup-name').value;
        const email = form.querySelector('#signup-email').value;
        const password = form.querySelector('#signup-password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;

        if (!this.validateSignupForm(name, email, password, confirmPassword)) {
            return;
        }

        this.setLoadingState(true, 'signup');

        try {
            // Simulate API call
            await this.simulateSignup(name, email, password);
            this.showSuccessAnimation();
            
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 2000);
            
        } catch (error) {
            this.showError(error.message);
            this.setLoadingState(false, 'signup');
        }
    }

    validateLoginForm(email, password) {
        if (!email || !this.isValidEmail(email)) {
            this.showInputError('login-email', 'Please enter a valid email address');
            return false;
        }

        if (!password || password.length < 6) {
            this.showInputError('login-password', 'Password must be at least 6 characters');
            return false;
        }

        return true;
    }

    validateSignupForm(name, email, password, confirmPassword) {
        if (!name || name.length < 2) {
            this.showInputError('signup-name', 'Name must be at least 2 characters');
            return false;
        }

        if (!email || !this.isValidEmail(email)) {
            this.showInputError('signup-email', 'Please enter a valid email address');
            return false;
        }

        if (!password || password.length < 8) {
            this.showInputError('signup-password', 'Password must be at least 8 characters');
            return false;
        }

        if (password !== confirmPassword) {
            this.showInputError('confirm-password', 'Passwords do not match');
            return false;
        }

        const passwordStrength = this.getPasswordStrength(password);
        if (passwordStrength < 3) {
            this.showInputError('signup-password', 'Please choose a stronger password');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    checkPasswordStrength(e) {
        const password = e.target.value;
        const strength = window.loginSystem.getPasswordStrength(password);
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        const strengthPercentage = (strength / 5) * 100;
        strengthFill.style.width = `${strengthPercentage}%`;

        const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#ff6b6b', '#ff8e53', '#ffd93d', '#6bcf7f', '#4ecdc4'];
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password Strength';
            return;
        }

        strengthFill.style.background = strengthColors[strength - 1] || strengthColors[0];
        strengthText.textContent = strengthLabels[strength - 1] || strengthLabels[0];
    }

    validatePasswordMatch(e) {
        const confirmPassword = e.target.value;
        const password = document.getElementById('signup-password').value;
        
        if (confirmPassword && password !== confirmPassword) {
            window.loginSystem.showInputError('confirm-password', 'Passwords do not match');
        } else {
            window.loginSystem.clearInputError('confirm-password');
        }
    }

    showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        const wrapper = input.closest('.input-wrapper');
        
        // Remove existing error
        this.clearInputError(inputId);
        
        // Add error styling
        input.style.borderColor = '#ff6b6b';
        wrapper.style.animation = 'shake 0.6s ease-in-out';
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            animation: fadeInUp 0.3s ease;
        `;
        
        wrapper.appendChild(errorElement);
        
        // Clear animation
        setTimeout(() => {
            wrapper.style.animation = '';
        }, 600);
    }

    clearInputError(inputId) {
        const input = document.getElementById(inputId);
        const wrapper = input.closest('.input-wrapper');
        const errorElement = wrapper.querySelector('.input-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.style.borderColor = '';
    }

    setLoadingState(loading, formType) {
        this.isLoading = loading;
        const button = formType === 'login' ? 
            document.querySelector('.login-btn') : 
            document.querySelector('.signup-btn');
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    async simulateLogin(email, password, remember) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, accept any credentials
        // In production, this would validate against a real user database
        const userData = {
            username: email.split('@')[0] || 'student',
            fullName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) || 'Student',
            email: email,
            avatar: null
        };
        
        // Store session using the same format as session-check.js expects
        const sessionData = {
            username: userData.username,
            fullName: userData.fullName,
            email: userData.email,
            avatar: userData.avatar,
            timestamp: new Date().getTime(),
            lastActivity: new Date().getTime()
        };
        
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        return userData;
    }

    async simulateSignup(name, email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // For demo purposes, accept any signup
        // In production, this would create a real user account
        const userData = {
            username: email.split('@')[0] || 'student',
            fullName: name,
            email: email,
            avatar: null
        };
        
        // Store session using the same format as session-check.js expects
        const sessionData = {
            username: userData.username,
            fullName: userData.fullName,
            email: userData.email,
            avatar: userData.avatar,
            timestamp: new Date().getTime(),
            lastActivity: new Date().getTime()
        };
        
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        
        return userData;
    }

    showSuccessAnimation() {
        const overlay = document.getElementById('success-overlay');
        overlay.classList.remove('hidden');
        
        // Create celebration particles
        this.createCelebrationParticles();
    }

    createCelebrationParticles() {
        const colors = ['#4ecdc4', '#ff6b6b', '#ffd93d', '#6bcf7f', '#ff8e53'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    left: 50%;
                    top: 50%;
                    animation: celebrate 2s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    showError(message) {
        // Create error notification
        const errorElement = document.createElement('div');
        errorElement.className = 'error-notification';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ff5722);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
        `;
        
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => errorElement.remove(), 500);
        }, 4000);
    }

    onInputFocus(e) {
        const wrapper = e.target.closest('.input-wrapper');
        wrapper.style.transform = 'translateY(-2px)';
    }

    onInputBlur(e) {
        const wrapper = e.target.closest('.input-wrapper');
        wrapper.style.transform = 'translateY(0)';
    }

    onInputChange(e) {
        // Clear any existing errors when user starts typing
        window.loginSystem.clearInputError(e.target.id);
    }

    handleSocialLogin(e) {
        const provider = e.currentTarget.querySelector('span').textContent;
        
        // Add loading effect to button
        const btn = e.currentTarget;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.pointerEvents = 'auto';
            window.loginSystem.showError(`${provider} login is not configured yet. Please use email login.`);
        }, 2000);
    }

    onFeatureHover(e) {
        const item = e.currentTarget;
        const icon = item.querySelector('.feature-icon');
        
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        item.style.background = 'rgba(255, 255, 255, 0.2)';
    }

    onFeatureLeave(e) {
        const item = e.currentTarget;
        const icon = item.querySelector('.feature-icon');
        
        icon.style.transform = 'scale(1) rotate(0deg)';
        item.style.background = 'rgba(255, 255, 255, 0.1)';
    }

    onCardMouseMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    onCardMouseLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    const activeForm = document.querySelector('.auth-form:not(.hidden)');
                    if (activeForm) {
                        activeForm.querySelector('.submit-btn').click();
                    }
                    break;
                case 'l':
                    e.preventDefault();
                    window.loginSystem.switchMode('login');
                    break;
                case 's':
                    e.preventDefault();
                    window.loginSystem.switchMode('signup');
                    break;
            }
        }
    }

    createMouseFollower() {
        const follower = document.createElement('div');
        follower.className = 'mouse-follower';
        follower.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(78, 205, 196, 0.6), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.2s ease;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(follower);
        
        document.addEventListener('mousemove', (e) => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        });
        
        document.addEventListener('mousedown', () => {
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        document.addEventListener('mouseup', () => {
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    initializeParticles() {
        const particleContainer = document.getElementById('particles');
        
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            const startX = Math.random() * window.innerWidth;
            const drift = (Math.random() - 0.5) * 200;
            
            particle.style.cssText = `
                left: ${startX}px;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${Math.random() * 10 + 10}s;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            particle.style.setProperty('--drift', `${drift}px`);
            particleContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 20000);
        };
        
        // Create initial particles
        for (let i = 0; i < 20; i++) {
            setTimeout(createParticle, i * 500);
        }
        
        // Continue creating particles
        setInterval(createParticle, 1000);
    }

    initializeAnimations() {
        // Stagger feature item animations
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.style.animationDelay = `${0.8 + index * 0.2}s`;
        });
        
        // Logo letter animations
        const letters = document.querySelectorAll('.letter');
        letters.forEach((letter, index) => {
            letter.addEventListener('mouseenter', () => {
                letter.style.transform = 'translateY(-10px) rotateX(15deg)';
                letter.style.textShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
            });
            
            letter.addEventListener('mouseleave', () => {
                letter.style.transform = 'translateY(0) rotateX(0)';
                letter.style.textShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
        });
    }

    startBackgroundAnimations() {
        // Animate gradient orbs
        const orbs = document.querySelectorAll('.orb');
        orbs.forEach(orb => {
            setInterval(() => {
                const x = (Math.random() - 0.5) * 100;
                const y = (Math.random() - 0.5) * 100;
                orb.style.transform += ` translate(${x}px, ${y}px)`;
            }, 10000);
        });
    }

    setupFormValidation() {
        // Real-time validation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes celebrate {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) translate(${Math.random() * 400 - 200}px, ${Math.random() * 400 - 200}px) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.password-toggle');
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Enter demo function
function enterDemo() {
    // Create demo user session
    const demoSession = {
        user: { name: 'Demo User', email: 'demo@edufocus.com' },
        timestamp: Date.now(),
        isDemo: true
    };
    
    localStorage.setItem('edufocus_session', JSON.stringify(demoSession));
    
    // Animate button
    const btn = event.target;
    btn.style.transform = 'scale(0.95)';
    btn.innerHTML = '🚀 Loading Demo...';
    
    setTimeout(() => {
        window.location.href = 'welcome.html';
    }, 1000);
}

// Initialize login system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});