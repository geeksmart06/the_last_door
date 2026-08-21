import React, { useState, useEffect, useCallback } from 'react';
import type {
  GamePhase,
  DoorState,
  PlayerStats,
  MonsterState,
  GameStatistics,
  SettingsConfig,
} from './types/game';
import {
  initializeRound,
  selectHostRevealDoor,
  getSwitchDoorIndex,
} from './game/montyHall';
import {
  createMonsterForRound,
  executePlayerAttack,
  executePlayerDefend,
  executePlayerRun,
} from './game/combat';
import {
  loadStatistics,
  updateStatsOnGameEnd,
  resetStatistics,
  loadSettings,
  saveSettings,
} from './utils/storage';
import { audioManager } from './audio/AudioManager';

// Components
import { GameCanvas } from './components/GameCanvas';
import { StatsBar } from './components/StatsBar';
import { DialogueBox, type ActionOption } from './components/DialogueBox';
import { CombatUI } from './components/CombatUI';
import { StatisticsModal } from './components/StatisticsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { StartScreen } from './components/StartScreen';

export const App: React.FC = () => {
  // State Machine
  const [phase, setPhase] = useState<GamePhase>('START_SCREEN');

  // Player Stats
  const [player, setPlayer] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    def: 20,
    round: 1,
    score: 0,
  });

  // Round Doors & Selections
  const [doors, setDoors] = useState<DoorState[]>([]);
  const [treasureIndex, setTreasureIndex] = useState<number>(0);
  const [initialPlayerChoice, setInitialPlayerChoice] = useState<number | null>(null);
  const [hostRevealedIndex, setHostRevealedIndex] = useState<number | null>(null);
  const [finalPlayerChoice, setFinalPlayerChoice] = useState<number | null>(null);
  const [isSwitchSelection, setIsSwitchSelection] = useState<boolean>(false);

  // Combat State
  const [monster, setMonster] = useState<MonsterState | null>(null);
  const [combatLog, setCombatLog] = useState<string>('');
  const [shakeEffect, setShakeEffect] = useState<boolean>(false);

  // Settings & Statistics
  const [stats, setStats] = useState<GameStatistics>(loadStatistics());
  const [settings, setSettings] = useState<SettingsConfig>(loadSettings());

  // Modals
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Sync sound settings to AudioManager
  useEffect(() => {
    audioManager.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Screen shake helper
  const triggerShake = useCallback(() => {
    setShakeEffect(true);
    setTimeout(() => setShakeEffect(false), 400);
  }, []);

  // START NEW ROUND
  const startNewRound = useCallback((resetPlayer = false) => {
    if (resetPlayer) {
      setPlayer({
        hp: 100,
        maxHp: 100,
        def: 20,
        round: 1,
        score: 0,
      });
    }

    const { treasureIndex: tIdx, doors: initialDoors } = initializeRound();
    setDoors(initialDoors);
    setTreasureIndex(tIdx);
    setInitialPlayerChoice(null);
    setHostRevealedIndex(null);
    setFinalPlayerChoice(null);
    setIsSwitchSelection(false);
    setMonster(null);
    setCombatLog('');

    setPhase('INTRO');
  }, []);

  // HANDLER: Player selects initial door (Phase: DOOR_SELECTION)
  const handleSelectInitialDoor = useCallback(
    (doorIndex: number) => {
      audioManager.playSelect();
      setInitialPlayerChoice(doorIndex);

      setDoors((prev) =>
        prev.map((d) => ({
          ...d,
          isSelectedByPlayer: d.id === doorIndex,
        }))
      );

      // Transition to REVEAL phase
      setPhase('REVEAL');

      // Old man selects losing door to reveal
      const revealedIdx = selectHostRevealDoor(treasureIndex, doorIndex);
      setHostRevealedIndex(revealedIdx);

      // Timed reveal sequence animation
      setTimeout(() => {
        audioManager.playDoorOpen();
        audioManager.playMonsterReveal();
        setDoors((prev) =>
          prev.map((d) => ({
            ...d,
            isRevealedByHost: d.id === revealedIdx,
            isOpen: d.id === revealedIdx ? true : d.isOpen,
          }))
        );

        // Highlight remaining switch door
        const switchIdx = getSwitchDoorIndex(doorIndex, revealedIdx);
        setDoors((prev) =>
          prev.map((d) => ({
            ...d,
            isAvailableForSwitch: d.id === switchIdx,
          }))
        );

        // Move to SWITCH_DECISION
        setPhase('SWITCH_DECISION');
      }, 1500);
    },
    [treasureIndex]
  );

  // HANDLER: Player chooses STAY or SWITCH (Phase: SWITCH_DECISION)
  const handleMakeSwitchDecision = useCallback(
    (choice: 'STAY' | 'SWITCH') => {
      audioManager.playSelect();

      if (initialPlayerChoice === null || hostRevealedIndex === null) return;

      const isSwitching = choice === 'SWITCH';
      setIsSwitchSelection(isSwitching);

      const chosenDoorIndex = isSwitching
        ? getSwitchDoorIndex(initialPlayerChoice, hostRevealedIndex)
        : initialPlayerChoice;

      setFinalPlayerChoice(chosenDoorIndex);

      setDoors((prev) =>
        prev.map((d) => ({
          ...d,
          isSelectedByPlayer: d.id === chosenDoorIndex,
        }))
      );

      setPhase('DOOR_OPENING');

      // Animate door opening
      setTimeout(() => {
        audioManager.playDoorOpen();
        setDoors((prev) =>
          prev.map((d) => ({
            ...d,
            isOpen: d.id === chosenDoorIndex ? true : d.isOpen,
          }))
        );

        // Transition to RESULT after door opens
        setTimeout(() => {
          setPhase('RESULT');
          const isTreasure = chosenDoorIndex === treasureIndex;

          // Update LocalStorage stats
          const updatedStats = updateStatsOnGameEnd(isSwitching, isTreasure);
          setStats(updatedStats);

          if (isTreasure) {
            audioManager.playTreasureChime();
            setPlayer((prev) => ({
              ...prev,
              score: prev.score + 100,
              hp: Math.min(prev.maxHp, prev.hp + 15), // Heal +15 on treasure
            }));
            setPhase('VICTORY');
          } else {
            audioManager.playMonsterReveal();
            triggerShake();
            const newMonster = createMonsterForRound(player.round);
            setMonster(newMonster);
            setCombatLog(`A ferocious ${newMonster.name} leaps from behind the door!`);
            setPhase('COMBAT');
          }
        }, 1000);
      }, 1000);
    },
    [initialPlayerChoice, hostRevealedIndex, treasureIndex, player.round, triggerShake]
  );

  // COMBAT HANDLERS
  const handleCombatAttack = useCallback(() => {
    if (!monster) return;
    audioManager.playAttack();

    const turn = executePlayerAttack(player, monster);
    setPlayer((prev) => ({ ...prev, hp: turn.playerHpAfter }));
    setMonster((prev) => (prev ? { ...prev, hp: turn.monsterHpAfter } : null));
    setCombatLog(turn.logMessage);

    if (turn.monsterHpAfter > 0 && turn.monsterDamageDealt > 0) {
      audioManager.playHit();
      triggerShake();
    }

    if (turn.monsterHpAfter <= 0) {
      audioManager.playVictory();
      setPlayer((prev) => ({ ...prev, score: prev.score + 50 }));
      setPhase('VICTORY');
    } else if (turn.playerHpAfter <= 0) {
      audioManager.playGameOver();
      setPhase('GAME_OVER');
    }
  }, [monster, player, triggerShake]);

  const handleCombatDefend = useCallback(() => {
    if (!monster) return;
    audioManager.playDefend();

    const turn = executePlayerDefend(player, monster);
    setPlayer((prev) => ({ ...prev, hp: turn.playerHpAfter }));
    setCombatLog(turn.logMessage);

    if (turn.playerHpAfter <= 0) {
      audioManager.playGameOver();
    }
  }, [monster, player]);

  const handleCombatRun = useCallback(() => {
    if (!monster) return;
    audioManager.playSelect();

    const turn = executePlayerRun(player, monster);
    setCombatLog(turn.logMessage);

    if (turn.escaped) {
      // Escape successful -> advance round
      setPlayer((prev) => ({ ...prev, round: prev.round + 1 }));
      startNewRound(false);
    } else {
      audioManager.playHit();
      triggerShake();
      setPlayer((prev) => ({ ...prev, hp: turn.playerHpAfter }));
      if (turn.playerHpAfter <= 0) {
        audioManager.playGameOver();
      }
    }
  }, [monster, player, triggerShake, startNewRound]);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard if a modal is open
      if (showStatsModal || showHowToPlayModal || showSettingsModal) return;

      const key = e.key.toLowerCase();

      if (phase === 'INTRO') {
        if (key === 'a' || key === ' ' || key === 'enter') setPhase('DOOR_SELECTION');
        if (key === 'b') setPhase('EXAMINE');
      } else if (phase === 'EXAMINE') {
        if (key === 'a' || key === ' ' || key === 'enter') setPhase('DOOR_SELECTION');
      } else if (phase === 'DOOR_SELECTION') {
        if (key === '1') handleSelectInitialDoor(0);
        if (key === '2') handleSelectInitialDoor(1);
        if (key === '3') handleSelectInitialDoor(2);
      } else if (phase === 'SWITCH_DECISION') {
        if (key === 'a' || key === '1') handleMakeSwitchDecision('STAY');
        if (key === 'b' || key === '2') handleMakeSwitchDecision('SWITCH');
      } else if (phase === 'COMBAT') {
        if (key === 'a' || key === '1') handleCombatAttack();
        if (key === 'b' || key === '2') handleCombatDefend();
        if (key === 'c' || key === '3') handleCombatRun();
      } else if (phase === 'VICTORY') {
        if (key === 'a' || key === ' ' || key === 'enter') {
          setPlayer((prev) => ({ ...prev, round: prev.round + 1 }));
          startNewRound(false);
        }
      } else if (phase === 'GAME_OVER') {
        if (key === 'a' || key === ' ' || key === 'enter') {
          startNewRound(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    phase,
    showStatsModal,
    showHowToPlayModal,
    showSettingsModal,
    handleSelectInitialDoor,
    handleMakeSwitchDecision,
    handleCombatAttack,
    handleCombatDefend,
    handleCombatRun,
    startNewRound,
  ]);

  // RESET STATISTICS
  const handleResetStats = () => {
    const fresh = resetStatistics();
    setStats(fresh);
  };

  // UPDATE SETTINGS
  const handleUpdateSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // DIALOGUE RENDER BUILDER
  const renderDialogue = () => {
    switch (phase) {
      case 'INTRO': {
        const options: ActionOption[] = [
          {
            label: '[A] Choose Door',
            key: 'a',
            onClick: () => setPhase('DOOR_SELECTION'),
            variant: 'gold',
          },
          {
            label: '[B] Examine Doors',
            key: 'b',
            onClick: () => setPhase('EXAMINE'),
            variant: 'cyan',
          },
        ];
        return (
          <DialogueBox
            text="You wake up inside a mysterious mansion. Three ancient doors stand before you. One hides treasure, two hide monsters. A mysterious old man watches silently."
            options={options}
          />
        );
      }
      case 'EXAMINE': {
        const options: ActionOption[] = [
          {
            label: '[A] Choose One Door',
            key: 'a',
            onClick: () => setPhase('DOOR_SELECTION'),
            variant: 'gold',
          },
        ];
        return (
          <DialogueBox
            text="You examine the doors closely. They are identical arched oak doors with iron straps, labeled I, II, and III. You hear faint whispers echoing from behind them..."
            options={options}
          />
        );
      }
      case 'DOOR_SELECTION': {
        const options: ActionOption[] = [
          {
            label: '[1] Select Door I',
            key: '1',
            onClick: () => handleSelectInitialDoor(0),
          },
          {
            label: '[2] Select Door II',
            key: '2',
            onClick: () => handleSelectInitialDoor(1),
          },
          {
            label: '[3] Select Door III',
            key: '3',
            onClick: () => handleSelectInitialDoor(2),
          },
        ];
        return (
          <DialogueBox
            text="The Host smiles faintly: 'Choose one door carefully. Your fate lies behind your choice.'"
            options={options}
          />
        );
      }
      case 'REVEAL': {
        return (
          <DialogueBox text="The Host chuckles: 'Interesting choice... Perhaps I should show you what lies behind one of the others.'" />
        );
      }
      case 'SWITCH_DECISION': {
        if (initialPlayerChoice === null || hostRevealedIndex === null) return null;
        const initialLabel = doors[initialPlayerChoice]?.label;
        const switchIdx = getSwitchDoorIndex(initialPlayerChoice, hostRevealedIndex);
        const switchLabel = doors[switchIdx]?.label;

        const options: ActionOption[] = [
          {
            label: `[A] STAY WITH DOOR ${initialLabel}`,
            key: 'a',
            onClick: () => handleMakeSwitchDecision('STAY'),
            variant: 'gold',
          },
          {
            label: `[B] SWITCH TO DOOR ${switchLabel}`,
            key: 'b',
            onClick: () => handleMakeSwitchDecision('SWITCH'),
            variant: 'emerald',
          },
        ];

        const tip = settings.probabilityMode
          ? `You initially had a 1/3 (33%) chance of choosing the treasure. That means the other doors had a 2/3 (67%) chance combined! Now that the Host revealed a monster, that 67% probability shifts entirely to Door ${switchLabel}!`
          : null;

        return (
          <DialogueBox
            text={`The Host steps aside. "Door ${doors[hostRevealedIndex]?.label} held a monster! Now, you have another choice. You may STAY with Door ${initialLabel}, or SWITCH to Door ${switchLabel}."`}
            options={options}
            probabilityTip={tip}
          />
        );
      }
      case 'DOOR_OPENING': {
        return <DialogueBox text="The hinges creak loudly as your chosen door opens..." />;
      }
      case 'VICTORY': {
        const options: ActionOption[] = [
          {
            label: `[A] Advance to Round ${player.round + 1}`,
            key: 'a',
            onClick: () => {
              setPlayer((prev) => ({ ...prev, round: prev.round + 1 }));
              startNewRound(false);
            },
            variant: 'emerald',
          },
        ];
        const statNote = isSwitchSelection
          ? 'You switched doors! Math was on your side (66.7% win probability).'
          : 'You stayed with your original door! You beat the 33.3% odds!';

        return (
          <DialogueBox
            text={`✨ YOU FOUND THE GOLDEN TREASURE! ${statNote} +100 Score!`}
            options={options}
          />
        );
      }
      case 'GAME_OVER': {
        const options: ActionOption[] = [
          {
            label: '[A] Start New Adventure',
            key: 'a',
            onClick: () => startNewRound(true),
            variant: 'red',
          },
        ];
        return (
          <DialogueBox
            text="💀 GAME OVER! You were defeated in the dark mansion. The mysteries of probability remain unsolved..."
            options={options}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 md:p-6 font-pixel">
      <div className="w-full max-w-4xl bg-slate-900 border-4 border-amber-600/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* TOP HUD STATS BAR */}
        <StatsBar player={player} onOpenMenu={() => setShowSettingsModal(true)} />

        {/* MAIN GAME CONTAINER */}
        <main className="p-3 md:p-5 flex-1 flex flex-col">
          {phase === 'START_SCREEN' ? (
            <StartScreen
              onStartGame={() => startNewRound(true)}
              onOpenHowToPlay={() => setShowHowToPlayModal(true)}
              onOpenStats={() => setShowStatsModal(true)}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          ) : (
            <>
              {/* 2D CANVAS GAME SCENE */}
              <GameCanvas
                phase={phase}
                doors={doors}
                selectedDoorIndex={
                  phase === 'SWITCH_DECISION' || phase === 'DOOR_OPENING' || phase === 'RESULT' || phase === 'VICTORY'
                    ? finalPlayerChoice
                    : initialPlayerChoice
                }
                hostRevealedDoorIndex={hostRevealedIndex}
                onSelectDoor={handleSelectInitialDoor}
                monster={monster}
                shakeEffect={shakeEffect}
                crtEnabled={settings.crtEnabled}
              />

              {/* COMBAT OR DIALOGUE INTERACTION BOX */}
              <div className="mt-3">
                {phase === 'COMBAT' && monster ? (
                  <CombatUI
                    player={player}
                    monster={monster}
                    combatLog={combatLog}
                    onAttack={handleCombatAttack}
                    onDefend={handleCombatDefend}
                    onRun={handleCombatRun}
                  />
                ) : (
                  renderDialogue()
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {showStatsModal && (
        <StatisticsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
          onReset={handleResetStats}
        />
      )}

      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default App;
