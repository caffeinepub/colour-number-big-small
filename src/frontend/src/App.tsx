import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import GameOverScreen from "./components/GameOverScreen";
import GameScreen from "./components/GameScreen";
import type { GamePhase } from "./components/GameScreen";
import StartScreen from "./components/StartScreen";

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("start");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const handlePlay = useCallback(() => {
    setScore(0);
    setRound(1);
    setPhase("playing");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setScore(0);
    setRound(1);
    setPhase("playing");
  }, []);

  const handlePhaseChange = useCallback((newPhase: GamePhase) => {
    setPhase(newPhase);
  }, []);

  return (
    <div className="scanlines noise-overlay min-h-screen bg-background">
      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.35 0.12 285 / 0.15), transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        {phase === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <StartScreen onPlay={handlePlay} />
          </motion.div>
        )}

        {phase === "playing" && (
          <motion.div
            key={`playing-${round === 1 ? "fresh" : "cont"}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <GameScreen
              phase={phase}
              onPhaseChange={handlePhaseChange}
              score={score}
              setScore={setScore}
              round={round}
              setRound={setRound}
            />
          </motion.div>
        )}

        {phase === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
            className="relative z-10"
          >
            <GameOverScreen score={score} onPlayAgain={handlePlayAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
