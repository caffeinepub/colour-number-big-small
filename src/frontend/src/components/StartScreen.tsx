import { motion } from "motion/react";

interface StartScreenProps {
  onPlay: () => void;
}

const DEMO_NUMBERS = [
  { value: 73, color: "#7EC8E3", label: "73" }, // big number, small-feeling color
  { value: 12, color: "#FF2D2D", label: "12" }, // small number, big-feeling color
  { value: 88, color: "#B8B8D1", label: "88" }, // big, muted
];

const BG_NUMBERS = [7, 42, 91, 18, 64, 33, 77, 5];

export default function StartScreen({ onPlay }: StartScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative numbers */}
      {BG_NUMBERS.map((num, i) => (
        <motion.div
          key={num}
          className="absolute select-none pointer-events-none font-display font-black"
          style={{
            fontSize: `${60 + (i % 3) * 40}px`,
            color: `oklch(0.35 0.06 ${200 + i * 30})`,
            left: `${10 + i * 12}%`,
            top: `${10 + ((i * 17) % 80)}%`,
            transform: `rotate(${-20 + i * 7}deg)`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {num}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xs font-mono uppercase mb-4"
          style={{ color: "oklch(0.88 0.25 130)" }}
        >
          ★ AI Hack ★
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="font-display font-black leading-none mb-2"
          style={{ fontSize: "clamp(2.8rem, 10vw, 4.5rem)" }}
        >
          <span style={{ color: "oklch(0.88 0.25 130)" }}>COLOUR</span>
          <br />
          <span className="text-foreground">NUMBER</span>
          <br />
          <span style={{ color: "oklch(0.65 0.25 20)" }}>BIG</span>
          <span className="text-foreground"> / </span>
          <span style={{ color: "oklch(0.78 0.2 220)" }}>SMALL</span>
        </motion.h1>

        {/* Demo row — show the trick */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 my-6 items-center"
        >
          {DEMO_NUMBERS.map((n, i) => (
            <motion.div
              key={n.value}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center"
            >
              <span
                className="font-display font-black text-4xl leading-none"
                style={{
                  color: n.color,
                  textShadow: `0 0 20px ${n.color}88`,
                }}
              >
                {n.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8 text-left space-y-3 w-full"
        >
          <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-center mb-3">
            How to Play
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span
                className="font-mono text-sm mt-0.5"
                style={{ color: "oklch(0.88 0.25 130)" }}
              >
                01
              </span>
              <p className="text-sm text-foreground">
                A number (1–100) appears in a tricky color.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="font-mono text-sm mt-0.5"
                style={{ color: "oklch(0.88 0.25 130)" }}
              >
                02
              </span>
              <p className="text-sm text-foreground">
                Is it{" "}
                <strong style={{ color: "oklch(0.65 0.25 20)" }}>BIG</strong>{" "}
                (&gt;50) or{" "}
                <strong style={{ color: "oklch(0.78 0.2 220)" }}>SMALL</strong>{" "}
                (≤50)?
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="font-mono text-sm mt-0.5"
                style={{ color: "oklch(0.88 0.25 130)" }}
              >
                03
              </span>
              <p className="text-sm text-foreground">
                Don&apos;t let the color fool you — the AI wants you to fail!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="font-mono text-sm mt-0.5"
                style={{ color: "oklch(0.88 0.25 130)" }}
              >
                04
              </span>
              <p className="text-sm text-foreground">
                The timer gets faster each round. One wrong — game over.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Play button */}
        <motion.button
          data-ocid="start.primary_button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlay}
          className="relative w-full h-16 rounded-2xl font-display font-black text-2xl uppercase tracking-tight overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.88 0.25 130), oklch(0.78 0.22 100))",
            color: "oklch(0.08 0.015 285)",
            boxShadow:
              "0 8px 40px oklch(0.88 0.25 130 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.3)",
          }}
        >
          <span className="relative z-10">▶ PLAY</span>
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.92 0.22 130), oklch(0.85 0.22 100))",
            }}
          />
        </motion.button>
      </motion.div>
    </div>
  );
}
