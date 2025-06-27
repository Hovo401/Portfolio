import {
  Particle,
  DustParticle,
  distance,
  RippleImpl,
} from "./AnimationFunction";
// import type { rgb } from "./AnimationFunction";

interface MouseState {
  x: number | null;
  y: number | null;
  set(position: { x: number; y: number }): void;
  reset(): void;
}

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

class CanvasAnimation {
  public dustParticleQuantity = 50;
  public ParticleQuantity = 200;

  private ctx: CanvasRenderingContext2D;
  private loopOn = false;
  private dustParticleArray: DustParticle[] = [];
  private ParticleArray: Particle[] = [];
  private fireworkParticles: Particle[] = [];
  private ripples: RippleImpl[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    this.ctx = ctx;
  }
  public setup() {
    for (let i = 0; i < this.dustParticleQuantity; i++) {
      this.dustParticleArray.push(new DustParticle());
    }
    for (let i = 0; i < this.ParticleQuantity; i++) {
      this.ParticleArray.push(new Particle());
    }

    this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      mouse.set({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    });

    this.canvas.addEventListener("click", (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / this.canvas.width) * 100;
      const clickY = ((e.clientY - rect.top) / this.canvas.height) * 100;

      this.ripples.push(new RippleImpl(clickX, clickY, 60));

      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.2;
        const particle = new Particle(clickX, clickY, true);
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        this.fireworkParticles.push(particle);
      }
    });

    this.canvas.addEventListener("mouseleave", () => {
      mouse.reset();
    });

    this.start();
  }
  public stop() {
    this.loopOn = false;
  }
  public start() {
    this.loopOn = true;
    this.loop();
  }
  private loop() {
    if (this.loopOn) {
      requestAnimationFrame(this.loop.bind(this));
    }
    this.canvas.width =
      this.canvas.clientWidth * (window.devicePixelRatio > 2 ? 2 : 1);
    this.canvas.height =
      this.canvas.clientHeight * (window.devicePixelRatio > 2 ? 2 : 1);
    this.update();
    this.draw();
  }

  private update() {
    for (const dustParticle of this.dustParticleArray) {
      dustParticle.update();
    }
    for (const ripple of this.ripples) {
      ripple.update();
    }
    for (const i in this.fireworkParticles) {
      const fireworkParticle = this.fireworkParticles[i];
      fireworkParticle.update({ x: null, y: null });
      if (fireworkParticle.fireworkQuantity <= 0)
        this.fireworkParticles.splice(Number(i), 1);
    }
    for (const Particle of this.ParticleArray) {
      Particle.update({
        x: ((mouse.x || 0) / this.canvas.width) * 100,
        y: ((mouse.y || 0) / this.canvas.height) * 100,
      });
    }
  }

  private draw() {
    const bgColor = "#1E1B38";
    const ctx = this.ctx;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const dustParticle of this.dustParticleArray) {
      dustParticle.draw(ctx, this.canvas);
    }
    for (const ripple of this.ripples) {
      ripple.draw(ctx, this.canvas);
    }

    for (const Particle of this.ParticleArray) {
      Particle.draw(ctx, this.canvas);

      for (const Particle_2 of this.ParticleArray) {
        if (
          Particle === Particle_2 ||
          distance(
            {
              x: (Particle.x * this.canvas.width) / 100,
              y: (Particle.y * this.canvas.height) / 100,
            },
            {
              x: (Particle_2.x * this.canvas.width) / 100,
              y: (Particle_2.y * this.canvas.height) / 100,
            }
          ) > 50
        )
          continue;

        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(${Math.round(Particle.color.r)}, ${Math.round(
          Particle.color.g
        )}, ${Math.round(Particle.color.b)})`;
        ctx.moveTo(
          (Particle.x * this.canvas.width) / 100,
          (Particle.y * this.canvas.height) / 100
        );
        ctx.lineTo(
          (Particle_2.x * this.canvas.width) / 100,
          (Particle_2.y * this.canvas.height) / 100
        );
        ctx.stroke();
      }
    }

    for (const i in this.fireworkParticles) {
      this.fireworkParticles[i].fireworkQuantity--;
      this.fireworkParticles[i].draw(ctx, this.canvas);
    }
  }
}

export default CanvasAnimation;
