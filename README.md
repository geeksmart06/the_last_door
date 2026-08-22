# 🚪 The Last Door — Roguelike Anomaly Survival Game

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-green?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber)](#license)

> **THE DEEPER YOU GO, THE LESS YOU CAN TRUST THE RULES.**

**"The Last Door"** is a psychological roguelike survival game where players descend through 5 increasingly unstable anomaly levels while relying on a mysterious host named **Monty** whose information becomes progressively less trustworthy.

---

## 🎮 Game Overview

You wake up inside an abandoned spacecraft control terminal. 

* **The Anomaly**: The environment distorts reality with 8 dynamic anomaly events (*Zero-G Flood*, *Time Fracture*, *Gravity Failure*, *Blackout*, *False Signals*, *The Room is Lying*, *Unknown Door*, and *The Impossible Room*).
* **Monty (The Host)**: Communicates through CRT monitors, intercoms, and radio. His trust level decays as you descend (Level 1: $100\% \rightarrow$ Level 5: $35\%$).
* **Tactical Nodes (`[ EXTRACT ]` vs `[ DESCEND ]`)**: Cash out secured relics, scrap, and score, or descend deeper into reality deterioration for higher rewards.

---

## ✨ Features

* **🖥️ Cinematic Terminal Boot Sequence**: Retro 8-bit spacecraft terminal boot with skippable diagnostic sequence and interactive menu.
* **🌌 5 Progressive Anomaly Levels**: Distinct physics traversal models including Zero-G thrusters, Centrifuge rotation, debris collision, Event Horizon black hole pull, and Gravity Polarity Inversion.
* **🧠 Seeded Procedural Runs & Cursed Mode**: Deterministic seed generator (`mulberry32`) with optional Cursed Mode (2x score and rewards for 2x anomaly instability).
* **💬 Clean Subtitle Architecture & Evolving Dialogue**: 100% UTF-8 validated readable text system with contextual dialogue selection tracking player decision profiles across runs.
* **🛠️ Void Station Meta-Progression**: Purchase permanent suit, thruster, and mind upgrades, unlock 7 collectible Relics in the Archive, and track local leaderboards.
* **🛠️ Developer Debug Panel (`Ctrl+Shift+D`)**: In-game debug overlay to test events, spawn relics, toggle gravity, and inspect telemetry.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **Graphics**: HTML5 2D Canvas
* **Styling**: Tailwind CSS
* **Audio**: Web Audio API (procedural synthesis)
* **Testing**: Vitest (19 automated unit tests)
* **Storage**: LocalStorage API

---

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/geeksmart06/Monty_Hall_Game.git
   cd Monty_Hall_Game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173/`

---

## 🧪 Running Tests & Build

```bash
# Run automated test suite
npm test

# Production build
npm run build
```

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
