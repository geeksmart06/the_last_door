import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GamePhase,
  DoorState,
  PlayerResources,
  MonsterState,
  GameStatistics,
  SettingsConfig,
  LevelNumber,
  PhysicsState,
  AnomalyEvent,
  RunScoreBreakdown,
} from './types/game';
import {
  initializeLevelDoors,
  calculateHostRevealAndProbabilities,
  type ProbabilityCalculation,
} from './game/ProbabilityEngine';
import { PhysicsController, type DebrisParticle } from './game/PhysicsController';
import { LEVEL_CONFIGS, levelManager } from './game/LevelManager';
import { montyController } from './game/MontyController';
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

// Roguelike & Narrative Engines
import { runManager } from './game/RunManager';
import { anomalyEventEngine } from './game/AnomalyEventEngine';
import { montyPersonalityEngine, type RiskRewardOffer } from './game/MontyPersonalityEngine';
import { metaProgressionEngine } from './game/MetaProgressionEngine';
import { dialogueManager } from './game/DialogueManager';

// Components
import { GameCanvas } from './components/GameCanvas';
import { StatsBar } from './components/StatsBar';
import { DialogueBox, type ActionOption } from './components/DialogueBox';
import { RepairStationModal } from './components/RepairStationModal';
import { CombatUI } from './components/CombatUI';
import { StatisticsModal } from './components/StatisticsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { CinematicBootMenu } from './components/CinematicBootMenu';
import { VoidStationModal } from './components/VoidStationModal';
import { ExtractDescendModal } from './components/ExtractDescendModal';
import { DeathSummaryModal } from './components/DeathSummaryModal';
import { DebugPanelModal } from './components/DebugPanelModal';

