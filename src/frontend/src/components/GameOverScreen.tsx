import { Input } from "@/components/ui/input";
import { Crown, Loader2, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGetTopScores, useSubmitScore } from "../hooks/useQueries";

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

const RANK_COLORS = [
  "oklch(0.82 0.22 75)", // gold
  "oklch(0.75 0.08 220)", // silver
  "oklch(0.68 0.14 40)", // bronze
];

export default function GameOverScreen({
  score,
  onPlayAgain,
}: GameOverScreenProps) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [displayScore, setDisplayScore] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const burstParticles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: `burst-${i}`,
      angle: (i / 12) * 360,
      dist: 60 + Math.random() * 40,
      color: [
        "oklch(0.88 0.25 130)",
        "oklch(0.82 0.22 75)",
        "oklch(0.78 0.2 220)",
        "oklch(0.65 0.25 20)",
      ][i % 4],
      size: 4 + Math.random() * 6,
    })),
  );

  const {
    data: topScores,
    isLoading: scoresLoading,
    refetch,
  } = useGetTopScores();
  const { mutate: submitScore, isPending: isSubmitting } = useSubmitScore();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Animate score counter from 0 to score
  useEffect(() => {
    const duration = Math.min(1200, score * 80);
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3; // ease-out cubic
      setDisplayScore(Math.round(eased * score));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplayScore(score);
        setBurstActive(true);
        setTimeout(() => setBurstActive(false), 900);
      }
    };
    if (score > 0) {
      frame = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Enter your name to submit!");
      return;
    }
    setSubmitError("");
    submitScore(
      { name: name.trim(), score: BigInt(score) },
      {
        onSuccess: () => {
          setSubmitted(true);
          refetch();
        },
        onError: () => {
          setSubmitError("Couldn't submit. Try again.");
        },
      },
    );
  };

  const isTopScore =
    topScores && topScores.length > 0
      ? Number(topScores[0].score) < score
      : score > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
        className="w-full max-w-sm"
      >
        {/* Game Over header */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {isTopScore ? (
            <>
              <motion.div
                className="flex items-center justify-center gap-2 mb-1"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 280,
                  damping: 15,
                }}
              >
                <Crown
                  className="crown-bounce"
                  style={{
                    color: "oklch(0.82 0.22 75)",
                    width: 36,
                    height: 36,
                  }}
                />
                <h2
                  className="font-display font-black leading-none score-shimmer"
                  style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)" }}
                >
                  NEW BEST!
                </h2>
                <Crown
                  className="crown-bounce"
                  style={{
                    color: "oklch(0.82 0.22 75)",
                    width: 36,
                    height: 36,
                    animationDelay: "0.4s",
                  }}
                />
              </motion.div>
              <p
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "oklch(0.82 0.22 75)" }}
              >
                ★ Top of the leaderboard ★
              </p>
            </>
          ) : (
            <>
              <p
                className="font-mono text-xs uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.65 0.25 20)" }}
              >
                ✕ Game Over
              </p>
              <motion.h2
                className="font-display font-black leading-none text-foreground"
                style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)" }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
              >
                NICE TRY
              </motion.h2>
            </>
          )}
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-visible rounded-3xl p-8 mb-6 text-center"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.20 0.05 285), oklch(0.12 0.02 285))",
            border: "1px solid oklch(0.88 0.25 130 / 0.35)",
            boxShadow: isTopScore
              ? "0 0 80px oklch(0.82 0.22 75 / 0.3), 0 0 40px oklch(0.88 0.25 130 / 0.2)"
              : "0 0 60px oklch(0.88 0.25 130 / 0.15)",
          }}
        >
          {/* Burst particles on score reveal */}
          <AnimatePresence>
            {burstActive &&
              isTopScore &&
              burstParticles.current.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    top: "50%",
                    left: "50%",
                    zIndex: 20,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
                    y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>

          <div
            className="absolute inset-0 opacity-10 rounded-3xl"
            style={{
              background:
                "radial-gradient(circle at center, oklch(0.88 0.25 130), transparent 70%)",
            }}
          />
          <Zap
            className="mx-auto mb-2 relative z-10"
            style={{ color: "oklch(0.88 0.25 130)", width: 28, height: 28 }}
          />
          <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest mb-1 relative z-10">
            Your Score
          </p>
          <motion.p
            className={`font-display font-black relative z-10 ${burstActive && isTopScore ? "score-shimmer" : ""}`}
            style={{
              fontSize: "clamp(4rem, 16vw, 6rem)",
              color:
                burstActive && isTopScore ? undefined : "oklch(0.88 0.25 130)",
              lineHeight: 1,
              textShadow: "0 0 40px oklch(0.88 0.25 130 / 0.6)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            {displayScore}
          </motion.p>
          <p className="text-muted-foreground text-xs mt-2 relative z-10">
            rounds survived
          </p>
        </motion.div>

        {/* Submit form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Submit your score to the leaderboard:
                </p>
                <Input
                  data-ocid="gameover.input"
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="h-12 text-center font-display font-bold text-lg rounded-xl"
                  style={{
                    background: "oklch(0.15 0.02 285)",
                    borderColor: "oklch(0.35 0.05 285)",
                    color: "oklch(0.96 0.008 285)",
                  }}
                />
                {submitError && (
                  <p
                    className="text-sm text-center"
                    style={{ color: "oklch(0.65 0.25 20)" }}
                    data-ocid="gameover.error_state"
                  >
                    {submitError}
                  </p>
                )}
                <motion.button
                  data-ocid="gameover.submit_button"
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-12 rounded-xl font-display font-bold text-base uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.88 0.25 130), oklch(0.78 0.22 100))",
                    color: "oklch(0.08 0.015 285)",
                    boxShadow: "0 4px 24px oklch(0.88 0.25 130 / 0.4)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Score"
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
                data-ocid="gameover.success_state"
              >
                <p
                  className="font-display font-bold text-xl"
                  style={{ color: "oklch(0.82 0.22 145)" }}
                >
                  ✓ Score submitted!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Check the leaderboard below.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Play again button */}
        <motion.button
          data-ocid="gameover.restart_button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.96, y: 4 }}
          whileHover={{ scale: 1.03, y: -3 }}
          onClick={onPlayAgain}
          className="w-full h-16 mb-8 rounded-2xl font-display font-black text-2xl uppercase tracking-tight relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.88 0.25 130) 0%, oklch(0.75 0.22 100) 100%)",
            color: "oklch(0.08 0.015 285)",
            boxShadow:
              "0 8px 0 oklch(0.55 0.22 110), 0 12px 32px oklch(0.88 0.25 130 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.3)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1/3 opacity-25 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(to bottom, oklch(1 0 0 / 0.4), transparent)",
            }}
          />
          <span className="relative z-10">↺ Play Again</span>
        </motion.button>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          data-ocid="leaderboard.list"
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.12 0.02 285)",
            border: "1px solid oklch(0.25 0.03 285)",
          }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4 border-b"
            style={{ borderColor: "oklch(0.25 0.03 285)" }}
          >
            <Trophy
              className="w-4 h-4"
              style={{ color: "oklch(0.82 0.22 75)" }}
            />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Top 10 Leaderboard
            </p>
          </div>

          {scoresLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: "oklch(0.88 0.25 130)" }}
              />
            </div>
          ) : !topScores || topScores.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground text-sm"
              data-ocid="leaderboard.empty_state"
            >
              <p>No scores yet.</p>
              <p className="text-xs mt-1">Be the first!</p>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "oklch(0.2 0.025 285)" }}
            >
              {topScores.slice(0, 10).map((entry, i) => (
                <motion.div
                  key={`${entry.name}-${i}`}
                  data-ocid={`leaderboard.item.${i + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{
                    background:
                      i < 3 ? "oklch(0.14 0.025 285 / 0.8)" : "transparent",
                  }}
                >
                  {/* Rank */}
                  <span
                    className="font-display font-black text-base w-7 text-center flex-shrink-0"
                    style={{
                      color: i < 3 ? RANK_COLORS[i] : "oklch(0.45 0.03 285)",
                    }}
                  >
                    {i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : `${i + 1}`}
                  </span>

                  {/* Name */}
                  <span
                    className="font-body font-medium text-sm flex-1 truncate"
                    style={{
                      color:
                        i < 3
                          ? "oklch(0.96 0.008 285)"
                          : "oklch(0.75 0.025 285)",
                    }}
                  >
                    {entry.name}
                  </span>

                  {/* Score */}
                  <span
                    className="font-display font-black text-sm flex-shrink-0"
                    style={{
                      color: i < 3 ? RANK_COLORS[i] : "oklch(0.55 0.04 285)",
                    }}
                  >
                    {Number(entry.score)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
