# 🚪 The Three Doors — 8-Bit Monty Hall Adventure Game

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-green?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber)](#license)

**"The Three Doors"** is a retro 8-bit RPG browser game combining classic dungeon exploration aesthetics with the famous **Monty Hall probability problem** as its core mechanics.

---

## 🎮 Game Overview

You wake up inside a mysterious mansion. Three ancient doors stand before you labeled **I**, **II**, and **III**. 
* Exactly **ONE** door hides a golden 💰 **Treasure**.
* Exactly **TWO** doors hide dangerous 👹 **Monsters**.

A mysterious **Host** watches silently. After you select your initial door, the Host (who knows what lies behind every door) opens one of the remaining doors to reveal a Monster. He then presents you with a choice:

> **Will you STAY with your original door, or SWITCH to the remaining unopened door?**

---

## ✨ Features

* **🎨 8-Bit Pixel Rendering Engine**: Built with HTML5 2D Canvas featuring an isometric 3/4 perspective stone dungeon, flickering torchlight, animated Host sprite, monster silhouettes, and golden chest animations.
* **📺 Retro CRT Effect**: Includes scanlines, CRT screen glow, vignette, and screen shake on attack hits (toggleable in settings).
* **🧠 Mathematically Correct Monty Hall Logic**: Verified with an automated **10,000-round test suite** ensuring that switching doors yields a ~66.7% win rate, while staying yields a ~33.3% win rate.
* **⚔️ Turn-Based RPG Combat**: If you open a monster door, enter battle mode against levelling dungeon monsters (Skeleton, Goblin, Archon Demon) with `ATTACK`, `DEFEND`, and `RUN` actions.
* **🎵 Procedural 8-Bit Audio**: Powered by Web Audio API synthesizers for door clicks, monster growls, treasure chimes, attack slashes, defend shield pings, and victory fanfares.
* **📊 Persistent Statistics & LocalStorage**: Tracks Total Games, Wins, Losses, Stay/Switch Attempts, and Win Rates %.
* **💡 Educational "Probability Mode"**: Step-by-step mathematical explanations of probability transfer after every round.
* **⌨️ Full Keyboard & Touch Controls**: Play using keyboard numbers `1`, `2`, `3`, `A`, `B`, `C`, `Space`, `Enter`, or click/tap directly on the Canvas and UI buttons.

---

## 📐 The Monty Hall Math

Why does switching double your chances of winning?

1. When you make your initial pick, you have a **1/3 (33.3%)** chance of picking the treasure and a **2/3 (66.7%)** chance of picking a monster.
2. The Host **always** eliminates a monster door from the two doors you didn't pick.
3. Therefore, the **2/3 combined probability** of the unchosen doors shifts entirely onto the single remaining unopened door.

### 🧪 10,000-Round Simulation Results

```text
RUN  v4.1.11 /src/tests/montyHall.test.ts

STAY Strategy: 3,379 / 10,000 wins (33.79%)
SWITCH Strategy: 6,581 / 10,000 wins (65.81%)

✓ 5 tests passed (100%)
```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **Graphics**: HTML5 2D Canvas
* **Styling**: Tailwind CSS
* **Audio**: Web Audio API (procedural synthesis)
* **Testing**: Vitest
* **Storage**: LocalStorage API

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18+) and npm installed.

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

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173/`

---

## 🧪 Running Tests

To run the automated 10,000-round Monty Hall simulation test suite:

```bash
npm test
```

To run a production build test:

```bash
npm run build
```

---

## 📁 Project Structure

```text
src/
├── audio/
│   └── AudioManager.ts       # Procedural Web Audio API sound synthesizer
├── components/
│   ├── CombatUI.tsx          # Turn-based RPG battle overlay
│   ├── DialogueBox.tsx       # Retro gold-bordered dialogue box
│   ├── GameCanvas.tsx        # HTML5 2D pixel renderer (3/4 isometric dungeon)
│   ├── HowToPlayModal.tsx    # Illustrated Monty Hall guide
│   ├── SettingsModal.tsx     # Audio, CRT, and Educational mode toggles
│   ├── StartScreen.tsx       # Cinematic 8-bit title screen
│   ├── StatisticsModal.tsx   # Persistent LocalStorage stats overlay
│   └── StatsBar.tsx          # Top HUD bar (HP, DEF, Round, Score)
├── game/
│   ├── combat.ts             # Turn-based battle mechanics
│   └── montyHall.ts          # Pure Monty Hall probability engine
├── tests/
│   └── montyHall.test.ts     # 10,000-run simulation test suite
├── types/
│   └── game.ts               # Game state and model TypeScript types
├── utils/
│   └── storage.ts            # LocalStorage helper functions
├── App.tsx                   # Main state machine controller
├── main.tsx                  # Application entry point
└── index.css                 # Pixel font styles & CRT scanline overlay
```

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
