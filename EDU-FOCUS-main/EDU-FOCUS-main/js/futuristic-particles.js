// Advanced Futuristic Particle System
class FuturisticParticles {
    constructor() {
        this.particles = [];
        this.geometricShapes = [];
        this.maxParticles = 60;
        this.maxShapes = 8;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.mouse = { x: 0, y: 0 };
        
        // Futuristic color palette
        this.colors = {
            primary: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'],
            accent: ['#20c997', '#51cf66', '#74b9ff', '#0984e3'],
            neon: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b']
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.createGeometricShapes();
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
        } else {
            document.body.appendChild(this.canvas);
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const colors = [...this.colors.primary, ...this.colors.accent];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 4 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            glow: Math.random() * 15 + 5,
            pulse: Math.random() * Math.PI * 2,
            trail: [],
            energy: Math.random() * 0.5 + 0.5
        };
    }
    
    createGeometricShapes() {
        this.geometricShapes = [];
        for (let i = 0; i < this.maxShapes; i++) {
            this.geometricShapes.push(this.createShape());
        }
    }
    
    createShape() {
        const shapes = ['triangle', 'square', 'hexagon', 'diamond', 'circle'];
        const colors = this.colors.neon;
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 30 + 15,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.4 + 0.1,
            pulsePhase: Math.random() * Math.PI * 2,
            connections: []
        };
    }
    
    drawParticle(particle) {
        // Draw particle trail
        if (particle.trail.length > 1) {
            this.ctx.strokeStyle = particle.color + '20';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            for (let i = 1; i < particle.trail.length; i++) {
                this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            this.ctx.stroke();
        }
        
        // Pulsing effect
        const pulse = Math.sin(particle.pulse) * 0.3 + 0.7;
        const glowSize = particle.glow * pulse;
        
        // Glow effect
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = glowSize;
        
        // Main particle
        this.ctx.globalAlpha = particle.energy;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner bright core
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = glowSize * 2;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, (particle.size * pulse) * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset effects
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    drawGeometricShape(shape) {
        this.ctx.save();
        this.ctx.translate(shape.x, shape.y);
        this.ctx.rotate(shape.rotation);
        
        const pulse = Math.sin(Date.now() * 0.001 + shape.pulsePhase) * 0.3 + 0.7;
        const size = shape.size * pulse;
        
        this.ctx.globalAlpha = shape.opacity;
        this.ctx.strokeStyle = shape.color;\n        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = shape.color;
        this.ctx.shadowBlur = 15;
        
        // Holographic effect
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, shape.color + '40');
        gradient.addColorStop(1, shape.color + '10');
        this.ctx.fillStyle = gradient;
        
        this.ctx.beginPath();
        
        switch (shape.shape) {
            case 'triangle':
                this.ctx.moveTo(0, -size * 0.8);
                this.ctx.lineTo(-size * 0.7, size * 0.4);
                this.ctx.lineTo(size * 0.7, size * 0.4);
                this.ctx.closePath();
                break;
            case 'square':
                this.ctx.rect(-size * 0.5, -size * 0.5, size, size);
                break;
            case 'hexagon':
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const x = Math.cos(angle) * size * 0.6;
                    const y = Math.sin(angle) * size * 0.6;
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                break;
            case 'diamond':
                this.ctx.moveTo(0, -size * 0.8);
                this.ctx.lineTo(size * 0.6, 0);
                this.ctx.lineTo(0, size * 0.8);
                this.ctx.lineTo(-size * 0.6, 0);
                this.ctx.closePath();
                break;
            default: // circle
                this.ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawConnections() {
        this.ctx.globalAlpha = 0.2;
        
        // Particle to particle connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = (150 - distance) / 150;
                    
                    // Animated connection line
                    const gradient = this.ctx.createLinearGradient(
                        this.particles[i].x, this.particles[i].y,
                        this.particles[j].x, this.particles[j].y
                    );
                    gradient.addColorStop(0, this.particles[i].color + '60');
                    gradient.addColorStop(0.5, '#ffffff40');
                    gradient.addColorStop(1, this.particles[j].color + '60');
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = opacity * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Mouse interaction with magnetic effect
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                const force = (120 - distance) / 120;
                const angle = Math.atan2(dy, dx);
                particle.vx += Math.cos(angle) * force * 0.02;
                particle.vy += Math.sin(angle) * force * 0.02;
                particle.energy = Math.min(1, particle.energy + 0.02);
            } else {
                particle.energy = Math.max(0.3, particle.energy - 0.005);
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update trail
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 8) {
                particle.trail.shift();
            }
            
            // Update pulse animation
            particle.pulse += 0.03;
            
            // Screen wrapping with smooth transition
            if (particle.x < -20) particle.x = this.canvas.width + 20;
            if (particle.x > this.canvas.width + 20) particle.x = -20;
            if (particle.y < -20) particle.y = this.canvas.height + 20;
            if (particle.y > this.canvas.height + 20) particle.y = -20;
            
            // Velocity damping
            particle.vx *= 0.995;
            particle.vy *= 0.995;
        });
    }
    
    updateGeometricShapes() {
        this.geometricShapes.forEach(shape => {
            // Update position
            shape.x += shape.vx;
            shape.y += shape.vy;
            shape.rotation += shape.rotationSpeed;
            
            // Mouse repulsion effect for shapes
            const dx = this.mouse.x - shape.x;
            const dy = this.mouse.y - shape.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                const angle = Math.atan2(dy, dx);
                shape.vx -= Math.cos(angle) * force * 0.01;
                shape.vy -= Math.sin(angle) * force * 0.01;
            }
            
            // Screen wrapping
            if (shape.x < -50) shape.x = this.canvas.width + 50;
            if (shape.x > this.canvas.width + 50) shape.x = -50;
            if (shape.y < -50) shape.y = this.canvas.height + 50;
            if (shape.y > this.canvas.height + 50) shape.y = -50;
            
            // Velocity damping
            shape.vx *= 0.99;
            shape.vy *= 0.99;
        });
    }
    
    createMouseExplosion() {
        // Create burst effect at mouse position
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = Math.random() * 4 + 2;
            const color = this.colors.neon[Math.floor(Math.random() * this.colors.neon.length)];
            
            const particle = {
                x: this.mouse.x,
                y: this.mouse.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: color,
                glow: 20,
                pulse: 0,
                trail: [],
                energy: 1,
                life: 1,
                decay: 0.02
            };
            
            this.particles.push(particle);
        }
        
        // Remove oldest particles to maintain count
        if (this.particles.length > this.maxParticles + 15) {
            this.particles.splice(0, 15);
        }
    }
    
    animate() {
        // Create fade effect instead of clearing
        this.ctx.fillStyle = 'rgba(12, 12, 12, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.updateGeometricShapes();
        
        this.drawConnections();
        
        // Draw all particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw geometric shapes
        this.geometricShapes.forEach(shape => this.drawGeometricShape(shape));
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('click', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.createMouseExplosion();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(this.animationId);
            } else {
                this.animate();
            }
        });
    }
    
    updateTheme(theme) {
        // Adapt colors based on theme
        if (theme === 'light') {
            this.colors.primary = ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
            this.colors.accent = ['#00b894', '#00cec9', '#74b9ff', '#0984e3'];
        } else {
            this.colors.primary = ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
            this.colors.accent = ['#20c997', '#51cf66', '#74b9ff', '#0984e3'];
        }
        
        // Update existing particles
        this.particles.forEach(particle => {
            const colors = [...this.colors.primary, ...this.colors.accent];
            particle.color = colors[Math.floor(Math.random() * colors.length)];
        });
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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize futuristic particle system
    window.futuristicParticles = new FuturisticParticles();
    
    // Connect to theme manager if available
    if (window.themeManager) {
        document.addEventListener('themeChange', (e) => {
            if (window.futuristicParticles) {
                window.futuristicParticles.updateTheme(e.detail.theme);
            }
        });
    }
});