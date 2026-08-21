import React, { useRef, useEffect, useState } from 'react';
import type { DoorState, GamePhase, MonsterState } from '../types/game';

interface GameCanvasProps {
  phase: GamePhase;
  doors: DoorState[];
  selectedDoorIndex: number | null;
  hostRevealedDoorIndex: number | null;
  onSelectDoor: (index: number) => void;
  monster: MonsterState | null;
  shakeEffect: boolean;
  crtEnabled: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  phase,
  doors,
  selectedDoorIndex,
  hostRevealedDoorIndex,
  onSelectDoor,
  monster,
  shakeEffect,
  crtEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredDoorIndex, setHoveredDoorIndex] = useState<number | null>(null);

  // Position of Old Man (X position transitions smoothly during REVEAL phase)
  const oldManXRef = useRef<number>(100);

  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal pixel resolution for crisp 8-bit scaling
    const W = 800;
    const H = 450;
    canvas.width = W;
    canvas.height = H;

    const render = () => {
      tick++;
      ctx.imageSmoothingEnabled = false;

      // Apply screen shake if active
      ctx.save();
      if (shakeEffect) {
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 12;
        ctx.translate(shakeX, shakeY);
      }

      // 1. CLEAR & BACKGROUND (Dark Navy / Black Void)
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(0, 0, W, H);

      // 2. BACK STONE WALL (Isometric 3/4 Perspective)
      const wallHeight = 270;
      const gradient = ctx.createLinearGradient(0, 0, 0, wallHeight);
      gradient.addColorStop(0, '#151928');
      gradient.addColorStop(1, '#242a3f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, wallHeight);

      // Stone brick lines pattern on wall
      ctx.strokeStyle = '#101420';
      ctx.lineWidth = 2;
      for (let y = 0; y < wallHeight; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        const offsetX = (y / 30) % 2 === 0 ? 0 : 25;
        for (let x = offsetX; x < W; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 30);
          ctx.stroke();
        }
      }

      // Decorative wall trim
      ctx.fillStyle = '#1c2236';
      ctx.fillRect(0, wallHeight - 10, W, 10);

      // 3. DUNGEON FLOOR (Cracked Stone Slabs with perspective depth)
      ctx.fillStyle = '#1a1f2c';
      ctx.fillRect(0, wallHeight, W, H - wallHeight);

      // Floor tiles grid & cracks
      ctx.strokeStyle = '#0e111a';
      ctx.lineWidth = 2;
      for (let x = -100; x < W + 100; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, wallHeight);
        ctx.lineTo(x * 1.3 - W * 0.15, H);
        ctx.stroke();
      }
      for (let y = wallHeight; y < H; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Scattered Floor Debris / Cracks
      ctx.fillStyle = '#11141e';
      ctx.fillRect(250, 310, 15, 6);
      ctx.fillRect(520, 360, 20, 8);
      ctx.fillRect(140, 390, 25, 5);
      ctx.fillRect(680, 300, 18, 7);

      // 4. TORCHES & FLICKERING LIGHT GLOW
      const torchXPositions = [200, 400, 600];
      torchXPositions.forEach((tx, idx) => {
        const flicker = Math.sin(tick * 0.15 + idx * 2) * 4 + Math.cos(tick * 0.2 + idx) * 3;
        const glowRadius = 75 + flicker;

        // Radial ambient orange torchlight glow
        const glowGrad = ctx.createRadialGradient(tx, 130, 5, tx, 130, glowRadius);
        glowGrad.addColorStop(0, 'rgba(255, 170, 50, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(220, 110, 20, 0.18)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(tx, 130, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Torch Sconce (Metal Bracket)
        ctx.fillStyle = '#4a5168';
        ctx.fillRect(tx - 4, 135, 8, 20);
        ctx.fillStyle = '#2d3345';
        ctx.fillRect(tx - 6, 133, 12, 5);

        // Torch Flame (Animated 8-Bit Pixel Fire)
        const flameY = 125 + Math.sin(tick * 0.3 + idx) * 2;
        // Outer Orange Flame
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(tx - 6, flameY - 12, 12, 14);
        ctx.fillRect(tx - 4, flameY - 18, 8, 6);
        // Inner Yellow Core
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(tx - 3, flameY - 10, 6, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(tx - 1, flameY - 6, 2, 4);
      });

      // 5. DRAW DOORS (I, II, III)
      const doorWidth = 110;
      const doorHeight = 170;
      const doorY = 90;
      const doorXCoords = [115, 345, 575];

      doors.forEach((door, index) => {
        const dx = doorXCoords[index];
        const isHovered = hoveredDoorIndex === index && phase === 'DOOR_SELECTION';
        const isSelected = selectedDoorIndex === index;
        const isHostRevealed = hostRevealedDoorIndex === index || door.isRevealedByHost;
        const isOpen = door.isOpen || isHostRevealed;

        // Shadow behind door frame
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(dx - 5, doorY - 5, doorWidth + 10, doorHeight + 10);

        // Door Stone Arch Frame
        ctx.fillStyle = '#383e54';
        ctx.fillRect(dx - 10, doorY - 10, doorWidth + 20, doorHeight + 10);
        // Arch top curved accent
        ctx.beginPath();
        ctx.arc(dx + doorWidth / 2, doorY - 5, doorWidth / 2 + 10, Math.PI, 0);
        ctx.fill();

        // Inner Door Void / Interior Room
        ctx.fillStyle = '#05060a';
        ctx.fillRect(dx, doorY, doorWidth, doorHeight);

        // CONTENTS INSIDE OPEN DOOR
        if (isOpen) {
          if (door.containsTreasure) {
            // 💰 GOLD TREASURE CHEST SPRITE
            const chestX = dx + doorWidth / 2 - 25;
            const chestY = doorY + doorHeight - 55;

            // Golden Glow behind chest
            const chestGlow = ctx.createRadialGradient(
              dx + doorWidth / 2,
              chestY + 15,
              5,
              dx + doorWidth / 2,
              chestY + 15,
              45
            );
            chestGlow.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
            chestGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = chestGlow;
            ctx.beginPath();
            ctx.arc(dx + doorWidth / 2, chestY + 15, 45, 0, Math.PI * 2);
            ctx.fill();

            // Chest Base
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(chestX, chestY + 15, 50, 25);
            // Chest Lid (Open)
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(chestX - 2, chestY, 54, 15);
            // Gold Trims & Lock
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(chestX + 2, chestY + 15, 6, 25);
            ctx.fillRect(chestX + 42, chestY + 15, 6, 25);
            ctx.fillRect(chestX + 21, chestY + 18, 8, 10);

            // Sparkling Gold Particles
            for (let p = 0; p < 5; p++) {
              const px = chestX + 5 + Math.sin(tick * 0.1 + p * 1.5) * 20 + 20;
              const py = chestY - 10 + Math.cos(tick * 0.15 + p) * 15;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(px, py, 3, 3);
            }
          } else {
            // 👹 MONSTER SILHOUETTE INSIDE OPEN DOOR
            const monX = dx + doorWidth / 2;
            const monY = doorY + doorHeight / 2 + 10;

            // Ominous Red Eyes Glow
            const eyeFlicker = Math.sin(tick * 0.2) * 3;
            ctx.fillStyle = '#ff2222';
            ctx.beginPath();
            ctx.arc(monX - 12, monY - 15, 4 + eyeFlicker * 0.2, 0, Math.PI * 2);
            ctx.arc(monX + 12, monY - 15, 4 + eyeFlicker * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Monster Body Silhouette (Pixelated Demonic Shape)
            ctx.fillStyle = '#161024';
            ctx.fillRect(monX - 25, monY - 30, 50, 60);
            // Horns
            ctx.fillRect(monX - 28, monY - 45, 8, 18);
            ctx.fillRect(monX + 20, monY - 45, 8, 18);
            // Claws
            ctx.fillStyle = '#e63946';
            ctx.fillRect(monX - 22, monY, 8, 12);
            ctx.fillRect(monX + 14, monY, 8, 12);
          }
        } else {
          // CLOSED WOODEN DOOR (Deep Rich Wood & Metal Straps)
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(dx, doorY, doorWidth, doorHeight);

          // Wood Planks vertical lines
          ctx.fillStyle = '#422815';
          ctx.fillRect(dx + 35, doorY, 3, doorHeight);
          ctx.fillRect(dx + 72, doorY, 3, doorHeight);

          // Iron Reinforcement Straps
          ctx.fillStyle = '#2b2f3a';
          ctx.fillRect(dx, doorY + 25, doorWidth, 12);
          ctx.fillRect(dx, doorY + doorHeight - 35, doorWidth, 12);

          // Iron Rivets on straps
          ctx.fillStyle = '#788199';
          ctx.fillRect(dx + 8, doorY + 29, 4, 4);
          ctx.fillRect(dx + doorWidth - 12, doorY + 29, 4, 4);
          ctx.fillRect(dx + 8, doorY + doorHeight - 31, 4, 4);
          ctx.fillRect(dx + doorWidth - 12, doorY + doorHeight - 31, 4, 4);

          // Door Ring Handle (Iron Ring)
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(dx + 25, doorY + doorHeight / 2 + 10, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#5c3a21';
          ctx.beginPath();
          ctx.arc(dx + 25, doorY + doorHeight / 2 + 10, 4, 0, Math.PI * 2);
          ctx.fill();

          // Roman Numeral Label Badge Above Door (I, II, III)
          ctx.fillStyle = '#1c2236';
          ctx.fillRect(dx + doorWidth / 2 - 20, doorY + 15, 40, 26);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.strokeRect(dx + doorWidth / 2 - 20, doorY + 15, 40, 26);

          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(door.label, dx + doorWidth / 2, doorY + 34);
        }

        // SELECTION / HOVER / REVEAL HIGHLIGHT OUTLINE & BADGES
        if (isHovered || isSelected || isHostRevealed) {
          let outlineColor = '#ffd700'; // Gold default
          let badgeText = '';

          if (isHostRevealed) {
            outlineColor = '#ff4444'; // Red monster reveal
            badgeText = '👹 REVEALED';
          } else if (isSelected) {
            outlineColor = '#40e0d0'; // Turquoise selected
            badgeText = '★ YOUR CHOICE';
          } else if (isHovered) {
            outlineColor = '#ffffff'; // White hover
            badgeText = 'SELECT';
          }

          // Glowing Outline
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = 4;
          const outlinePulse = Math.sin(tick * 0.15) * 2;
          ctx.strokeRect(
            dx - 3 - outlinePulse / 2,
            doorY - 3 - outlinePulse / 2,
            doorWidth + 6 + outlinePulse,
            doorHeight + 6 + outlinePulse
          );

          // Top Floating Indicator Badge
          if (badgeText) {
            ctx.fillStyle = outlineColor;
            ctx.fillRect(dx + doorWidth / 2 - 55, doorY - 35, 110, 20);
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#0a0c16';
            ctx.textAlign = 'center';
            ctx.fillText(badgeText, dx + doorWidth / 2, doorY - 21);
          }
        }
      });

      // 6. OLD MYSTERIOUS MAN SPRITE (Host)
      // Target position based on phase (walks towards host revealed door during REVEAL)
      let targetManX = 90;
      if (hostRevealedDoorIndex !== null && (phase === 'REVEAL' || phase === 'SWITCH_DECISION')) {
        targetManX = doorXCoords[hostRevealedDoorIndex] - 40;
      }
      // Smoothly interpolate Old Man X position
      oldManXRef.current += (targetManX - oldManXRef.current) * 0.08;
      const omX = oldManXRef.current;
      const omY = 230;

      // Old Man Idle Bounce / Animation
      const omBounce = Math.sin(tick * 0.08) * 2;

      // Staff (Wooden staff held in right hand)
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(omX + 32, omY - 30 + omBounce, 4, 85);
      // Crystal Gem on top of staff
      const gemGlow = Math.sin(tick * 0.15) * 3;
      ctx.fillStyle = '#40e0d0';
      ctx.beginPath();
      ctx.arc(omX + 34, omY - 34 + omBounce, 5 + gemGlow * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Tattered Green Cloak Body
      ctx.fillStyle = '#2d5a3f';
      ctx.fillRect(omX, omY + 10 + omBounce, 30, 45);
      ctx.fillStyle = '#1e3e2b';
      ctx.fillRect(omX - 5, omY + 20 + omBounce, 10, 35); // Cloak drape

      // Head / Face
      ctx.fillStyle = '#ffdbac'; // Skin tone
      ctx.fillRect(omX + 6, omY - 12 + omBounce, 18, 18);

      // Long Grey Beard
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(omX + 4, omY + 4 + omBounce, 22, 22);
      ctx.fillRect(omX + 8, omY + 26 + omBounce, 14, 10);

      // Mysterious Hood (Green)
      ctx.fillStyle = '#2d5a3f';
      ctx.fillRect(omX + 4, omY - 20 + omBounce, 22, 10);

      // Eyes (Glowing pixels)
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(omX + 16, omY - 6 + omBounce, 3, 3);

      // Old Man Name Label Tag
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#40e0d0';
      ctx.textAlign = 'center';
      ctx.fillText('THE HOST', omX + 15, omY - 28 + omBounce);

      // 7. COMBAT MONSTER OVERLAY (When in COMBAT phase)
      if (phase === 'COMBAT' && monster) {
        ctx.fillStyle = 'rgba(10, 12, 22, 0.85)';
        ctx.fillRect(0, 0, W, H);

        const mX = W / 2;
        const mY = H / 2 - 20;

        // Monster Aura / Shadow
        const mGlow = ctx.createRadialGradient(mX, mY, 10, mX, mY, 90);
        mGlow.addColorStop(0, 'rgba(230, 57, 70, 0.4)');
        mGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(mX, mY, 90, 0, Math.PI * 2);
        ctx.fill();

        // 8-bit Monster Battle Sprite (Dynamic based on spriteType)
        const idlePulse = Math.sin(tick * 0.1) * 4;
        ctx.fillStyle = '#e63946';
        ctx.fillRect(mX - 45, mY - 60 + idlePulse, 90, 100);

        // Face & Horns
        ctx.fillStyle = '#1d3557';
        ctx.fillRect(mX - 50, mY - 80 + idlePulse, 15, 30);
        ctx.fillRect(mX + 35, mY - 80 + idlePulse, 15, 30);

        // Eyes
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(mX - 25, mY - 35 + idlePulse, 12, 12);
        ctx.fillRect(mX + 13, mY - 35 + idlePulse, 12, 12);

        // Teeth / Fangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mX - 20, mY + 5 + idlePulse, 8, 12);
        ctx.fillRect(mX + 12, mY + 5 + idlePulse, 8, 12);

        // Monster Name Tag
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText(monster.name, mX, mY - 100 + idlePulse);
      }

      ctx.restore(); // Restore context after shake effect
    };

    const loop = () => {
      render();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doors, phase, selectedDoorIndex, hostRevealedDoorIndex, hoveredDoorIndex, monster, shakeEffect]);

  // Mouse Interaction Handlers for Door Selection
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

    const doorWidth = 110;
    const doorHeight = 170;
    const doorY = 90;
    const doorXCoords = [115, 345, 575];

    let foundIndex: number | null = null;
    doorXCoords.forEach((dx, index) => {
      if (
        mouseX >= dx &&
        mouseX <= dx + doorWidth &&
        mouseY >= doorY &&
        mouseY <= doorY + doorHeight
      ) {
        foundIndex = index;
      }
    });

    setHoveredDoorIndex(foundIndex);
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
