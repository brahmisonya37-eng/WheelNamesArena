import { pick } from "./random";

const COLORS = [
  "#6d4aff", "#ff6b5e", "#ffb020", "#2dd4a7", "#38bdf8", "#f472b6",
  "#ffd884", "#a78bfa", "#34d399", "#fb923c", "#f43f5e", "#22d3ee",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "streamer";
  life: number;
}

/**
 * Fire a big confetti burst across the viewport. Respects reduced motion.
 * power scales the piece count (wheel wins use ~1.3, giveaways 1.2).
 */
export function fireConfetti(power = 1) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const g = canvas.getContext("2d");
  if (!g) {
    canvas.remove();
    return;
  }
  g.scale(dpr, dpr);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const count = Math.round(300 * power);
  const particles: Particle[] = [];

  const newParticle = (x: number, y: number, angle: number, speed: number): Particle => {
    const roll = Math.random();
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * (roll > 0.72 ? 0.55 : 0.3),
      size: 6 + Math.random() * 8,
      color: pick(COLORS),
      shape: roll > 0.72 ? "streamer" : roll > 0.34 ? "rect" : "circle",
      life: 1,
    };
  };

  const cannon = (x: number, y: number, angle: number, spread: number, n: number, speedMin = 10, speedVar = 11) => {
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const speed = speedMin + Math.random() * speedVar;
      particles.push(newParticle(x, y, a, speed));
    }
  };

  // Two strong side cannons…
  cannon(W * 0.06, H * 0.88, -Math.PI / 2.9, 1.0, Math.round(count * 0.32));
  cannon(W * 0.94, H * 0.88, -Math.PI + Math.PI / 2.9, 1.0, Math.round(count * 0.32));
  // …a center blast shooting straight up…
  cannon(W * 0.5, H * 0.96, -Math.PI / 2, 0.8, Math.round(count * 0.22), 12, 12);
  // …and a wide shower raining from the top.
  for (let i = 0; i < Math.round(count * 0.14); i++) {
    const p = newParticle(Math.random() * W, -20 - Math.random() * H * 0.25, Math.PI / 2 + (Math.random() - 0.5) * 0.5, 2.5 + Math.random() * 4);
    particles.push(p);
  }

  const start = performance.now();
  const DURATION = 3300;

  const frame = (now: number) => {
    const elapsed = now - start;
    g.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      p.vy += 0.3;
      p.vx *= 0.99;
      p.vy *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - elapsed / DURATION);
      if (p.life <= 0 || p.y > H + 40) continue;
      alive = true;
      g.save();
      g.globalAlpha = Math.min(1, p.life * 1.4);
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      if (p.shape === "rect") {
        g.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      } else if (p.shape === "streamer") {
        g.fillRect(-p.size * 0.9, -p.size * 0.16, p.size * 1.8, p.size * 0.32);
      } else {
        g.beginPath();
        g.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    if (alive && elapsed < DURATION + 200) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(frame);
}
