type rgb = { r: number; g: number; b: number; a?: number };

const colorPalette: rgb[] = [
  // { r: 30, g: 27, b: 56 },
  { r: 71, g: 64, b: 133 },
  { r: 119, g: 45, b: 169 },
];

let colorIndex = 0;
const getNextColor = () => {
  const color = colorPalette[colorIndex];
  colorIndex = (colorIndex + 1) % colorPalette.length;
  return color;
};

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: rgb;
  trailquantSave = 0;
  alpha = 1;
  trail: {
    x: number;
    y: number;
    color: { r: number; g: number; b: number };
    alpha?: number;
  }[];
  public fireworkQuantity: number;
  constructor(x?: number, y?: number, public isFirework = false) {
    this.x = x ? x : Math.random() * 100;
    this.y = y ? y : Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 0.03;
    this.vy = (Math.random() - 0.5) * 0.03;
    this.radius = isFirework ? 3 : Math.random() * 4 + 1;
    this.color = getNextColor();
    this.fireworkQuantity = 20;
    this.trail = [];
  }

  update(mouse: { x: number | null; y: number | null }) {
    const dist =
      mouse.x !== null && mouse.y !== null
        ? Math.sqrt((mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2)
        : 0;
    const force = dist && dist < 10 ? (10 - dist) / 10 : 0;
    if (dist && mouse.x !== null && mouse.y !== null) {
      const sqrtDist = Math.sqrt(dist);
      this.vx += ((mouse.x - this.x) / sqrtDist) * force * 0.01;
      this.vy += ((mouse.y - this.y) / sqrtDist) * force * 0.01;
    }
    if (this.isFirework) {
      this.alpha -= (this.alpha / this.fireworkQuantity) * 0.6;
      if (this.fireworkQuantity <= 0) return;
    }
    this.vx *= mouse.x !== null ? 0.999 : 0.98;
    this.vy *= mouse.y !== null ? 0.999 : 0.98;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > 100) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > 100) {
      this.vy *= -1;
    }

    if (this.trailquantSave >= 4) {
      this.trailquantSave = 0;
      this.trail.push({
        x: this.x,
        y: this.y,
        color: { ...this.color },
      });
      if (this.trail.length > 10) this.trail.shift();
    }
    this.trailquantSave++;
  }
  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.beginPath();
    ctx.arc(
      (this.x * canvas.width) / 100,
      (this.y * canvas.height) / 100,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
    ctx.fill();

    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
        this.color.g
      )}, ${Math.round(this.color.b)}, ${this.alpha})`;
      ctx.moveTo(
        (this.trail[0].x * canvas.width) / 100,
        (this.trail[0].y * canvas.height) / 100
      );
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(
          (this.trail[i].x * canvas.width) / 100,
          (this.trail[i].y * canvas.height) / 100
        );
      }
      ctx.stroke();
    }
  }
}

class DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: rgb;
  constructor() {
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 0.01;
    this.vy = (Math.random() - 0.5) * 0.01;
    this.radius = Math.random() * 2 + 1;
    this.color = getNextColor();
  }
  update(): void {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > 100) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > 100) {
      this.vy *= -1;
    }
  }
  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.beginPath();
    ctx.arc(
      (this.x * canvas.width) / 100,
      (this.y * canvas.height) / 100,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`;
    ctx.fill();
  }
}

class RippleImpl {
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

    const t = this.transitionProgress;
    this.color = {
      r: this.startColor.r * (1 - t) + this.targetColor.r * t,
      g: this.startColor.g * (1 - t) + this.targetColor.g * t,
      b: this.startColor.b * (1 - t) + this.targetColor.b * t,
    };
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.strokeStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(
      this.color.g
    )}, ${Math.round(this.color.b)}, ${this.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      (this.x * canvas.width) / 100,
      (this.y * canvas.height) / 100,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  isDone(): boolean {
    return this.alpha <= 0;
  }
}

function randomCord(width: number, height: number): { x: number; y: number } {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

function distance(
  point1: { x: number; y: number },
  ponit2: { x: number; y: number }
) {
  const dx = ponit2.x - point1.x;
  const dy = ponit2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export {
  colorPalette,
  getNextColor,
  Particle,
  DustParticle,
  randomCord,
  distance,
  RippleImpl,
};
export type { rgb };
