import React, { useRef, useEffect, useState } from 'react';
import type { DoorState, GamePhase, MonsterState, LevelNumber, PhysicsState, AnomalyEvent } from '../types/game';
import type { DebrisParticle } from '../game/PhysicsController';

interface GameCanvasProps {
  phase: GamePhase;
  level: LevelNumber;
  doors: DoorState[];
  selectedDoorIndex: number | null;
  hostRevealedDoorIndices: number[];
  onSelectDoor: (index: number) => void;
  monster: MonsterState | null;
  shakeEffect: boolean;
  crtEnabled: boolean;
  physicsState: PhysicsState;
  debrisParticles: DebrisParticle[];
  activeEvent: AnomalyEvent | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  phase,
  level,
  doors,
  selectedDoorIndex,
  hostRevealedDoorIndices,
  onSelectDoor,
  monster,
  shakeEffect,
  crtEnabled,
  physicsState,
  debrisParticles,
  activeEvent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredDoorIndex, setHoveredDoorIndex] = useState<number | null>(null);
  const oldManXRef = useRef<number>(90);

  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 450;
    canvas.width = W;
    canvas.height = H;

    const render = () => {
      tick++;
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      if (shakeEffect) {
        const shakeX = (Math.random() - 0.5) * 14;
        const shakeY = (Math.random() - 0.5) * 14;
        ctx.translate(shakeX, shakeY);
      }

      // LEVEL-SPECIFIC ENVIRONMENT & BACKGROUND RENDER
      switch (level) {
        case 1: {
          // LEVEL 1: THE AIRLOCK (Dark Blue Orbital Station + Stars)
          ctx.fillStyle = '#080c1b';
          ctx.fillRect(0, 0, W, H);

          // Starfield
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 30; i++) {
            const sx = (i * 37 + tick * 0.2) % W;
            const sy = (i * 23) % H;
            ctx.fillRect(sx, sy, (i % 2) + 1, (i % 2) + 1);
          }

          // Wall & Floor
          const wallH = 260;
          ctx.fillStyle = '#181e36';
          ctx.fillRect(0, 0, W, wallH);
          ctx.fillStyle = '#101426';
          ctx.fillRect(0, wallH, W, H - wallH);

          // Grid Lines
          ctx.strokeStyle = '#222b4c';
          ctx.lineWidth = 1.5;
          for (let x = 0; x < W; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, wallH);
            ctx.stroke();
          }
          break;
        }
        case 2: {
          // LEVEL 2: THE CENTRIFUGE (Rotating Industrial Chamber)
          ctx.fillStyle = '#120a06';
          ctx.fillRect(0, 0, W, H);

          // Rotating Background Pattern
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.rotate(physicsState.angle);

          ctx.strokeStyle = '#2d180d';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 180, 0, Math.PI * 2);
          ctx.stroke();

          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * 200, Math.sin(a) * 200);
            ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 3: {
          // LEVEL 3: THE DEBRIS FIELD (Hull Breach & Shrapnel)
          ctx.fillStyle = '#0a060d';
          ctx.fillRect(0, 0, W, H);

          // Hull Breach Suction Vortex (Top Right)
          const breachX = 700;
          const breachY = 80;
          const vortexGlow = ctx.createRadialGradient(breachX, breachY, 10, breachX, breachY, 120);
          vortexGlow.addColorStop(0, 'rgba(235, 94, 40, 0.6)');
          vortexGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = vortexGlow;
          ctx.beginPath();
          ctx.arc(breachX, breachY, 120, 0, Math.PI * 2);
          ctx.fill();

          // Render Shrapnel Particles
          debrisParticles.forEach((p) => {
            ctx.fillStyle = '#8d99ae';
            ctx.fillRect(p.x, p.y, p.size, p.size);
          });
          break;
        }
        case 4: {
          // LEVEL 4: THE EVENT HORIZON (Black Hole Singularity)
          ctx.fillStyle = '#030308';
          ctx.fillRect(0, 0, W, H);

          const bhX = 400;
          const bhY = 200;

          // Accretion Disk Glow
          const accGrad = ctx.createRadialGradient(bhX, bhY, 20, bhX, bhY, 130);
          accGrad.addColorStop(0, '#ffffff');
          accGrad.addColorStop(0.3, '#ffaa00');
          accGrad.addColorStop(0.7, '#ff0055');
          accGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = accGrad;
          ctx.beginPath();
          ctx.arc(bhX, bhY, 130, 0, Math.PI * 2);
          ctx.fill();

          // Black Hole Event Horizon Sphere
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(bhX, bhY, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }
        case 5: {
          // LEVEL 5: THE QUANTUM CORE (Superposition & Reality Glitch)
          ctx.fillStyle = '#0d021a';
          ctx.fillRect(0, 0, W, H);

          // Overlapping Glitch Geometry
          if (tick % 6 < 3) {
            ctx.fillStyle = 'rgba(114, 9, 183, 0.15)';
            ctx.fillRect(50, 40, W - 100, H - 80);
          }
          if (tick % 10 < 4) {
            ctx.fillStyle = 'rgba(76, 201, 240, 0.1)';
            ctx.fillRect(20, 80, W - 40, H - 160);
          }

          // Quantum Grid Tearing
          ctx.strokeStyle = '#560bad';
          ctx.lineWidth = 1;
          for (let y = 0; y < H; y += 25) {
            const glitchOffset = Math.sin(tick * 0.3 + y) * 10;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W + glitchOffset, y);
            ctx.stroke();
          }
          break;
        }
      }

      // DOORS RENDER (Dynamic Positioning for 3 vs 4 Doors & Rotation)
      const doorCount = doors.length;
      const doorWidth = 90;
      const doorHeight = 150;
      const doorY = 90;

      // X coordinates spread based on 3, 4, or 5 doors
      const doorXCoords =
        doorCount === 3
          ? [130, 355, 580]
          : doorCount === 4
          ? [70, 245, 420, 595]
          : [50, 190, 330, 470, 610];

      doors.forEach((door, index) => {
        let dx = doorXCoords[index] || 100;
        let dy = doorY;

        // Centrifuge Rotation offset for Level 2
        if (level === 2) {
          const rotAngle = physicsState.angle + (index * Math.PI * 2) / doorCount;
          dx = W / 2 + Math.cos(rotAngle) * 210 - doorWidth / 2;
          dy = H / 2 + Math.sin(rotAngle) * 120 - doorHeight / 2;
        }

        const isHovered = hoveredDoorIndex === index && phase === 'DOOR_SELECTION';
        const isSelected = selectedDoorIndex === index;
        const isHostRevealed =
          hostRevealedDoorIndices.includes(index) || door.isRevealedByHost;
        const isOpen = door.isOpen || isHostRevealed;

        // Door Frame
        ctx.fillStyle = '#22283a';
        ctx.fillRect(dx - 6, dy - 6, doorWidth + 12, doorHeight + 6);

        // Door Interior Void
        ctx.fillStyle = '#050609';
        ctx.fillRect(dx, dy, doorWidth, doorHeight);

        if (isOpen) {
          if (door.containsTreasure) {
            // 💎 RELIC / TREASURE CHEST
            const cx = dx + doorWidth / 2;
            const cy = dy + doorHeight / 2 + 10;

            // Relic Glow
            const rGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
            rGlow.addColorStop(0, '#ffd700');
            rGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, 35, 0, Math.PI * 2);
            ctx.fill();

            // Diamond Relic
            ctx.fillStyle = '#40e0d0';
            ctx.beginPath();
            ctx.moveTo(cx, cy - 20);
            ctx.lineTo(cx + 15, cy);
            ctx.lineTo(cx, cy + 20);
            ctx.lineTo(cx - 15, cy);
            ctx.closePath();
            ctx.fill();
          } else {
            // 👹 MONSTER SILHOUETTE
            const mx = dx + doorWidth / 2;
            const my = dy + doorHeight / 2;
            ctx.fillStyle = '#ef233c';
            ctx.beginPath();
            ctx.arc(mx - 10, my - 10, 4, 0, Math.PI * 2);
            ctx.arc(mx + 10, my - 10, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1d3557';
            ctx.fillRect(mx - 20, my - 5, 40, 40);
          }
        } else {
          // CLOSED DOOR
          ctx.fillStyle = '#4a3120';
          ctx.fillRect(dx, dy, doorWidth, doorHeight);
          ctx.fillStyle = '#2b1b10';
          ctx.fillRect(dx + doorWidth / 2 - 2, dy, 4, doorHeight);

          // Door Label Badge
          ctx.fillStyle = '#101426';
          ctx.fillRect(dx + doorWidth / 2 - 16, dy + 10, 32, 22);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(dx + doorWidth / 2 - 16, dy + 10, 32, 22);

          ctx.font = 'bold 14px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(door.label, dx + doorWidth / 2, dy + 27);

          // Dynamic Probability % Badge Tag on Door
          if (door.probabilityPct > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(dx + 5, dy + doorHeight - 26, doorWidth - 10, 18);
            ctx.font = '9px monospace';
            ctx.fillStyle = door.isAvailableForSwitch ? '#40e0d0' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`${door.probabilityPct}%`, dx + doorWidth / 2, dy + doorHeight - 13);
          }
        }

        // Selection Highlight
        if (isHovered || isSelected || isHostRevealed) {
          const color = isHostRevealed ? '#ff4444' : isSelected ? '#40e0d0' : '#ffd700';
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(dx - 3, dy - 3, doorWidth + 6, doorHeight + 6);
        }
      });

      // OLD MAN (HOST SPRITE)
      let targetManX = 90;
      if (hostRevealedDoorIndices.length > 0 && doorXCoords[hostRevealedDoorIndices[0]]) {
        targetManX = doorXCoords[hostRevealedDoorIndices[0]] - 35;
      }
      oldManXRef.current += (targetManX - oldManXRef.current) * 0.08;
      const omX = oldManXRef.current;
      const omY = 240;

      // Draw Host Sprite
      ctx.fillStyle = '#2d5a3f';
      ctx.fillRect(omX, omY, 26, 40);
      ctx.fillStyle = '#ffdbac';
      ctx.fillRect(omX + 5, omY - 14, 16, 14);
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(omX + 3, omY, 20, 18);

      // PLAYER AVATAR & PHYSICS TRAVERSAL
      const px = physicsState.x;
      const py = physicsState.y;

      ctx.fillStyle = physicsState.isMagnetAnchored ? '#3a86ff' : '#00f5d4';
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();

      // DYNAMIC ANOMALY EVENT VISUAL OVERLAYS
      if (activeEvent) {
        if (activeEvent.type === 'ZERO_G_FLOOD') {
          // Semi-transparent cyan liquid overlay + bubbles
          ctx.fillStyle = 'rgba(0, 180, 216, 0.25)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          for (let b = 0; b < 12; b++) {
            const bx = (b * 67 + tick * 1.5) % W;
            const by = (H - (tick * 2 + b * 40) % H);
            ctx.beginPath();
            ctx.arc(bx, by, 3 + (b % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (activeEvent.type === 'BLACKOUT') {
          // Radial Flashlight Cone centered on Player (px, py)
          const flashGrad = ctx.createRadialGradient(px, py, 30, px, py, 180);
          flashGrad.addColorStop(0, 'rgba(0,0,0,0)');
          flashGrad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
          flashGrad.addColorStop(1, 'rgba(0,0,0,0.98)');
          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, W, H);
        } else if (activeEvent.type === 'TIME_FRACTURE') {
          // Monochrome desaturation tint + chronos lines
          ctx.fillStyle = 'rgba(100, 100, 100, 0.35)';
          ctx.fillRect(0, 0, W, H);
        } else if (activeEvent.type === 'IMPOSSIBLE_ROOM') {
          // Ghostly Duplicate Avatar at canvas center (400, 225)
          ctx.fillStyle = 'rgba(255, 0, 128, 0.45)';
          ctx.beginPath();
          ctx.arc(400, 225, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const loop = () => {
      render();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [doors, phase, level, selectedDoorIndex, hostRevealedDoorIndices, hoveredDoorIndex, monster, shakeEffect, physicsState, debrisParticles, activeEvent]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== 'DOOR_SELECTION') {
      setHoveredDoorIndex(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 450 / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const doorCount = doors.length;
    const doorWidth = 90;
    const doorHeight = 150;
    const doorY = 90;
    const doorXCoords = doorCount === 3 ? [130, 355, 580] : [70, 245, 420, 595];

    let found: number | null = null;
    doorXCoords.forEach((dx, idx) => {
      if (mouseX >= dx && mouseX <= dx + doorWidth && mouseY >= doorY && mouseY <= doorY + doorHeight) {
        found = idx;
      }
    });

    setHoveredDoorIndex(found);
  };

  const handleClick = () => {
    if (phase === 'DOOR_SELECTION' && hoveredDoorIndex !== null) {
      onSelectDoor(hoveredDoorIndex);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${crtEnabled ? 'crt-effect' : ''}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredDoorIndex(null)}
        onClick={handleClick}
        className="w-full h-auto block rounded-t-lg cursor-pointer bg-slate-950 border-2 border-amber-600/40 shadow-2xl"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
};