export const App: React.FC = () => {
  // State Machine (Starts at START_SCREEN with Cinematic Boot Menu)
  const [phase, setPhase] = useState<GamePhase>('START_SCREEN');
  const [currentLevel, setCurrentLevel] = useState<LevelNumber>(1);
  const [isCursedMode, setIsCursedMode] = useState<boolean>(false);

  // Persistent Player Resources
  const [resources, setResources] = useState<PlayerResources>({
    suitIntegrity: 100,
    maxSuitIntegrity: 100,
    oxygen: 100,
    thrusterFuel: 100,
    relics: 0,
    scrap: metaProgressionEngine.persistentScrap,
    def: 20,
    score: 0,
    currentLevel: 1,
    cursedMode: false,
  });

  // Level Round Doors & Selections
  const [doors, setDoors] = useState<DoorState[]>([]);
  const [treasureIndex, setTreasureIndex] = useState<number>(0);
  const [initialPlayerChoice, setInitialPlayerChoice] = useState<number | null>(null);
  const [hostRevealedIndices, setHostRevealedIndices] = useState<number[]>([]);
  const [finalPlayerChoice, setFinalPlayerChoice] = useState<number | null>(null);
  const [_isSwitchSelection, setIsSwitchSelection] = useState<boolean>(false);
  const [isBribeAccepted, setIsBribeAccepted] = useState<boolean>(false);
  const [probCalculation, setProbCalculation] = useState<ProbabilityCalculation | null>(null);

  // Stable Dialogue Text State (Prevents 40ms re-rendering text garble)
  const [dialogueText, setDialogueText] = useState<string>('');

  // Anomaly Event & Risk Deal
  const [activeEvent, setActiveEvent] = useState<AnomalyEvent | null>(null);
  const [_activeRiskOffer, setActiveRiskOffer] = useState<RiskRewardOffer | null>(null);
  const [causeOfDeath, setCauseOfDeath] = useState<string>('SUIT EXHAUSTION');
  const [_lastScoreBreakdown, setLastScoreBreakdown] = useState<RunScoreBreakdown | null>(null);

  // Combat State
  const [monster, setMonster] = useState<MonsterState | null>(null);
  const [combatLog, setCombatLog] = useState<string>('');
  const [shakeEffect, setShakeEffect] = useState<boolean>(false);

  // Physics Controller
  const physicsControllerRef = useRef<PhysicsController>(new PhysicsController());
  const [physicsState, setPhysicsState] = useState<PhysicsState>(
    physicsControllerRef.current.state
  );
  const [debrisParticles, setDebrisParticles] = useState<DebrisParticle[]>([]);

  // Settings & Statistics
  const [stats, setStats] = useState<GameStatistics>(loadStatistics());
  const [settings, setSettings] = useState<SettingsConfig>(loadSettings());

  // Modals
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  const levelConfig = LEVEL_CONFIGS[currentLevel];

  // Sync sound settings to AudioManager
  useEffect(() => {
    audioManager.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // CTRL+SHIFT+D Developer Debug Toggle
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDebugPanel((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, []);

  // Screen shake helper
  const triggerShake = useCallback(() => {
    setShakeEffect(true);
    setTimeout(() => setShakeEffect(false), 400);
  }, []);

  // PHYSICS TICK & OXYGEN DECAY LOOP
  useEffect(() => {
    if (phase === 'START_SCREEN' || phase === 'VOID_HUB' || phase === 'REPAIR_STATION') return;

    const interval = setInterval(() => {
      const pc = physicsControllerRef.current;
      const result = pc.update(currentLevel);

      setPhysicsState({ ...pc.state });
      setDebrisParticles([...pc.debrisParticles]);

      // Environmental hazard events
      if (result.collidedWithWall) {
        audioManager.playHit();
        setResources((prev) => {
          const newHp = Math.max(0, prev.suitIntegrity - 2);
          if (newHp <= 0) {
            setCauseOfDeath('CENTRIFUGE WALL COLLISION IMPACT');
            setPhase('GAME_OVER');
          }
          return { ...prev, suitIntegrity: newHp };
        });
      }

      if (result.pulledToSingularity) {
        audioManager.playHit();
        triggerShake();
        setResources((prev) => {
          const newHp = Math.max(0, prev.suitIntegrity - 8);
          if (newHp <= 0) {
            setCauseOfDeath('EVENT HORIZON SINGULARITY DISINTEGRATION');
            setPhase('GAME_OVER');
          }
          return { ...prev, suitIntegrity: newHp };
        });
      }

      // Oxygen decay (accelerated during ZERO_G_FLOOD event)
      const oxygenLossRate = activeEvent?.type === 'ZERO_G_FLOOD' ? 0.12 : 0.03;
      setResources((prev) => {
        const newOxygen = Math.max(0, prev.oxygen - oxygenLossRate);
        if (newOxygen <= 0 && prev.suitIntegrity > 0) {
          const newHp = Math.max(0, prev.suitIntegrity - 0.2);
          if (newHp <= 0) {
            setCauseOfDeath('ASPHYXIATION — OXYGEN EXHAUSTION');
            setPhase('GAME_OVER');
          }
          return { ...prev, oxygen: 0, suitIntegrity: newHp };
        }
        return { ...prev, oxygen: newOxygen };
      });
    }, 40);

    return () => clearInterval(interval);
  }, [phase, currentLevel, activeEvent, triggerShake]);

  // START ROGUELIKE RUN
  const startNewRun = useCallback((isCursed = false) => {
    runManager.startRun(undefined, isCursed);
    setIsCursedMode(isCursed);

    const upgrades = metaProgressionEngine.upgrades;
    const maxO2 = 100 + upgrades.oxygenCapacityLvl * 15;
    const maxHP = 100 + upgrades.armorLvl * 15;
    const startingScrap = upgrades.repairKitLvl * 10;

    setResources({
      suitIntegrity: maxHP,
      maxSuitIntegrity: maxHP,
      oxygen: maxO2,
      thrusterFuel: 100,
      relics: 0,
      scrap: startingScrap,
      def: 20,
      score: 0,
      currentLevel: 1,
      cursedMode: isCursed,
    });

    startLevel(1, false);
  }, []);

  // START LEVEL
  const startLevel = useCallback(
    (targetLevel: LevelNumber, resetFullResources = false) => {
      const safeLevel = Math.min(5, Math.max(1, targetLevel)) as LevelNumber;
      setCurrentLevel(safeLevel);
      physicsControllerRef.current.reset(safeLevel);
      setPhysicsState({ ...physicsControllerRef.current.state });
      setDebrisParticles([...physicsControllerRef.current.debrisParticles]);

      if (resetFullResources) {
        setResources((prev) => ({
          ...prev,
          suitIntegrity: 100,
          maxSuitIntegrity: 100,
          oxygen: 100,
          thrusterFuel: 100,
          relics: 0,
          scrap: 0,
          def: 20,
          score: 0,
          currentLevel: safeLevel,
        }));
      }

      const cfg = LEVEL_CONFIGS[safeLevel];
      const { doors: initialDoors, treasureIndex: tIdx } = initializeLevelDoors(
        cfg.doorCount
      );

      setDoors(initialDoors);
      setTreasureIndex(tIdx);
      setInitialPlayerChoice(null);
      setHostRevealedIndices([]);
      setFinalPlayerChoice(null);
      setIsSwitchSelection(false);
      setIsBribeAccepted(false);
      setProbCalculation(null);
      setMonster(null);
      setCombatLog('');

      // Roll Anomaly Event
      const rolledEvent = anomalyEventEngine.rollAnomalyForLevel(
        safeLevel,
        () => runManager.nextRandomFloat(),
        isCursedMode
      );
      setActiveEvent(rolledEvent);

      // Roll Monty Risk Offer (Level 2+)
      const offer = montyPersonalityEngine.generateRiskRewardOffer(safeLevel, resources);
      setActiveRiskOffer(offer);

      // Set Stable Dialogue Text ONCE for Door Selection
      const introText = dialogueManager.validateUtf8Text(
        montyPersonalityEngine.getContextualDialogue(safeLevel)
      );
      setDialogueText(introText);

      setPhase('DOOR_SELECTION');
    },
    [isCursedMode, resources]
  );

  // HANDLER: Player selects initial door
  const handleSelectInitialDoor = useCallback(
    (doorIndex: number) => {
      audioManager.playSelect(levelConfig.corruptionPct);
      setInitialPlayerChoice(doorIndex);

      setDoors((prev) =>
        prev.map((d) => ({
          ...d,
          isSelectedByPlayer: d.id === doorIndex,
        }))
      );

      setPhase('REVEAL');
      setDialogueText('The Host steps forward as the anomaly flickers... Analyzing probabilities...');

      // Calculate Host Reveal and dynamic probabilities
      const probResult = calculateHostRevealAndProbabilities({
        level: currentLevel,
        doorCount: levelConfig.doorCount,
        treasureIndex,
        playerChoiceIndex: doorIndex,
        isBribeAccepted: false,
      });

      setProbCalculation(probResult);
      setHostRevealedIndices(probResult.revealedDoorIndices);

      // Timed reveal sequence
      setTimeout(() => {
        audioManager.playDoorOpen();
        audioManager.playMonsterReveal();

        setDoors((prev) =>
          prev.map((d) => {
            const isHostRev = probResult.revealedDoorIndices.includes(d.id);
            const probPct = probResult.remainingDoorProbabilities[d.id] ?? 0;
            return {
              ...d,
              isRevealedByHost: isHostRev,
              isOpen: isHostRev ? true : d.isOpen,
              probabilityPct: probPct,
              isAvailableForSwitch: !isHostRev && d.id !== doorIndex,
              isFalseReveal: probResult.isFalseReveal && isHostRev,
            };
          })
        );

        // Set Stable Host Reveal Dialogue Text
        const revealedLabels = probResult.revealedDoorIndices.map(
          (i) => doors[i]?.label ?? (i === 0 ? 'I' : i === 1 ? 'II' : i === 2 ? 'III' : 'IV')
        );
        const hostRevealText = dialogueManager.validateUtf8Text(
          montyController.getRevealDialogue(
            currentLevel,
            revealedLabels,
            false,
            probResult.isFalseReveal ?? false,
            levelConfig.corruptionPct
          )
        );
        setDialogueText(hostRevealText);

        setPhase('SWITCH_DECISION');
      }, 700);
    },
    [currentLevel, levelConfig, treasureIndex, doors]
  );

  // HANDLER: Bribe Offer (Level 4+)
  const handleAcceptBribe = useCallback(() => {
    if (resources.relics < 1 || initialPlayerChoice === null) return;

    audioManager.playBribeSacrifice();
    setIsBribeAccepted(true);

    setResources((prev) => ({ ...prev, relics: prev.relics - 1 }));

    const probResult = calculateHostRevealAndProbabilities({
      level: currentLevel,
      doorCount: levelConfig.doorCount,
      treasureIndex,
      playerChoiceIndex: initialPlayerChoice,
      isBribeAccepted: true,
    });

    setProbCalculation(probResult);
    setHostRevealedIndices(probResult.revealedDoorIndices);

    setDoors((prev) =>
      prev.map((d) => {
        const isHostRev = probResult.revealedDoorIndices.includes(d.id);
        const probPct = probResult.remainingDoorProbabilities[d.id] ?? 0;
        return {
          ...d,
          isRevealedByHost: isHostRev,
          isOpen: isHostRev ? true : d.isOpen,
          probabilityPct: probPct,
          isAvailableForSwitch: !isHostRev && d.id !== initialPlayerChoice,
        };
      })
    );

    const revealedLabels = probResult.revealedDoorIndices.map((i) => doors[i]?.label ?? '');
    const bribeText = dialogueManager.validateUtf8Text(
      montyController.getRevealDialogue(
        currentLevel,
        revealedLabels,
        true,
        probResult.isFalseReveal ?? false,
        levelConfig.corruptionPct
      )
    );
    setDialogueText(bribeText);
  }, [resources.relics, initialPlayerChoice, currentLevel, levelConfig, treasureIndex, doors]);

  // HANDLER: Player chooses STAY or SWITCH
  const handleMakeSwitchDecision = useCallback(
    (choice: 'STAY' | 'SWITCH') => {
      audioManager.playSelect(levelConfig.corruptionPct);

      const pPick = initialPlayerChoice ?? 0;
      const isSwitching = choice === 'SWITCH';
      setIsSwitchSelection(isSwitching);

      montyPersonalityEngine.recordDecision(choice, isSwitching);

      const availableSwitchDoors = doors
        .filter((d) => !d.isRevealedByHost && d.id !== pPick)
        .map((d) => d.id);

      let chosenDoorIndex = pPick;
      if (isSwitching && availableSwitchDoors.length > 0) {
        chosenDoorIndex = availableSwitchDoors[0];
      }

      setFinalPlayerChoice(chosenDoorIndex);

      setDoors((prev) =>
        prev.map((d) => ({
          ...d,
          isSelectedByPlayer: d.id === chosenDoorIndex,
        }))
      );

      setPhase('DOOR_OPENING');
      setDialogueText('The heavy lock disengages as your chosen door opens...');

      // Animate door opening
      setTimeout(() => {
        audioManager.playDoorOpen();
        setDoors((prev) =>
          prev.map((d) => ({
            ...d,
            isOpen: d.id === chosenDoorIndex ? true : d.isOpen,
          }))
        );

        // Transition to RESULT
        setTimeout(() => {
          setPhase('RESULT');
          const isTreasure = chosenDoorIndex === treasureIndex;

          const updatedStats = updateStatsOnGameEnd(isSwitching, isTreasure);
          setStats(updatedStats);

          const rewards = levelManager.calculateLevelCompleteRewards(
            isTreasure,
            currentLevel,
            isSwitching
          );

          if (isTreasure) {
            audioManager.playTreasureChime();
            runManager.anomaliesSurvived += 1;

            metaProgressionEngine.discoverNewRelic();

            setResources((prev) => ({
              ...prev,
              score: prev.score + 150 * currentLevel,
              relics: prev.relics + rewards.relicsEarned,
              scrap: prev.scrap + rewards.scrapEarned,
            }));

            setPhase('EXTRACT_DECISION');
          } else {
            audioManager.playMonsterReveal();
            triggerShake();
            const newMonster = createMonsterForRound(currentLevel);
            setMonster(newMonster);
            setCombatLog(`A ferocious ${newMonster.name} leaps from behind the door!`);
            setPhase('COMBAT');
          }
        }, 500);
      }, 500);
    },
    [initialPlayerChoice, doors, treasureIndex, levelConfig.corruptionPct, currentLevel, triggerShake]
  );

  // HANDLER: EXTRACT
  const handleExtractRun = useCallback(() => {
    audioManager.playVictory();
    montyPersonalityEngine.recordRunEnd(true);

    const scoreBreakdown = runManager.calculateRunScore({
      relics: resources.relics,
      anomalies: runManager.anomaliesSurvived,
      damageTaken: runManager.damageTakenInRun,
      secrets: runManager.secretsFound,
      montyLies: runManager.montyLiesDetected,
      depth: currentLevel,
      isCursed: isCursedMode,
    });

    setLastScoreBreakdown(scoreBreakdown);

    metaProgressionEngine.addLeaderboardEntry({
      id: `${Date.now()}`,
      seed: runManager.seed,
      score: scoreBreakdown.totalScore,
      rank: scoreBreakdown.rank,
      relics: resources.relics,
      depthReached: currentLevel,
      date: new Date().toISOString().split('T')[0],
      cursed: isCursedMode,
    });

    metaProgressionEngine.persistentScrap += resources.scrap;
    setPhase('VOID_HUB');
  }, [resources, currentLevel, isCursedMode]);

  // HANDLER: DESCEND
  const handleDescendRun = useCallback(() => {
    const nextLvl = levelManager.getNextLevel(currentLevel);
    if (nextLvl) {
      setPhase('REPAIR_STATION');
    } else {
      handleExtractRun();
    }
  }, [currentLevel, handleExtractRun]);

  // COMBAT HANDLERS
  const handleCombatAttack = useCallback(() => {
    if (!monster) return;
    audioManager.playAttack();

    const turn = executePlayerAttack(
      { hp: resources.suitIntegrity, maxHp: resources.maxSuitIntegrity, def: resources.def, round: currentLevel, score: resources.score },
      monster
    );

    setResources((prev) => ({ ...prev, suitIntegrity: turn.playerHpAfter }));
    setMonster((prev) => (prev ? { ...prev, hp: turn.monsterHpAfter } : null));
    setCombatLog(turn.logMessage);

    if (turn.monsterHpAfter > 0 && turn.monsterDamageDealt > 0) {
      audioManager.playHit();
      triggerShake();
    }

    if (turn.monsterHpAfter <= 0) {
      audioManager.playVictory();
      setResources((prev) => ({
        ...prev,
        score: prev.score + 75,
        scrap: prev.scrap + 10,
      }));
      setPhase('EXTRACT_DECISION');
    } else if (turn.playerHpAfter <= 0) {
      audioManager.playGameOver();
      setCauseOfDeath(`DEFEATED BY ${monster.name.toUpperCase()}`);
      setPhase('GAME_OVER');
    }
  }, [monster, resources, currentLevel, triggerShake]);

  const handleCombatDefend = useCallback(() => {
    if (!monster) return;
    audioManager.playDefend();

    const turn = executePlayerDefend(
      { hp: resources.suitIntegrity, maxHp: resources.maxSuitIntegrity, def: resources.def, round: currentLevel, score: resources.score },
      monster
    );

    setResources((prev) => ({ ...prev, suitIntegrity: turn.playerHpAfter }));
    setCombatLog(turn.logMessage);

    if (turn.playerHpAfter <= 0) {
      audioManager.playGameOver();
      setCauseOfDeath(`DEFEATED BY ${monster.name.toUpperCase()}`);
      setPhase('GAME_OVER');
    }
  }, [monster, resources, currentLevel]);

  const handleCombatRun = useCallback(() => {
    if (!monster) return;
    audioManager.playSelect();

    const turn = executePlayerRun(
      { hp: resources.suitIntegrity, maxHp: resources.maxSuitIntegrity, def: resources.def, round: currentLevel, score: resources.score },
      monster
    );
    setCombatLog(turn.logMessage);

    if (turn.escaped) {
      setPhase('EXTRACT_DECISION');
    } else {
      audioManager.playHit();
      triggerShake();
      setResources((prev) => ({ ...prev, suitIntegrity: turn.playerHpAfter }));
      if (turn.playerHpAfter <= 0) {
        audioManager.playGameOver();
        setCauseOfDeath(`STUCK WHILE RETREATING FROM ${monster.name.toUpperCase()}`);
        setPhase('GAME_OVER');
      }
    }
  }, [monster, resources, currentLevel, triggerShake]);

  // KEYBOARD HANDLERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStatsModal || showHowToPlayModal || showSettingsModal) return;

      const key = e.key.toLowerCase();
      const pc = physicsControllerRef.current;

      if (key === 'w' || key === 'arrowup') {
        if (pc.applyThrusterImpulse(0, -1, resources.thrusterFuel)) {
          setResources((prev) => ({ ...prev, thrusterFuel: Math.max(0, prev.thrusterFuel - 0.5) }));
        }
      }
      if (key === 's' || key === 'arrowdown') {
        if (pc.applyThrusterImpulse(0, 1, resources.thrusterFuel)) {
          setResources((prev) => ({ ...prev, thrusterFuel: Math.max(0, prev.thrusterFuel - 0.5) }));
        }
      }
      if (key === 'a' || key === 'arrowleft') {
        if (pc.applyThrusterImpulse(-1, 0, resources.thrusterFuel)) {
          setResources((prev) => ({ ...prev, thrusterFuel: Math.max(0, prev.thrusterFuel - 0.5) }));
        }
      }
      if (key === 'd' || key === 'arrowright') {
        if (pc.applyThrusterImpulse(1, 0, resources.thrusterFuel)) {
          setResources((prev) => ({ ...prev, thrusterFuel: Math.max(0, prev.thrusterFuel - 0.5) }));
        }
      }

      if (key === 'm' && currentLevel >= 3) {
        audioManager.playSelect();
        pc.toggleMagnetBoots();
      }

      if (key === 'g' && currentLevel === 5) {
        audioManager.playGravityFlip();
        pc.toggleGravityFlip();
      }

      if (phase === 'DOOR_SELECTION') {
        if (key === '1') handleSelectInitialDoor(0);
        if (key === '2') handleSelectInitialDoor(1);
        if (key === '3') handleSelectInitialDoor(2);
        if (key === '4' && levelConfig.doorCount === 4) handleSelectInitialDoor(3);
      } else if (phase === 'SWITCH_DECISION') {
        if (key === 'a' || key === '1') handleMakeSwitchDecision('STAY');
        if (key === 'b' || key === '2') handleMakeSwitchDecision('SWITCH');
        if ((key === 'c' || key === '3') && levelConfig.bribeAvailable) handleAcceptBribe();
      } else if (phase === 'COMBAT') {
        if (key === 'a' || key === '1') handleCombatAttack();
        if (key === 'b' || key === '2') handleCombatDefend();
        if (key === 'c' || key === '3') handleCombatRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    phase,
    showStatsModal,
    showHowToPlayModal,
    showSettingsModal,
    resources.thrusterFuel,
    currentLevel,
    levelConfig,
    handleSelectInitialDoor,
    handleMakeSwitchDecision,
    handleAcceptBribe,
    handleCombatAttack,
    handleCombatDefend,
    handleCombatRun,
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

  // DIALOGUE RENDER BUILDER (Consumes STABLE state variable `dialogueText`)
  const renderDialogue = () => {
    switch (phase) {
      case 'DOOR_SELECTION': {
        const options: ActionOption[] = doors.map((d, idx) => ({
          label: `[${idx + 1}] Select Door ${d.label}`,
          key: `${idx + 1}`,
          onClick: () => handleSelectInitialDoor(idx),
        }));

        return <DialogueBox text={dialogueText} options={options} />;
      }
      case 'REVEAL': {
        return <DialogueBox text={dialogueText} />;
      }
      case 'SWITCH_DECISION': {
        const pPick = initialPlayerChoice ?? 0;
        const initialLabel = doors[pPick]?.label ?? 'I';

        const availableSwitchDoorObj = doors.find(
          (d) => !d.isRevealedByHost && d.id !== pPick
        );
        const switchLabel = availableSwitchDoorObj?.label ?? '?';

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

        if (levelConfig.bribeAvailable && !isBribeAccepted && resources.relics >= 1) {
          options.push({
            label: `[C] SACRIFICE 1 RELIC FOR 50/50 (RELICS: ${resources.relics})`,
            key: 'c',
            onClick: handleAcceptBribe,
            variant: 'cyan',
          });
        }

        return (
          <DialogueBox
            text={dialogueText}
            options={options}
            probabilityTip={settings.probabilityMode ? probCalculation?.explanation : null}
          />
        );
      }
      case 'DOOR_OPENING': {
        return <DialogueBox text={dialogueText} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 md:p-6 font-pixel">
      <div className="w-full max-w-4xl bg-slate-900 border-4 border-amber-600/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* TOP HUD STATS BAR */}
        <StatsBar
          resources={resources}
          corruptionPct={levelConfig.corruptionPct}
          onOpenMenu={() => setShowSettingsModal(true)}
        />

        {/* MAIN GAME CONTAINER */}
        <main className="p-3 md:p-5 flex-1 flex flex-col">
          {phase === 'START_SCREEN' ? (
            <CinematicBootMenu
              onDescend={() => startNewRun(isCursedMode)}
              onOpenArchive={() => setPhase('VOID_HUB')}
              onOpenUpgrades={() => setPhase('VOID_HUB')}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          ) : phase === 'VOID_HUB' ? (
            <VoidStationModal
              upgrades={metaProgressionEngine.upgrades}
              relics={metaProgressionEngine.relics}
              leaderboards={metaProgressionEngine.leaderboards}
              scrap={resources.scrap}
              isCursedMode={isCursedMode}
              onToggleCursedMode={(val) => setIsCursedMode(val)}
              onPurchaseUpgrade={(key) => {
                const res = metaProgressionEngine.purchaseUpgrade(key, resources.scrap);
                if (res.success) {
                  setResources((prev) => ({ ...prev, scrap: res.newScrap }));
                }
              }}
              onStartRun={() => startNewRun(isCursedMode)}
            />
          ) : (
            <>
              {/* 2D CANVAS GAME SCENE */}
              <GameCanvas
                phase={phase}
                level={currentLevel}
                doors={doors}
                selectedDoorIndex={
                  phase === 'SWITCH_DECISION' || phase === 'DOOR_OPENING' || phase === 'RESULT' || phase === 'VICTORY' || phase === 'EXTRACT_DECISION'
                    ? finalPlayerChoice
                    : initialPlayerChoice
                }
                hostRevealedDoorIndices={hostRevealedIndices}
                onSelectDoor={handleSelectInitialDoor}
                monster={monster}
                shakeEffect={shakeEffect}
                crtEnabled={settings.crtEnabled}
                physicsState={physicsState}
                debrisParticles={debrisParticles}
                activeEvent={activeEvent}
              />

              {/* COMBAT OR DIALOGUE INTERACTION BOX */}
              <div className="mt-3">
                {phase === 'COMBAT' && monster ? (
                  <CombatUI
                    player={{ hp: resources.suitIntegrity, maxHp: resources.maxSuitIntegrity, def: resources.def, round: currentLevel, score: resources.score }}
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

      {/* EXTRACT VS DESCEND DECISION MODAL */}
      {phase === 'EXTRACT_DECISION' && (
        <ExtractDescendModal
          level={currentLevel}
          resources={resources}
          onExtract={handleExtractRun}
          onDescend={handleDescendRun}
        />
      )}

      {/* DEATH SUMMARY MODAL */}
      {phase === 'GAME_OVER' && (
        <DeathSummaryModal
          scoreBreakdown={runManager.calculateRunScore({
            relics: resources.relics,
            anomalies: runManager.anomaliesSurvived,
            damageTaken: runManager.damageTakenInRun,
            secrets: runManager.secretsFound,
            montyLies: runManager.montyLiesDetected,
            depth: currentLevel,
            isCursed: isCursedMode,
          })}
          level={currentLevel}
          causeOfDeath={causeOfDeath}
          relicsRecovered={resources.relics}
          anomaliesSurvived={runManager.anomaliesSurvived}
          onReturnToStation={() => setPhase('VOID_HUB')}
          onTryAgain={() => startNewRun(isCursedMode)}
        />
      )}

      {/* INTER-LEVEL REPAIR WORKBENCH */}
      {phase === 'REPAIR_STATION' && (
        <RepairStationModal
          resources={resources}
          nextLevel={(Math.min(5, currentLevel + 1)) as LevelNumber}
          onUpdateResources={(updated) => setResources(updated)}
          onProceedToNextLevel={() => {
            const nextLvl = levelManager.getNextLevel(currentLevel);
            if (nextLvl) {
              const updatedRes = levelManager.applyInterLevelDeterioration(resources, nextLvl);
              setResources(updatedRes);
              startLevel(nextLvl, false);
            } else {
              handleExtractRun();
            }
          }}
        />
      )}

      {/* DEVELOPER DEBUG PANEL (CTRL+SHIFT+D) */}
      <DebugPanelModal
        isOpen={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
        onTriggerAnomaly={(type) => {
          const evt = anomalyEventEngine.triggerEvent(type);
          setActiveEvent(evt);
        }}
        onSetSuitIntegrity={(val) => setResources((prev) => ({ ...prev, suitIntegrity: val }))}
        onSetOxygen={(val) => setResources((prev) => ({ ...prev, oxygen: val }))}
        onSetMontyTrust={(val) => {
          montyPersonalityEngine.profile.trustMontyScore = val;
        }}
        onSetCorruption={() => {}}
        onToggleGravity={() => physicsControllerRef.current.toggleGravityFlip()}
        onSpawnRelic={() => setResources((prev) => ({ ...prev, relics: prev.relics + 1 }))}
        onSkipLevel={() => {
          const nextLvl = levelManager.getNextLevel(currentLevel);
          if (nextLvl) startLevel(nextLvl, false);
        }}
        onResetRun={() => startNewRun(isCursedMode)}
        currentLevel={currentLevel}
        corruptionPct={levelConfig.corruptionPct}
      />

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
