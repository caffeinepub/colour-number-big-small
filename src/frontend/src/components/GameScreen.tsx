import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ==========================================
// TYPES
// ==========================================
export type GamePhase = "start" | "playing" | "gameover";

interface Round {
  number: number;
  color: string;
  colorLabel: string; // the "misleading" description
}

interface GameScreenProps {
  onPhaseChange: (phase: GamePhase) => void;
  phase: GamePhase;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  round: number;
  setRound: React.Dispatch<React.SetStateAction<number>>;
}

// ==========================================
// COLOR CONFIG — Designed to mislead
// Colors that feel "big" used on small numbers and vice versa
// ==========================================
const MISLEADING_COLORS = [
  // Colors that feel "big" / aggressive — used to mislead on small numbers
  "#FF2D2D", // hot red (feels big, aggressive)
  "#FF6B00", // neon orange (feels loud, big)
  "#FF3399", // magenta (feels bold, big)
  "#CC00FF", // electric purple (feels powerful)
  // Colors that feel "small" / quiet — used to mislead on big numbers
  "#7EC8E3", // soft sky blue (feels small, calm)
  "#A8D8A8", // muted mint (feels gentle, small)
  "#B8B8D1", // muted lavender (feels small, passive)
  "#99CCBB", // dusty teal (feels understated)
  // Neutral/tricky colors
  "#FFD700", // gold (ambiguous)
  "#00E5FF", // electric cyan (could go either way)
  "#ADFF2F", // chartreuse (ambiguous)
  "#FF69B4", // hot pink (ambiguous)
];

function generateRound(): Round {
  const number = Math.floor(Math.random() * 100) + 1;
  const isBig = number > 50;

  // Misleading: pick a color that contradicts the number's size
  // 70% chance of misleading color, 30% chance of neutral
  const isMisleading = Math.random() < 0.7;
  let colorIndex: number;

  if (isMisleading) {
    if (isBig) {
      // Big number gets "small-feeling" colors (indices 4-7)
      colorIndex = 4 + Math.floor(Math.random() * 4);
    } else {
      // Small number gets "big-feeling" colors (indices 0-3)
      colorIndex = Math.floor(Math.random() * 4);
    }
  } else {
    // Neutral color (indices 8-11)
    colorIndex = 8 + Math.floor(Math.random() * 4);
  }

  return {
    number,
    color: MISLEADING_COLORS[colorIndex],
    colorLabel: "",
  };
}

function getRoundDuration(roundNum: number): number {
  // Starts at 3000ms, decreases by 150ms per round, min 800ms
  return Math.max(800, 3000 - (roundNum - 1) * 150);
}

