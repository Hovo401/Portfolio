import { useRef, useEffect } from "react";

// Интерфейсы остаются прежними, добавляем новые свойства
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: { r: number; g: number; b: number };
  alpha: number;
  sizeDirection: number;
  trail: {
    x: number;
    y: number;
    color: { r: number; g: number; b: number };
    alpha: number;
  }[];
  isFirework: boolean;
  startColor: { r: number; g: number; b: number }; // Начальный цвет
  targetColor: { r: number; g: number; b: number }; // Целевой цвет
  transitionProgress: number; // Прогресс перехода
  update(mouse: { x: number | null; y: number | null }): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isDead?(): boolean;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  color: { r: number; g: number; b: number };
  vx: number;
  vy: number;
  startColor: { r: number; g: number; b: number };
  targetColor: { r: number; g: number; b: number };
  transitionProgress: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: { r: number; g: number; b: number };
  startColor: { r: number; g: number; b: number };
  targetColor: { r: number; g: number; b: number };
  transitionProgress: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isDone?(): boolean;
}

interface MouseState {
  x: number | null;
  y: number | null;
  set(position: { x: number; y: number }): void;
  reset(): void;
}

function DynamicBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Расширяем палитру для демонстрации переходов
  const colorPalette: { r: number; g: number; b: number }[] = [
    { r: 30, g: 27, b: 56 }, // 30,27,56
    { r: 71, g: 64, b: 133 }, // 71,64,133
    { r: 119, g: 45, b: 169 }, // 119,45,169
  ];

  let colorIndex = 0;
  const getNextColor = () => {
    const color = colorPalette[colorIndex];
    colorIndex = (colorIndex + 1) % colorPalette.length;
    return color;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const fireworkParticles: Particle[] = [];
    const dustParticles: DustParticle[] = [];
    const ripples: Ripple[] = [];
    const techRipples: Ripple[] = [];

    const mouse: MouseState = (() => {
      let state: { x: number | null; y: number | null } = { x: null, y: null };
      return {
        get x() {
          return state.x;
        },
        get y() {
          return state.y;
        },
        set({ x, y }: { x: number; y: number }) {
          state = { x, y };
        },
        reset() {
          state = { x: null, y: null };
        },
      };
    })();

    let frameCount = 0;
    let autoDrift = true;

    function adjustParticleCount(): number {
      const particleConfig = {
        heightConditions: [200, 300, 400, 500, 600],
        widthConditions: [450, 600, 900, 1200, 1600],
        particlesForHeight: [40, 60, 70, 90, 110],
        particlesForWidth: [40, 50, 70, 90, 110],
      };

      let numParticles = 130;

      for (let i = 0; i < particleConfig.heightConditions.length; i++) {
        if (canvas!.height < particleConfig.heightConditions[i]) {
          numParticles = particleConfig.particlesForHeight[i];
          break;
        }
      }

      for (let i = 0; i < particleConfig.widthConditions.length; i++) {
        if (canvas!.width < particleConfig.widthConditions[i]) {
          numParticles = Math.min(
            numParticles,
            particleConfig.particlesForWidth[i]
          );
          break;
        }
      }

      return numParticles;
    }

    class ParticleImpl implements Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: { r: number; g: number; b: number };
      alpha: number;
      sizeDirection: number;
      trail: {
        x: number;
        y: number;
        color: { r: number; g: number; b: number };
        alpha: number;
      }[];
      isFirework: boolean;
      startColor: { r: number; g: number; b: number };
      targetColor: { r: number; g: number; b: number };
      transitionProgress: number;

      constructor(x: number, y: number, isFirework = false) {
        const baseSpeed = isFirework
          ? Math.random() * 2 + 1
          : Math.random() * 0.5 + 0.3;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(Math.random() * Math.PI * 2) * baseSpeed;
        this.vy = Math.sin(Math.random() * Math.PI * 2) * baseSpeed;
        this.size = isFirework ? Math.random() * 2 + 2 : Math.random() * 3 + 1;
        this.startColor = getNextColor();
        this.targetColor = { ...this.startColor };
        this.transitionProgress = 1;
        this.color = { ...this.startColor };
        this.alpha = 1;
        this.sizeDirection = Math.random() < 0.5 ? -1 : 1;
        this.trail = [];
        this.isFirework = isFirework;
      }

      update(mouse: { x: number | null; y: number | null }) {
        const dist =
          mouse.x !== null && mouse.y !== null
            ? (mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2
            : 0;

        if (!this.isFirework) {
          const force = dist && dist < 22500 ? (22500 - dist) / 22500 : 0;

          if (mouse.x === null && autoDrift) {
            this.vx += (Math.random() - 0.5) * 0.03;
            this.vy += (Math.random() - 0.5) * 0.03;
          }

          if (dist && mouse.x !== null && mouse.y !== null) {
            const sqrtDist = Math.sqrt(dist);
            this.vx += ((mouse.x - this.x) / sqrtDist) * force * 0.1;
            this.vy += ((mouse.y - this.y) / sqrtDist) * force * 0.1;
          }

          this.vx *= mouse.x !== null ? 0.99 : 0.998;
          this.vy *= mouse.y !== null ? 0.99 : 0.998;
        } else {
          this.alpha -= 0.02;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x <= 0 || this.x >= canvas!.width - 1) this.vx *= -0.9;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -0.9;

        this.size += this.sizeDirection * 0.1;
        if (this.size > 4 || this.size < 1) this.sizeDirection *= -1;

        // Логика плавного перехода цвета
        if (frameCount % 60 === 0) {
          this.startColor = { ...this.color };
          this.targetColor = getNextColor();
          this.transitionProgress = 0;
        } else {
          this.transitionProgress = Math.min(
            this.transitionProgress + 1 / 60,
            1
          );
        }

        const t = this.transitionProgress;
        this.color = {
          r: this.startColor.r * (1 - t) + this.targetColor.r * t,
          g: this.startColor.g * (1 - t) + this.targetColor.g * t,
          b: this.startColor.b * (1 - t) + this.targetColor.b * t,
        };

        if (
          frameCount % 3 === 0 &&
          (Math.abs(this.vx) > 0.2 || Math.abs(this.vy) > 0.2)
        ) {
          this.trail.push({
            x: this.x,
            y: this.y,
            color: { ...this.color },
            alpha: this.alpha,
          });
          if (this.trail.length > 10) this.trail.shift();
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
          this.color.g
        )}, ${Math.round(this.color.b)}, ${Math.max(this.alpha, 0)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.trail.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
            this.color.g
          )}, ${Math.round(this.color.b)}, ${Math.max(this.alpha, 0)})`;
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          ctx.stroke();
        }
      }

      isDead(): boolean {
        return this.isFirework && this.alpha <= 0;
      }
    }

    class DustParticleImpl implements DustParticle {
      x: number;
      y: number;
      size: number;
      color: { r: number; g: number; b: number };
      vx: number;
      vy: number;
      startColor: { r: number; g: number; b: number };
      targetColor: { r: number; g: number; b: number };
      transitionProgress: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.startColor = getNextColor();
        this.targetColor = { ...this.startColor };
        this.transitionProgress = 1;
        this.color = { ...this.startColor };
        this.vx = (Math.random() - 0.5) * 0.05;
        this.vy = (Math.random() - 0.5) * 0.05;
      }

      update() {
        this.x = (this.x + this.vx + canvas!.width) % canvas!.width;
        this.y = (this.y + this.vy + canvas!.height) % canvas!.height;

        // Логика плавного перехода цвета
        if (frameCount % 60 === 0) {
          this.startColor = { ...this.color };
          this.targetColor = getNextColor();
          this.transitionProgress = 0;
        } else {
          this.transitionProgress = Math.min(
            this.transitionProgress + 1 / 60,
            1
          );
        }

        const t = this.transitionProgress;
        this.color = {
          r: this.startColor.r * (1 - t) + this.targetColor.r * t,
          g: this.startColor.g * (1 - t) + this.targetColor.g * t,
          b: this.startColor.b * (1 - t) + this.targetColor.b * t,
        };
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
          this.color.g
        )}, ${Math.round(this.color.b)}, 0.3)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class RippleImpl implements Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: { r: number; g: number; b: number };
      startColor: { r: number; g: number; b: number };
      targetColor: { r: number; g: number; b: number };
      transitionProgress: number;

      constructor(x: number, y: number, maxRadius = 30) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.alpha = 0.5;
        this.startColor = getNextColor();
        this.targetColor = { ...this.startColor };
        this.transitionProgress = 1;
        this.color = { ...this.startColor };
      }

      update() {
        this.radius += 1.5;
        this.alpha -= 0.01;

        // Логика плавного перехода цвета
        if (frameCount % 60 === 0) {
          this.startColor = { ...this.color };
          this.targetColor = getNextColor();
          this.transitionProgress = 0;
        } else {
          this.transitionProgress = Math.min(
            this.transitionProgress + 1 / 60,
            1
          );
        }

        const t = this.transitionProgress;
        this.color = {
          r: this.startColor.r * (1 - t) + this.targetColor.r * t,
          g: this.startColor.g * (1 - t) + this.targetColor.g * t,
          b: this.startColor.b * (1 - t) + this.targetColor.b * t,
        };
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
          this.color.g
        )}, ${Math.round(this.color.b)}, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      isDone(): boolean {
        return this.alpha <= 0;
      }
    }

    function createParticles() {
      particles.length = 0;
      dustParticles.length = 0;

      const numParticles = adjustParticleCount();
      for (let i = 0; i < numParticles; i++) {
        particles.push(
          new ParticleImpl(
            Math.random() * canvas!.width,
            Math.random() * canvas!.height
          )
        );
      }
      for (let i = 0; i < 200; i++) {
        dustParticles.push(new DustParticleImpl());
      }
    }

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      createParticles();
    }

    function drawBackground() {
      ctx!.fillStyle = `#1E1B38`;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    function connectParticles() {
      const gridSize = 120;
      const grid = new Map<string, Particle[]>();

      particles.forEach((p) => {
        const key = `${Math.floor(p.x / gridSize)},${Math.floor(
          p.y / gridSize
        )}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(p);
      });

      ctx!.lineWidth = 1.5;
      let totalConnections = 0;
      const maxTotalConnections = 500;

      particles.forEach((p) => {
        if (totalConnections >= maxTotalConnections) return;
        const gridX = Math.floor(p.x / gridSize);
        const gridY = Math.floor(p.y / gridSize);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const key = `${gridX + dx},${gridY + dy}`;
            if (grid.has(key)) {
              grid.get(key)!.forEach((neighbor) => {
                if (totalConnections >= maxTotalConnections) return;
                if (
                  p !== neighbor &&
                  (p.x < neighbor.x || (p.x === neighbor.x && p.y < neighbor.y))
                ) {
                  const diffX = neighbor.x - p.x;
                  const diffY = neighbor.y - p.y;
                  const dist = diffX * diffX + diffY * diffY;
                  if (dist < 10000) {
                    const avgColor = {
                      r: (p.color.r + neighbor.color.r) / 2,
                      g: (p.color.g + neighbor.color.g) / 2,
                      b: (p.color.b + neighbor.color.b) / 2,
                    };
                    ctx!.strokeStyle = `rgba(${Math.round(
                      avgColor.r
                    )}, ${Math.round(avgColor.g)}, ${Math.round(avgColor.b)}, ${
                      1 - Math.sqrt(dist) / 100
                    })`;
                    ctx!.beginPath();
                    ctx!.moveTo(p.x, p.y);
                    ctx!.lineTo(neighbor.x, neighbor.y);
                    ctx!.stroke();
                    totalConnections++;
                  }
                }
              });
            }
          }
        }
      });
    }

    function animate() {
      drawBackground();

      [
        dustParticles,
        particles,
        ripples,
        techRipples,
        fireworkParticles,
      ].forEach((arr) => {
        for (let i = arr.length - 1; i >= 0; i--) {
          const obj = arr[i];
          obj.update(mouse);
          obj.draw(ctx!);
          if (
            ("isDone" in obj && obj.isDone?.()) ||
            ("isDead" in obj && obj.isDead?.())
          )
            arr.splice(i, 1);
        }
      });

      connectParticles();
      frameCount++;
      requestAnimationFrame(animate);
    }

    canvas.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.set({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      autoDrift = false;
    });

    canvas.addEventListener("mouseleave", () => {
      mouse.reset();
      autoDrift = true;
    });

    canvas.addEventListener("click", (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      ripples.push(new RippleImpl(clickX, clickY, 60));

      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const particle = new ParticleImpl(clickX, clickY, true);
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        fireworkParticles.push(particle);
      }
    });

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    animate();
  }, []);

  return (
    <div className="w-1/1 h-screen ">
      <canvas ref={canvasRef} id="DynamicBgCanvas" />
    </div>
  );
}

export default DynamicBg;
