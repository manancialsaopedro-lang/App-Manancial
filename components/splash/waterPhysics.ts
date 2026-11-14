export interface WaterRipple {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  strength: number;
  age: number;
  life: number;
}

export interface WakeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
}

export interface WaveSample {
  dx: number;
  dy: number;
  crest: number;
}

export type ParticleTone = 'cyan' | 'sage' | 'ice';

export interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number;
  baseAlpha: number;
  phase: number;
  tone: ParticleTone;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export class WaterSimulation {
  width = 1440;
  height = 900;
  pointerX = 720;
  pointerY = 450;
  smoothX = 720;
  smoothY = 450;
  pointerVx = 0;
  pointerVy = 0;
  hasPointer = false;
  ripples: WaterRipple[] = [];
  wakes: WakeNode[] = [];
  particles: FluidParticle[] = [];

  private nextId = 1;
  private lastSpawnDist = 0;
  private targetParticleCount = 0;

  initParticles(count: number): void {
    const safeCount = Math.max(0, Math.min(400, count));
    this.targetParticleCount = safeCount;
    this.particles = [];
    const tones: ParticleTone[] = ['cyan', 'cyan', 'sage', 'ice'];

    for (let i = 0; i < safeCount; i++) {
      const rx = pseudoRandom(i * 3 + 1);
      const ry = pseudoRandom(i * 3 + 2);
      const rd = pseudoRandom(i * 3 + 3);
      const rs = pseudoRandom(i * 7 + 5);
      const depth = 0.28 + rd * 0.72;

      this.particles.push({
        x: rx * this.width,
        y: ry * this.height,
        vx: 0,
        vy: 0,
        size: 0.45 + rs * 0.85,
        depth,
        baseAlpha: 0.14 + depth * 0.44,
        phase: pseudoRandom(i * 11 + 7) * Math.PI * 2,
        tone: tones[i % tones.length],
      });
    }
  }

  resize(width: number, height: number): void {
    const safeW = Math.max(1, width);
    const safeH = Math.max(1, height);
    const prevW = this.width;
    const prevH = this.height;

    if (!this.hasPointer) {
      this.pointerX = safeW * 0.5;
      this.pointerY = safeH * 0.5;
      this.smoothX = this.pointerX;
      this.smoothY = this.pointerY;
    }

    this.width = safeW;
    this.height = safeH;

    if (this.particles.length > 0 && prevW > 0 && prevH > 0) {
      const sx = safeW / prevW;
      const sy = safeH / prevH;
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].x *= sx;
        this.particles[i].y *= sy;
      }
    } else if (this.targetParticleCount > 0) {
      this.initParticles(this.targetParticleCount);
    }
  }

  injectPointerMove(x: number, y: number, dtSec = 0.016): void {
    const clampedDt = Math.max(0.004, Math.min(0.1, dtSec));
    if (!this.hasPointer) {
      this.pointerX = x;
      this.pointerY = y;
      this.smoothX = x;
      this.smoothY = y;
      this.hasPointer = true;
      return;
    }

    const dx = x - this.pointerX;
    const dy = y - this.pointerY;
    const dist = Math.hypot(dx, dy);

    this.pointerVx = dx / clampedDt;
    this.pointerVy = dy / clampedDt;
    this.pointerX = x;
    this.pointerY = y;

    if (dist < 1) return;

    this.lastSpawnDist += dist;

    if (this.lastSpawnDist >= 14) {
      this.lastSpawnDist = 0;
      const speed = Math.min(2400, dist / clampedDt);
      const normSpeed = Math.min(1, speed / 1200);

      this.wakes.push({
        x,
        y,
        vx: dx * 0.35,
        vy: dy * 0.35,
        age: 0,
        life: 1.35 + normSpeed * 0.45,
        size: 36 + normSpeed * 54,
      });

      if (this.wakes.length > 48) {
        this.wakes.shift();
      }

      if (normSpeed > 0.12) {
        this.ripples.push({
          id: this.nextId++,
          x,
          y,
          vx: dx * 0.18,
          vy: dy * 0.18,
          radius: 10,
          maxRadius: 150 + normSpeed * 170,
          strength: 0.35 + normSpeed * 0.5,
          age: 0,
          life: 1.7 + normSpeed * 0.6,
        });
        if (this.ripples.length > 28) {
          this.ripples.shift();
        }
      }
    }
  }

  injectPulse(x: number, y: number, strength = 1): void {
    const clampedStrength = Math.max(0.2, Math.min(1.5, strength));
    this.ripples.push({
      id: this.nextId++,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 12,
      maxRadius: 280 * clampedStrength,
      strength: clampedStrength,
      age: 0,
      life: 2.2,
    });
    if (this.ripples.length > 28) {
      this.ripples.shift();
    }
  }

  sampleViscousFlow(x: number, y: number, timeSec: number): { fx: number; fy: number } {
    const nx = x * 0.0024;
    const ny = y * 0.0024;
    const t = timeSec * 0.22;

    const a1 = Math.sin(nx * 1.4 + t) * Math.cos(ny * 1.3 - t * 0.8);
    const a2 = Math.cos(nx * 2.7 - t * 1.1 + ny * 1.1) * 0.55;
    const fx = Math.cos(ny * 1.7 + t * 0.9) * 10 + a2 * 8 + 4.5;
    const fy = Math.sin(nx * 1.8 - t * 0.75) * 9 + a1 * 7;

    return { fx, fy };
  }

  stepParticles(dtSec: number, timeSec: number): void {
    if (this.particles.length === 0) return;

    const dt = Math.max(0.001, Math.min(0.05, dtSec));
    const relax = 1 - Math.exp(-dt * 3.4);
    const ptrSpeed = Math.hypot(this.pointerVx, this.pointerVy);
    const clampedPtrVx = Math.max(-700, Math.min(700, this.pointerVx));
    const clampedPtrVy = Math.max(-700, Math.min(700, this.pointerVy));
    const influenceRadius = 185;
    const invSigmaSq = 1 / (2 * 76 * 76);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const flow = this.sampleViscousFlow(p.x, p.y, timeSec);
      let targetVx = flow.fx * p.depth;
      let targetVy = flow.fy * p.depth;

      const dx = p.x - this.smoothX;
      const dy = p.y - this.smoothY;
      const distSq = dx * dx + dy * dy;

      if (distSq < influenceRadius * influenceRadius) {
        const weight = Math.exp(-distSq * invSigmaSq) * (0.45 + p.depth * 0.55);
        if (ptrSpeed > 6) {
          targetVx += clampedPtrVx * 0.14 * weight;
          targetVy += clampedPtrVy * 0.14 * weight;
        }
        const dist = Math.sqrt(distSq) || 1;
        const swirl = 18 * weight;
        targetVx += (-dy / dist) * swirl + (dx / dist) * 6 * weight;
        targetVy += (dx / dist) * swirl + (dy / dist) * 6 * weight;
      }

      p.vx += (targetVx - p.vx) * relax;
      p.vy += (targetVy - p.vy) * relax;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -8) p.x = this.width + 8;
      else if (p.x > this.width + 8) p.x = -8;

      if (p.y < -8) p.y = this.height + 8;
      else if (p.y > this.height + 8) p.y = -8;
    }
  }

  step(dtSec: number, timeSec = 0): void {
    const dt = Math.max(0.001, Math.min(0.05, dtSec));
    const lerp = 1 - Math.exp(-dt * 8.5);
    this.smoothX += (this.pointerX - this.smoothX) * lerp;
    this.smoothY += (this.pointerY - this.smoothY) * lerp;

    const damping = Math.exp(-dt * 3.8);
    this.pointerVx *= damping;
    this.pointerVy *= damping;

    this.stepParticles(dt, timeSec);

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.age += dt;
      if (r.age >= r.life) {
        this.ripples.splice(i, 1);
        continue;
      }
      const progress = r.age / r.life;
      const eased = 1 - Math.pow(1 - progress, 2.2);
      r.radius = 12 + (r.maxRadius - 12) * eased;
      r.x += r.vx * dt * 2.5;
      r.y += r.vy * dt * 2.5;
      r.vx *= 0.96;
      r.vy *= 0.96;
    }

    for (let i = this.wakes.length - 1; i >= 0; i--) {
      const w = this.wakes[i];
      w.age += dt;
      if (w.age >= w.life) {
        this.wakes.splice(i, 1);
        continue;
      }
      w.x += w.vx * dt * 1.8;
      w.y += w.vy * dt * 1.8;
      w.vx *= 0.95;
      w.vy *= 0.95;
    }
  }

  getNormalizedTilt(): { rx: number; ry: number } {
    const nx = (this.smoothX / this.width - 0.5) * 2;
    const ny = (this.smoothY / this.height - 0.5) * 2;
    return {
      rx: Math.max(-1, Math.min(1, -ny)),
      ry: Math.max(-1, Math.min(1, nx)),
    };
  }

  sampleWaveOffset(x: number, y: number, timeSec: number): WaveSample {
    const ambientX =
      Math.sin(y * 0.008 + timeSec * 0.9) * 14 +
      Math.cos(x * 0.004 - timeSec * 0.55) * 8;
    const ambientY =
      Math.cos(x * 0.006 + timeSec * 0.8) * 11 +
      Math.sin((x + y) * 0.0045 + timeSec * 0.65) * 7;

    let dx = ambientX;
    let dy = ambientY;
    let crest = 0.25 + 0.15 * Math.sin(x * 0.01 + y * 0.008 + timeSec * 1.2);

    const ptrDx = x - this.smoothX;
    const ptrDy = y - this.smoothY;
    const ptrDist = Math.hypot(ptrDx, ptrDy);
    if (ptrDist < 260) {
      const falloff = 1 - ptrDist / 260;
      const swirl = falloff * falloff * 24;
      const angle = Math.atan2(ptrDy, ptrDx);
      dx += Math.cos(angle) * swirl + this.pointerVx * 0.012 * falloff;
      dy += Math.sin(angle) * swirl + this.pointerVy * 0.012 * falloff;
      crest += falloff * 0.38;
    }

    for (let i = 0; i < this.ripples.length; i++) {
      const r = this.ripples[i];
      const rx = x - r.x;
      const ry = y - r.y;
      const d = Math.hypot(rx, ry);
      const bandDist = Math.abs(d - r.radius);
      if (bandDist < 48 && d > 0.001) {
        const lifeFactor = 1 - r.age / r.life;
        const wave = Math.cos((bandDist / 48) * Math.PI * 0.5) * r.strength * lifeFactor;
        dx += (rx / d) * wave * 22;
        dy += (ry / d) * wave * 22;
        crest += wave * 0.45;
      }
    }

    return {
      dx,
      dy,
      crest: Math.max(0, Math.min(1, crest)),
    };
  }
}