// ==========================================
// COMPONENT
// ==========================================
export default function GameScreen({
  onPhaseChange,
  phase,
  score,
  setScore,
  round,
  setRound,
}: GameScreenProps) {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [timerProgress, setTimerProgress] = useState(100);
  const [flashState, setFlashState] = useState<"none" | "correct" | "wrong">(
    "none",
  );
  const [scoreBump, setScoreBump] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundDurationRef = useRef(3000);
  const startTimeRef = useRef<number>(0);
  const animKeyRef = useRef(0);
  const [shakeTimer, setShakeTimer] = useState(false);
  const prevUrgentRef = useRef(false);
  const springProgress = useSpring(timerProgress, {
    stiffness: 80,
    damping: 20,
  });
  const timerHeight = useTransform(springProgress, [100, 30, 0], [12, 18, 22]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRound = useCallback(
    (roundNum: number) => {
      clearTimer();
      const newRound = generateRound();
      animKeyRef.current += 1;
      setCurrentRound(newRound);
      setTimerProgress(100);
      setAnswerLocked(false);
      setFlashState("none");

      const duration = getRoundDuration(roundNum);
      roundDurationRef.current = duration;
      startTimeRef.current = performance.now();

      timerRef.current = setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current;
        const remaining = Math.max(0, 1 - elapsed / duration);
        setTimerProgress(remaining * 100);

        if (remaining <= 0) {
          clearTimer();
          // Time's up = wrong
          setAnswerLocked(true);
          setFlashState("wrong");
          setTimeout(() => {
            onPhaseChange("gameover");
          }, 600);
        }
      }, 16);
    },
    [clearTimer, onPhaseChange],
  );

  useEffect(() => {
    if (phase === "playing") {
      startRound(round);
    }
    return () => {
      clearTimer();
    };
  }, [phase, round, startRound, clearTimer]);

  const handleAnswer = useCallback(
    (answer: "big" | "small") => {
      if (!currentRound || answerLocked) return;
      clearTimer();
      setAnswerLocked(true);

      const isBig = currentRound.number > 50;
      const isCorrect =
        (answer === "big" && isBig) || (answer === "small" && !isBig);

      if (isCorrect) {
        setFlashState("correct");
        setScore((prev) => prev + 1);
        setScoreBump(true);
        setTimeout(() => setScoreBump(false), 400);
        setTimeout(() => {
          setRound((prev) => prev + 1);
          startRound(round + 1);
        }, 400);
      } else {
        setFlashState("wrong");
        setTimeout(() => {
          onPhaseChange("gameover");
        }, 600);
      }
    },
    [
      currentRound,
      answerLocked,
      clearTimer,
      setScore,
      setRound,
      round,
      startRound,
      onPhaseChange,
    ],
  );

  const isTimerUrgent = timerProgress < 30;
  const isCritical = timerProgress < 15;

  // Trigger shake when entering urgent zone
  useEffect(() => {
    if (isTimerUrgent && !prevUrgentRef.current) {
      setShakeTimer(true);
      prevUrgentRef.current = true;
      setTimeout(() => setShakeTimer(false), 300);
    } else if (!isTimerUrgent) {
      prevUrgentRef.current = false;
    }
  }, [isTimerUrgent]);

  return (
    <div
      className={`relative flex flex-col items-center justify-between min-h-screen px-4 py-6 transition-colors duration-300 ${
        flashState === "correct"
          ? "flash-correct"
          : flashState === "wrong"
            ? "flash-wrong"
            : ""
      }`}
    >
      {/* Top bar: Round & Score */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
            Round
          </span>
          <span className="font-display text-2xl font-bold text-foreground leading-none">
            {round}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
            Score
          </span>
          <motion.span
            key={score}
            animate={scoreBump ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="font-display text-3xl font-black leading-none"
            style={{ color: "oklch(0.88 0.25 130)" }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      {/* Timer bar — segmented, growing urgency */}
      <div
        className={`w-full max-w-md mt-4 ${shakeTimer ? "timer-shake" : ""}`}
      >
        {/* Segmented progress track */}
        <div className="flex gap-1" aria-label="Time remaining">
          {Array.from({ length: 20 }, (_, i) => `seg-${i}`).map((segId, i) => {
            const segmentThreshold = 100 - (i + 1) * 5;
            const isActive = timerProgress > segmentThreshold;
            const segmentColor =
              i < 12
                ? "oklch(0.88 0.25 130)" // green zone
                : i < 16
                  ? "oklch(0.82 0.22 75)" // yellow zone
                  : "oklch(0.65 0.25 20)"; // red zone
            return (
              <motion.div
                key={segId}
                style={{
                  height: isTimerUrgent ? timerHeight : 12,
                  backgroundColor: isActive
                    ? segmentColor
                    : "oklch(0.18 0.04 285)",
                  boxShadow:
                    isActive && (i >= 16 || (isCritical && i >= 12))
                      ? `0 0 8px ${segmentColor}`
                      : isActive && i < 12
                        ? `0 0 4px ${segmentColor}66`
                        : "none",
                }}
                animate={{
                  opacity: isActive && isCritical && i >= 16 ? [1, 0.4, 1] : 1,
                }}
                transition={{
                  opacity: {
                    duration: 0.35,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
                className="flex-1 rounded-sm transition-colors duration-150"
              />
            );
          })}
        </div>
      </div>

      {/* Number display — the core challenge */}
      <div className="flex-1 flex items-center justify-center my-8 w-full">
        <AnimatePresence mode="wait">
          {currentRound && (
            <motion.div
              key={animKeyRef.current}
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="relative select-none"
            >
              {/* Glow behind the number */}
              <div
                className="absolute inset-0 blur-3xl opacity-40 rounded-full scale-75"
                style={{ backgroundColor: currentRound.color }}
              />
              <span
                className="relative font-display font-black leading-none"
                style={{
                  color: currentRound.color,
                  fontSize: "clamp(6rem, 20vw, 10rem)",
                  textShadow: `0 0 30px ${currentRound.color}88, 0 0 60px ${currentRound.color}44`,
                  letterSpacing: "-0.02em",
                }}
              >
                {currentRound.number}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Answer buttons */}
      <div className="w-full max-w-md grid grid-cols-2 gap-5 pb-4">
        {/* BIG button — red-orange, 3D press */}
        <motion.button
          data-ocid="game.big_button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96, y: 5 }}
          onClick={() => handleAnswer("big")}
          disabled={answerLocked}
          className="btn-big relative overflow-hidden h-28 rounded-2xl font-display font-black text-5xl uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.72 0.26 22) 0%, oklch(0.58 0.24 20) 100%)",
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          {/* Top highlight bevel */}
          <div
            className="absolute inset-x-0 top-0 h-1/3 opacity-30 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(to bottom, oklch(1 0 0 / 0.3), transparent)",
            }}
          />
          {/* Bottom dark bevel */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl"
            style={{
              background:
                "linear-gradient(to top, oklch(0 0 0 / 0.35), transparent)",
            }}
          />
          <span className="relative z-10 drop-shadow-sm">BIG</span>
          {/* Subtle hotspot glow */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-1/2 h-4 blur-xl opacity-40"
            style={{ backgroundColor: "oklch(0.95 0.15 60)" }}
          />
        </motion.button>

        {/* SMALL button — cyan-blue, 3D press */}
        <motion.button
          data-ocid="game.small_button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96, y: 5 }}
          onClick={() => handleAnswer("small")}
          disabled={answerLocked}
          className="btn-small relative overflow-hidden h-28 rounded-2xl font-display font-black text-5xl uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.72 0.22 220) 0%, oklch(0.58 0.2 225) 100%)",
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          {/* Top highlight bevel */}
          <div
            className="absolute inset-x-0 top-0 h-1/3 opacity-30 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(to bottom, oklch(1 0 0 / 0.3), transparent)",
            }}
          />
          {/* Bottom dark bevel */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl"
            style={{
              background:
                "linear-gradient(to top, oklch(0 0 0 / 0.35), transparent)",
            }}
          />
          <span className="relative z-10 drop-shadow-sm">SMALL</span>
          {/* Subtle hotspot glow */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-1/2 h-4 blur-xl opacity-40"
            style={{ backgroundColor: "oklch(0.95 0.1 200)" }}
          />
        </motion.button>
      </div>

      {/* Rule reminder */}
      <p className="text-muted-foreground text-xs mt-2 text-center">
        Big <span className="text-foreground">&gt; 50</span> · Small{" "}
        <span className="text-foreground">≤ 50</span>
      </p>
    </div>
  );
}
