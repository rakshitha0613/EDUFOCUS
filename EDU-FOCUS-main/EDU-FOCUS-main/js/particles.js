// Particle System for Login Page
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 50;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Add canvas to particles container
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            particlesContainer.appendChild(this.canvas);
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: this.getRandomColor(),
            life: 1,
            decay: Math.random() * 0.02 + 0.005,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
        };
    }
    
    getRandomColor() {
        const colors = [
            'rgba(78, 205, 196, 0.8)',
            'rgba(255, 107, 107, 0.8)',
            'rgba(255, 195, 113, 0.8)',
            'rgba(196, 113, 255, 0.8)',
            'rgba(113, 255, 193, 0.8)',
            'rgba(255, 255, 255, 0.8)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticle(particle) {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update pulse
        particle.pulse += particle.pulseSpeed;
        
        // Boundary wrapping
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
        
        // Update life
        particle.life -= particle.decay;
        
        // Reset particle if life is depleted
        if (particle.life <= 0) {
            Object.assign(particle, this.createParticle());
        }
    }
    
    drawParticle(particle) {
        const pulseFactor = Math.sin(particle.pulse) * 0.3 + 0.7;
        const size = particle.size * pulseFactor;
        const opacity = particle.opacity * particle.life;
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        
        // Create gradient for glow effect
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw inner bright core
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                const dx = particle1.x - particle2.x;
                const dy = particle1.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const maxDistance = 150;
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = opacity;
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle1.x, particle1.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }
        
        // Draw connections
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Attract particles to mouse
            this.particles.forEach(particle => {
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100 * 0.01;
                    particle.vx += dx / distance * force;
                    particle.vy += dy / distance * force;
                }
                
                // Limit velocity
                const maxVel = 2;
                const vel = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (vel > maxVel) {
                    particle.vx = (particle.vx / vel) * maxVel;
                    particle.vy = (particle.vy / vel) * maxVel;
                }
            });
        });
        
        // Click interaction - create burst
        document.addEventListener('click', (e) => {
            this.createBurst(e.clientX, e.clientY);
        });
    }
    
    createBurst(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const velocity = Math.random() * 3 + 2;
            
            const burstParticle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 4 + 2,
                opacity: 1,
                color: this.getRandomColor(),
                life: 1,
                decay: 0.02,
                pulse: 0,
                pulseSpeed: 0.1
            };
            
            this.particles.push(burstParticle);
        }
        
        // Remove excess particles
        if (this.particles.length > this.maxParticles + 20) {
            this.particles.splice(this.maxParticles, this.particles.length - this.maxParticles);
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Floating Elements Animation
class FloatingElements {
    constructor() {
        this.elements = [];
        this.init();
    }
    
    init() {
        this.createFloatingElements();
        this.animate();
    }
    
    createFloatingElements() {
        const container = document.body;
        const elementCount = 15;
        
        for (let i = 0; i < elementCount; i++) {
            const element = this.createElement();
            container.appendChild(element);
            this.elements.push(element);
        }
    }
    
    createElement() {
        const element = document.createElement('div');
        const shapes = ['circle', 'square', 'triangle', 'hexagon'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const size = Math.random() * 60 + 20;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        element.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 0;
            opacity: 0.1;
            transition: all 0.3s ease;
        `;
        
        switch (shape) {
            case 'circle':
                element.style.borderRadius = '50%';
                element.style.background = 'linear-gradient(135deg, #4ecdc4, #44a08d)';
                break;
            case 'square':
                element.style.background = 'linear-gradient(135deg, #ff6b6b, #ffd93d)';
                break;
            case 'triangle':
                element.style.width = '0';
                element.style.height = '0';
                element.style.borderLeft = `${size/2}px solid transparent`;
                element.style.borderRight = `${size/2}px solid transparent`;
                element.style.borderBottom = `${size}px solid rgba(196, 113, 255, 0.3)`;
                break;
            case 'hexagon':
                element.style.background = 'linear-gradient(135deg, #45b7d1, #96c93d)';
                element.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                break;
        }
        
        return element;
    }
    
    animate() {
        this.elements.forEach(element => {
            const duration = Math.random() * 20000 + 10000;
            const delay = Math.random() * 5000;
            
            element.animate([
                {
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 0.05
                },
                {
                    transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(180deg)`,
                    opacity: 0.2
                },
                {
                    transform: `translate(${Math.random() * 400 - 200}px, ${Math.random() * 400 - 200}px) rotate(360deg)`,
                    opacity: 0.05
                }
            ], {
                duration: duration,
                delay: delay,
                iterations: Infinity,
                easing: 'ease-in-out'
            });
        });
    }
    
    destroy() {
        this.elements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.elements = [];
    }
}

// Ripple Effect System
class RippleEffect {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupRippleElements();
    }
    
    setupRippleElements() {
        const rippleElements = document.querySelectorAll('.submit-btn, .social-btn, .demo-btn');
        
        rippleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.createRipple(e, element);
            });
        });
    }
    
    createRipple(e, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s linear;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Text Animation Effects
class TextAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTypingEffect();
        this.setupGlowEffect();
    }
    
    setupTypingEffect() {
        const tagline = document.querySelector('.logo-tagline');
        if (tagline) {
            const text = tagline.textContent;
            tagline.textContent = '';
            tagline.style.borderRight = '2px solid rgba(255, 255, 255, 0.7)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    tagline.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    setTimeout(() => {
                        tagline.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            setTimeout(typeWriter, 2000);
        }
    }
    
    setupGlowEffect() {
        const glowElements = document.querySelectorAll('.logo-text, .welcome-text h2');
        
        glowElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(78, 205, 196, 0.5)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.textShadow = '';
            });
        });
    }
}

// Initialize all systems when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add required CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize systems
    window.particleSystem = new ParticleSystem();
    window.floatingElements = new FloatingElements();
    window.rippleEffect = new RippleEffect();
    window.textAnimations = new TextAnimations();
});