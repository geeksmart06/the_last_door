import type { PhysicsState, LevelNumber } from '../types/game';

export interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export class PhysicsController {
  public state: PhysicsState = {
    x: 400,
    y: 350,
    vx: 0,
    vy: 0,
    angle: 0,
    rotationSpeed: 0,
    isMagnetAnchored: false,
    isGravityReversed: false,
  };

  public debrisParticles: DebrisParticle[] = [];
  private collisionCooldown = 0;

  public reset(level: LevelNumber) {
    this.state = {
      x: 400,
      y: 320,
      vx: 0,
      vy: 0,
      angle: 0,
      rotationSpeed: level === 2 ? 0.02 : 0,
      isMagnetAnchored: false,
      isGravityReversed: false,
    };
    this.collisionCooldown = 0;

    // Initialize shrapnel for Level 3
    if (level === 3) {
      this.debrisParticles = Array.from({ length: 10 }, () => ({
        x: Math.random() * 800,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2 + 1,
        size: Math.random() * 6 + 4,
      }));
    } else {
      this.debrisParticles = [];
    }
  }

  public applyThrusterImpulse(dx: number, dy: number, fuelRemaining: number): boolean {
    if (fuelRemaining <= 0 || this.state.isMagnetAnchored) return false;

    // Apply smooth thruster impulse
    this.state.vx += dx * 0.5;
    this.state.vy += dy * 0.5;
    return true;
  }

  public toggleMagnetBoots(): boolean {
    this.state.isMagnetAnchored = !this.state.isMagnetAnchored;
    if (this.state.isMagnetAnchored) {
      this.state.vx = 0;
      this.state.vy = 0;
    }
    return this.state.isMagnetAnchored;
  }

  public toggleGravityFlip(): boolean {
    this.state.isGravityReversed = !this.state.isGravityReversed;
    return this.state.isGravityReversed;
  }

  public update(level: LevelNumber, boundsWidth = 800, boundsHeight = 450): {
    collidedWithWall: boolean;
    pulledToSingularity: boolean;
    decompressionPull: boolean;
  } {
    let collidedWithWall = false;
    let pulledToSingularity = false;
    let decompressionPull = false;

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }

    if (this.state.isMagnetAnchored) {
      this.state.vx = 0;
      this.state.vy = 0;
      return { collidedWithWall: false, pulledToSingularity: false, decompressionPull: false };
    }

    // LEVEL-SPECIFIC PHYSICS FORCES
    switch (level) {
      case 1: {
        // Zero-G: Damped floating inertia
        this.state.vx *= 0.98;
        this.state.vy *= 0.98;
        break;
      }
      case 2: {
        // Centrifuge: Rotational drift
        this.state.angle += this.state.rotationSpeed;
        const centripetalForceX = Math.cos(this.state.angle) * 0.08;
        const centripetalForceY = Math.sin(this.state.angle) * 0.08;
        this.state.vx += centripetalForceX;
        this.state.vy += centripetalForceY;

        // Velocity damping
        this.state.vx *= 0.96;
        this.state.vy *= 0.96;

        // Outer wall radius check (Center = 400, 225, Radius = 190)
        const dx = this.state.x - 400;
        const dy = this.state.y - 225;
        const distFromCenter = Math.hypot(dx, dy);

        if (distFromCenter > 185) {
          // Clamp player back inside the wall
          const angleFromCenter = Math.atan2(dy, dx);
          this.state.x = 400 + Math.cos(angleFromCenter) * 184;
          this.state.y = 225 + Math.sin(angleFromCenter) * 184;
          this.state.vx *= -0.2;
          this.state.vy *= -0.2;

          if (this.collisionCooldown <= 0) {
            collidedWithWall = true;
            this.collisionCooldown = 25; // Debounce collision damage for 1 sec
          }
        }
        break;
      }
      case 3: {
        // Debris Field: Decompression pull toward top-right hull breach (700, 80)
        const breachX = 700;
        const breachY = 80;
        const dx = breachX - this.state.x;
        const dy = breachY - this.state.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 20) {
          this.state.vx += (dx / dist) * 0.08;
          this.state.vy += (dy / dist) * 0.08;
          decompressionPull = true;
        }

        // Update shrapnel particles
        this.debrisParticles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > boundsWidth) p.vx *= -1;
          if (p.y < 0 || p.y > boundsHeight) p.vy *= -1;
        });

        this.state.vx *= 0.97;
        this.state.vy *= 0.97;
        break;
      }
      case 4: {
        // Event Horizon: Black Hole pull toward center (400, 200)
        const bhX = 400;
        const bhY = 200;
        const dx = bhX - this.state.x;
        const dy = bhY - this.state.y;
        const distSq = Math.max(900, dx * dx + dy * dy);
        const force = 1200 / distSq;

        this.state.vx += (dx / Math.sqrt(distSq)) * force;
        this.state.vy += (dy / Math.sqrt(distSq)) * force;

        if (Math.hypot(dx, dy) < 40) {
          if (this.collisionCooldown <= 0) {
            pulledToSingularity = true;
            this.collisionCooldown = 25;
          }
        }

        this.state.vx *= 0.96;
        this.state.vy *= 0.96;
        break;
      }
      case 5: {
        // Quantum Core: Inverted or superposed gravity
        const gravityDir = this.state.isGravityReversed ? -1 : 1;
        this.state.vy += gravityDir * 0.12;

        this.state.vx *= 0.97;
        this.state.vy *= 0.97;
        break;
      }
    }

    // Apply velocity to position
    this.state.x += this.state.vx;
    this.state.y += this.state.vy;

    // Clamp inside canvas bounds
    const minX = 40;
    const maxX = boundsWidth - 40;
    const minY = 60;
    const maxY = boundsHeight - 60;

    if (this.state.x < minX) {
      this.state.x = minX;
      this.state.vx = 0;
    }
    if (this.state.x > maxX) {
      this.state.x = maxX;
      this.state.vx = 0;
    }
    if (this.state.y < minY) {
      this.state.y = minY;
      this.state.vy = 0;
    }
    if (this.state.y > maxY) {
      this.state.y = maxY;
      this.state.vy = 0;
    }

    return { collidedWithWall, pulledToSingularity, decompressionPull };
  }
}
