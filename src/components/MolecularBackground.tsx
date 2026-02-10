import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    connections: number[];
}

interface MolecularBackgroundProps {
    className?: string;
    particleCount?: number;
    connectionDistance?: number;
    mouseInfluence?: number;
}

export const MolecularBackground = ({
    className = '',
    particleCount = 60,
    connectionDistance = 150,
    mouseInfluence = 100,
}: MolecularBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();

    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1.5,
                opacity: Math.random() * 0.5 + 0.3,
                connections: [],
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        // Update and draw particles
        particles.forEach((particle, i) => {
            // Mouse influence
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouseInfluence) {
                const force = (mouseInfluence - dist) / mouseInfluence;
                particle.vx -= (dx / dist) * force * 0.02;
                particle.vy -= (dy / dist) * force * 0.02;
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Boundaries
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;
            particle.x = Math.max(0, Math.min(width, particle.x));
            particle.y = Math.max(0, Math.min(height, particle.y));

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(200, 80%, 60%, ${particle.opacity})`;
            ctx.fill();

            // Draw connections
            particles.forEach((other, j) => {
                if (i >= j) return;
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = `hsla(195, 70%, 55%, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
    }, [connectionDistance, mouseInfluence]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            initParticles(rect.width, rect.height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            const rect = canvas.getBoundingClientRect();
            draw(ctx, rect.width, rect.height);
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [draw, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
            style={{ background: 'transparent' }}
        />
    );
};
