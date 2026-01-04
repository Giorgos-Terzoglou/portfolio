"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Bot, RotateCcw, CornerUpLeft, History, Sparkles, ExternalLink, Download, Mail} from "lucide-react";
import flow from "@/flowV1.json"; 


type Role = "user" | "bot";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  nodeId?: string;   // for bot messages
  optionId?: string; // for user messages
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}



type Evidence =
  | { type: "image"; label: string; src: string }
  | { type: "video"; label: string; src: string }
  | { type: "link"; label: string; src: string };

type Option = { id: string; label: string; goto: string; utterance?: string };

type Node =
  | {
      id: string;
      type: "question" | "answer";
      section: string;
      bot: string;
      options: Option[];
      evidence: Evidence[];
    };

type Flow = {
  meta: { version: string; botName: string;};
  ui: {
    topicChips: { id: string; label: string; goto: string }[];
    alwaysVisibleControls: string[];
  };
  nodes: Node[];
};

const F = flow as unknown as Flow;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


function CinematicIntro({
  open,
  onClose,
  blinkNow,
}: {
  open: boolean;
  onClose: () => void;
  blinkNow: boolean;
}) {
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  // Phase 1: BOOT (typed log). Phase 2: HERO.
  const [phase, setPhase] = useState<"boot" | "hero">("boot");

  // ---- hover tilt (desktop only, no re-render) ----
  const frameRef = useRef<HTMLDivElement | null>(null);

  const isFinePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
  }, []);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  // smooth it (prevents jitter)
  const rxSpring = useSpring(rx, { stiffness: 220, damping: 22 });
  const rySpring = useSpring(ry, { stiffness: 220, damping: 22 });

  const onFrameMove = (e: React.MouseEvent) => {
    if (!isFinePointer || reduceMotion) return;
    const el = frameRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    // optional: spotlight vars
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);

    const dx = (x - r.width / 2) / (r.width / 2);
    const dy = (y - r.height / 2) / (r.height / 2);

    const max = 6; // degrees
    rx.set(-dy * max);
    ry.set(dx * max);
  };

  const onFrameLeave = () => {
    rx.set(0);
    ry.set(0);
  };


  // Hold-to-start interaction
  const [holding, setHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  const cancelHold = () => {
    setHolding(false);
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  };

  const startHold = () => {
    setHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      setHolding(false);
      onClose();
    }, 750);
  };

  // ---- BOOT timing controls (adjust here) ----
  const bootLines = useMemo(
    () => [
      "BOOT: Terzo v1.0",
      "Calibrating interview graph…",
      "Loading Georgios Terzoglou profile…",
      "System ready. Awaiting prompt.",
    ],
    []
  );

  // speed: ms per character (lower = faster typing)
  const CHAR_MS = 16;

  // pause after each line finishes typing
  const LINE_PAUSE_MS = 350;

  // extra pause AFTER last line before cutting to HERO
  const AFTER_BOOT_PAUSE_MS = 700;

  // Optional: if you want it even longer, bump LINE_PAUSE_MS and AFTER_BOOT_PAUSE_MS
  // -------------------------------------------

  const [bootResetKey, setBootResetKey] = useState(0);

  useEffect(() => {
    if (!open) return;

    setPhase("boot");
    cancelHold();
    // force BootTyper to restart typing from scratch
    setBootResetKey((k) => k + 1);

    if (reduceMotion) {
      setPhase("hero");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] bg-[#040713] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* Esc to close */}
          <EscToClose onClose={onClose} />

          {/* Click outside to close (keep if you like it; remove onClick to disable) */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Letterbox bars */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-0 h-[7vh] md:h-[10vh] bg-black"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute left-0 right-0 bottom-0 h-[8vh] md:h-[12vh] bg-black"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
          />

          {/* Grain + vignette */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay terzo-grain" />
          <div className="pointer-events-none absolute inset-0 terzo-vignette" />

          {/* Ambient glow blobs */}
          {!reduceMotion && (
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <motion.div
                className="absolute left-[10%] top-[15%] h-[380px] w-[380px] rounded-full blur-3xl bg-cyan-500/20"
                animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute right-[12%] top-[22%] h-[420px] w-[420px] rounded-full blur-3xl bg-violet-500/18"
                animate={{ x: [0, -22, 0], y: [0, 16, 0] }}
                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-[35%] bottom-[10%] h-[520px] w-[520px] rounded-full blur-3xl bg-sky-500/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}

          {/* Slow camera push-in */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center px-3 sm:px-6"
            initial={reduceMotion ? { scale: 1 } : { scale: 1.02 }}
            animate={reduceMotion ? { scale: 1 } : { scale: 1 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          >
            <div
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow field */}
              <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(circle_at_70%_20%,rgba(167,139,250,0.16),transparent_55%),radial-gradient(circle_at_60%_80%,rgba(56,189,248,0.10),transparent_60%)] blur-2xl" />

              {/* Frame */}
              <motion.div
                ref={frameRef}
                onMouseMove={onFrameMove}
                onMouseLeave={onFrameLeave}
                style={
                  isFinePointer && !reduceMotion
                    ? {
                        rotateX: rxSpring as any,
                        rotateY: rySpring as any,
                        transformPerspective: 1200,
                        transformStyle: "preserve-3d",
                      }
                    : undefined
                }
                className="relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.8rem] border border-white/10 bg-white/[0.03] shadow-[0_0_140px_rgba(34,211,238,0.10)]
                  h-[calc(100svh-15vh-24px)] md:h-auto
                  overflow-hidden will-change-transform"
                animate={
                  reduceMotion
                    ? {}
                    : phase === "hero"
                    ? { x: [0, -1, 1, -1, 0] }
                    : {}
                }
                transition={{ duration: 0.12 }}
              >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 md:opacity-100"
                style={{
                  background:
                    "radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.14), transparent 60%)",
                }}
              />
                {/* Subtle chroma edge */}
                <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.08),transparent_45%,rgba(167,139,250,0.08))]" />
                </div>

                {/* Scanline sweep */}
                {!reduceMotion && (
                  <motion.div
                    className="pointer-events-none absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-white/18 to-transparent"
                    animate={{ y: ["0%", "160%"] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                )}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 md:opacity-100"
                  style={{
                    background:
                      "radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.16), transparent 60%)",
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* LEFT: CORE */}
                  <div className="relative p-4 sm:p-7 md:p-12">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-50" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-50" />

                    <div className="relative flex items-center justify-center min-h-[clamp(180px,32vh,340px)]">
                      <motion.div
                        initial={
                          reduceMotion
                            ? { scale: 1, opacity: 1 }
                            : { scale: 0.88, opacity: 0 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      >
                        <div className="scale-[1.25] sm:scale-[1.55] md:scale-[2.05] drop-shadow-[0_0_40px_rgba(34,211,238,0.18)]">
                          <RobotAvatar blinkNow={blinkNow} />
                        </div>
                      </motion.div>

                      {!reduceMotion && (
                        <motion.div
                          className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300/85 shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
                          <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-300/85 shadow-[0_0_18px_rgba(167,139,250,0.6)]" />
                          <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-300/75 shadow-[0_0_16px_rgba(56,189,248,0.5)]" />
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        Structured interview
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        Evidence-first
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        No fluff
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: BOOT → HERO */}
                  <div className="relative p-5 sm:p-7 md:p-12 border-t md:border-t-0 md:border-l border-white/10">
                    <AnimatePresence mode="wait">
                      {phase === "boot" ? (
                        <motion.div
                          key={`boot-${bootResetKey}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.35 }}
                        >
                          <div className="text-[11px] tracking-[0.25em] text-white/45">
                            TERZO INTERVIEW PROTOCOL
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4 font-mono text-[11px] sm:text-[12px] text-white/80">
                            <BootTyper
                              key={bootResetKey}
                              lines={bootLines}
                              charMs={reduceMotion ? 0 : CHAR_MS}
                              linePauseMs={reduceMotion ? 0 : LINE_PAUSE_MS}
                              afterAllPauseMs={reduceMotion ? 0 : AFTER_BOOT_PAUSE_MS}
                              onDone={() => setPhase("hero")}
                            />
                          </div>

                          <div className="mt-6 text-xs text-white/45">
                            Press <span className="text-white/70">Esc</span> to skip.
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="hero"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.45 }}
                        >
                          <div className="text-[11px] tracking-[0.25em] text-white/45">
                            TERZO INTERVIEW PROTOCOL
                          </div>

                          <motion.h1
                            className="mt-2 text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            Hello.
                            <span className="block text-white/85">
                              I’m <span className="text-cyan-200">Terzo</span>.
                            </span>
                          </motion.h1>

                          <div className="mt-3 text-sm md:text-base leading-relaxed text-white/75">
                            I’m the interview bot for{" "}
                            <span className="text-white/90 font-semibold">
                              Georgios Terzoglou
                            </span>
                            . Choose a topic chip and I’ll run a tight interview. If an answer can’t
                            be backed up, it doesn’t ship.
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              onMouseDown={startHold}
                              onMouseUp={cancelHold}
                              onMouseLeave={cancelHold}
                              onTouchStart={startHold}
                              onTouchEnd={cancelHold}
                              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm text-white/95 hover:bg-white/15 transition shadow-[0_0_60px_rgba(34,211,238,0.12)]"
                            >
                              <span className="relative z-10">
                                {holding ? "Starting…" : "Hold to start"}
                              </span>

                              {!reduceMotion && (
                                <motion.span
                                  className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.55),rgba(167,139,250,0.55))]"
                                  initial={{ scaleX: 0, transformOrigin: "left" }}
                                  animate={{ scaleX: holding ? 1 : 0 }}
                                  transition={{ duration: 0.75, ease: "linear" }}
                                />
                              )}
                            </button>

                            <button
                              onClick={onClose}
                              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
                            >
                              Skip
                            </button>

                            <div className="text-xs text-white/45 md:ml-auto">
                              Or press <span className="text-white/70">Esc</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Types the boot lines character-by-character with a blinking cursor. */
function BootTyper({
  lines,
  charMs,
  linePauseMs,
  afterAllPauseMs,
  onDone,
}: {
  lines: string[];
  charMs: number;
  linePauseMs: number;
  afterAllPauseMs: number;
  onDone: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    // reduced motion: instantly show and finish
    if (charMs === 0) {
      const t = window.setTimeout(onDone, 300);
      return () => window.clearTimeout(t);
    }

    // still typing current line
    const current = lines[lineIdx] ?? "";
    if (charIdx < current.length) {
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), charMs);
      return () => window.clearTimeout(t);
    }

    // finished current line, move to next after pause
    if (lineIdx < lines.length - 1) {
      const t = window.setTimeout(() => {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, linePauseMs);
      return () => window.clearTimeout(t);
    }

    // finished all lines, pause then done
    const t = window.setTimeout(onDone, afterAllPauseMs);
    return () => window.clearTimeout(t);
  }, [lines, lineIdx, charIdx, charMs, linePauseMs, afterAllPauseMs, onDone]);

  return (
    <div className="space-y-1">
      {lines.map((ln, i) => {
        const isCurrent = i === lineIdx;
        const isPast = i < lineIdx;
        const text = isPast ? ln : isCurrent ? ln.slice(0, charIdx) : "";

        return (
          <div key={ln} className="flex gap-2">
            <span className="text-cyan-200/80">{">"}</span>
            <span className="whitespace-pre-wrap">
              {text}
              {isCurrent && <BlinkCursor />}
            </span>
          </div>
        );
      })}
      <div className="pt-2 text-white/50">
        {lineIdx >= lines.length - 1 && charIdx >= (lines[lines.length - 1]?.length ?? 0)
          ? "Preparing interface…"
          : "\u00A0"}
      </div>
    </div>
  );
}

function BlinkCursor() {
  return (
    <motion.span
      className="inline-block w-[8px] align-baseline text-white/70"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      █
    </motion.span>
  );
}




function EscToClose({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return null;
}

function TypewriterText({
  text,
  active,
  charMs = 14,
  onDone,
}: {
  text: string;
  active: boolean;
  charMs?: number;
  onDone?: () => void;
}) {
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  const normalized = useMemo(() => text.replace(/\r\n/g, "\n"), [text]);
  const [n, setN] = useState(active ? 0 : normalized.length);

  useEffect(() => {
    if (!active || reduceMotion) {
      setN(normalized.length);
      onDone?.();
      return;
    }
    setN(0);
  }, [active, reduceMotion, normalized, onDone]);

  useEffect(() => {
    if (!active || reduceMotion) return;
    if (n >= normalized.length) {
      onDone?.();
      return;
    }
    const t = window.setTimeout(() => setN((x) => x + 1), charMs);
    return () => window.clearTimeout(t);
  }, [active, reduceMotion, n, normalized.length, charMs, onDone]);

  const visible = normalized.slice(0, n);
  const hidden = normalized.slice(n);

  return (
    <span className="relative block whitespace-pre-wrap break-words">
      {/* Visible part */}
      <span>{visible}</span>

      {/* Hidden part that keeps layout identical to final text */}
      <span className="text-transparent select-none" aria-hidden="true">
        {hidden || "\u00A0"}
      </span>

      {/* Cursor: absolute so it never pushes wrapping */}
      {active && !reduceMotion && n < normalized.length ? (
        <span className="pointer-events-none absolute">
          <ChatCursor />
        </span>
      ) : null}
    </span>
  );
}

function ChatCursor() {
  return (
    <motion.span
      className="inline-block align-baseline text-white/70"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
    >
    </motion.span>
  );
}




function RobotAvatar({ blinkNow = false }: { blinkNow?: boolean }) {
  // Inline SVG "robot" with glow, no asset needed
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-full blur-2xl opacity-40 bg-cyan-500/30" />
      <motion.svg
        width="92"
        height="92"
        viewBox="0 0 92 92"
        className="relative drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        initial={{ rotate: -2 }}
        animate={{ rotate: 2 }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.8, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="g2" x1="0" x2="1">
            <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Helmet */}
        <path
          d="M46 10c18 0 32 12 32 28v10c0 3-2 5-5 5H19c-3 0-5-2-5-5V38C14 22 28 10 46 10Z"
          fill="url(#g2)"
          stroke="url(#g1)"
          strokeWidth="2"
        />
        {/* Face */}
        <rect x="20" y="30" width="52" height="38" rx="14" fill="#0b1220" stroke="url(#g1)" strokeWidth="2" />
        {/* Eyes */}
        <motion.circle
          cx="36"
          cy="48"
          r="7"
          fill="#22d3ee"
          animate={blinkNow ? { scaleY: 0.12 } : { scaleY: 1 }}
          transition={blinkNow ? { duration: 0.12 } : { duration: 0.2 }}
          style={{ transformOrigin: "center" }}
        />
        <motion.circle
          cx="56"
          cy="48"
          r="7"
          fill="#22d3ee"
          animate={{ r: [7, 6.5, 7] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }}
        />
        <circle cx="36" cy="48" r="3" fill="#08101d" />
        <circle cx="56" cy="48" r="3" fill="#08101d" />
        {/* Mouth */}
        <path d="M36 60c6 4 14 4 20 0" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        {/* Headphones */}
        <path d="M16 44c0-10 8-18 18-18" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M76 44c0-10-8-18-18-18" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <rect x="10" y="44" width="10" height="18" rx="5" fill="#0b1220" stroke="#22d3ee" strokeWidth="2" />
        <rect x="72" y="44" width="10" height="18" rx="5" fill="#0b1220" stroke="#22d3ee" strokeWidth="2" />
        {/* Mic */}
        <path d="M70 66c-5 6-12 10-20 10" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <circle cx="70" cy="66" r="3" fill="#22d3ee" />
      </motion.svg>
    </div>
  );
}

function EvidenceCard({ ev }: { ev: Evidence }) {
  if (ev.type === "image") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-white/70 mb-2">{ev.label}</div>
        <img
          src={`/${ev.src}`.replace(/^\/+/, "/")}
          alt={ev.label}
          className="w-full rounded-xl border border-white/10"
          loading="lazy"
        />
      </div>
    );
  }
  if (ev.type === "video") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-white/70 mb-2">{ev.label}</div>
        <video
          controls
          preload="metadata"
          className="w-full rounded-xl border border-white/10"
          src={`/${ev.src}`.replace(/^\/+/, "/")}
        />
      </div>
    );
  }
  return (
    <a
      href={ev.src}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-white/10 bg-white/5 p-3 block hover:bg-white/10 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-white/90">{ev.label}</div>
        <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white/90 transition" />
      </div>
      <div className="text-xs text-white/50 mt-1 break-all">{ev.src}</div>
    </a>
  );
}

export default function Page() {
  const nodesById = useMemo(() => {
    const m = new Map<string, Node>();
    for (const n of F.nodes) m.set(n.id, n);
    return m;
  }, []);

  const [blinkNow, setBlinkNow] = useState(false);

  useEffect(() => {
    let t: number | null = null;
    let off: number | null = null;

    const schedule = () => {
      const ms = 4000 + Math.random() * 3000; // 4–7s
      t = window.setTimeout(() => {
        setBlinkNow(true);
        off = window.setTimeout(() => setBlinkNow(false), 140);
        schedule();
      }, ms);
    };

    schedule();

    return () => {
      if (t) clearTimeout(t);
      if (off) clearTimeout(off);
    };
  }, []);

  // start node
  const startNodeId = useMemo(() => {
    // prefer explicit start node; fallback to first node
    const explicit = F.nodes.find((n) => n.id === "n_summary_01");
    return explicit?.id ?? F.nodes[0]?.id ?? "";
  }, []);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [nodeHistory, setNodeHistory] = useState<Array<{ nodeId: string; optionId?: string }>>([
  { nodeId: startNodeId }
  ]);

  const INTRO_Q =
  "Hi. Thanks for joining. Let’s start simple — can you tell me a bit about yourself?";

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const startNode = nodesById.get(startNodeId);
    if (!startNode) return [];

    const userId = uid();
    const botId = uid();

    return [
      { id: userId, role: "user", text: INTRO_Q, optionId: "seed_intro" },
      { id: botId, role: "bot", text: startNode.bot, nodeId: startNodeId },
    ];
  });

  const [typingBotId, setTypingBotId] = useState<string | null>(null);
  useEffect(() => {
    const firstBot = messages.find((m) => m.role === "bot");
    if (!firstBot) return;
    const t = window.setTimeout(() => setTypingBotId(firstBot.id), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);

  const [showTimeline, setShowTimeline] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const currentNode = nodesById.get(nodeHistory[nodeHistory.length - 1]?.nodeId);

  const MAX_EVIDENCE = 6;

  const evidence = useMemo(() => {
    if (!currentNode) return [];

    const ev = currentNode.evidence ?? [];

    // Allow videos only on deep-dive nodes
    const allowVideo =
      /deep|demo|pipeline|stage|breakdown/i.test(currentNode.id) ||
      /deep|demo|pipeline|stage|breakdown/i.test(currentNode.section);

    const filtered = allowVideo ? ev : ev.filter((e) => e.type !== "video");

    // Hard cap evidence cards
    return filtered.slice(0, MAX_EVIDENCE);
  }, [currentNode]);


  useEffect(() => {
    const key = "terzo_welcome_seen";
    const seen = typeof window !== "undefined" && sessionStorage.getItem(key);

    if (!seen) {
      setShowWelcome(true);
      sessionStorage.setItem(key, "1");
    }
  }, []);


  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function pushTurn(userText: string, nextNodeId: string, optionId?: string) {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextNode = nodesById.get(nextNodeId);
    if (!nextNode) { setIsTransitioning(false); return; }

    setNodeHistory((h) => [...h, { nodeId: nextNodeId, optionId }]);

    const userMsg: ChatMessage = { id: uid(), role: "user", text: userText, optionId };
    const botMsg: ChatMessage = { id: uid(), role: "bot", text: nextNode.bot, nodeId: nextNodeId };

    setMessages((m) => [...m, userMsg, botMsg]);

    // type only the newest bot message
    setTypingBotId(botMsg.id);

    setTimeout(() => setIsTransitioning(false), 0);
  }



  function rebuildMessagesFromHistory(h: Array<{ nodeId: string; optionId?: string }>) {
    const msgs: ChatMessage[] = [];

    const firstNode = nodesById.get(h[0]?.nodeId);
    if (!firstNode) return msgs;

    msgs.push({ id: uid(), role: "bot", text: firstNode.bot, nodeId: h[0].nodeId });

    for (let i = 1; i < h.length; i++) {
      const prevNode = nodesById.get(h[i - 1].nodeId);
      const currNode = nodesById.get(h[i].nodeId);
      if (!currNode) continue;

      const optionId = h[i].optionId;
      const optionLabel =
        prevNode?.options?.find((o) => o.id === optionId)?.utterance ??
        prevNode?.options?.find((o) => o.id === optionId)?.label ??
        (optionId === "chip" ? "Open section" : optionId === "typed_intent" ? "Typed question" : "Continue");

      msgs.push({ id: uid(), role: "user", text: optionLabel, optionId });
      msgs.push({ id: uid(), role: "bot", text: currNode.bot, nodeId: h[i].nodeId });
    }

    return msgs;
  }

  function changeAnswer() {
    setNodeHistory((h) => {
      if (h.length <= 1) return h;
      const nh = h.slice(0, -1);
      setTypingBotId(null);
      setMessages(rebuildMessagesFromHistory(nh));
      return nh;
    });
  }


  function repeatQuestion() {
    // no state change; just a little shake animation by toggling a key
    // we’ll do it visually via a CSS pulse on the current bubble (handled below)
    setPulse((p) => p + 1);
  }

  const [pulse, setPulse] = useState(0);

  function jumpTo(index: number) {
    setNodeHistory((h) => {
      const nh = h.slice(0, index + 1);
      setTypingBotId(null);
      setMessages(rebuildMessagesFromHistory(nh));
      return nh;
    });
    setShowTimeline(false);
  }


  function gotoChip(nodeId: string, label?: string) {
    const chipLabel = label ?? "Open section";
    pushTurn(chipLabel, nodeId, "chip");
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white grid place-items-center p-6">
        <div className="max-w-lg text-center">
          <div className="text-xl font-semibold">Flow error</div>
          <div className="text-white/70 mt-2">
            Could not find current node. Check that <code className="text-white/90">flowV1.json</code> contains
            <code className="text-white/90"> n_start_01</code> (or adjust start logic).
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <CinematicIntro
      open={showWelcome}
      onClose={() => setShowWelcome(false)}
      blinkNow={blinkNow}
    />

    <div className="min-h-screen bg-[#070b14] text-white overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_30%_10%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(900px_600px_at_85%_40%,rgba(167,139,250,0.14),transparent_55%),radial-gradient(800px_500px_at_50%_95%,rgba(96,165,250,0.10),transparent_60%)]" />
        <motion.div
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0.20 }}
          animate={{ opacity: 0.35 }}
          transition={{ repeat: Infinity, repeatType: "mirror", duration: 3.2 }}
        >
          <div className="absolute left-1/3 top-1/4 h-[380px] w-[380px] rounded-full blur-3xl bg-cyan-500/10" />
          <div className="absolute right-1/4 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl bg-violet-500/10" />
        </motion.div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-6 pt-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RobotAvatar blinkNow={blinkNow} />
            <div>
              <div className="text-lg font-semibold tracking-tight flex items-center gap-2">
                {F.meta.botName || "Terzo"} <Sparkles className="w-4 h-4 text-cyan-300/80" />
              </div>
              <div className="text-xs text-white/60">Interview Simulator • deterministic flow • evidence-first</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/CV_Georgios_Terzoglou.pdf"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition inline-flex items-center gap-2"
              title="Download CV"
            >
              <Download className="w-4 h-4 text-white/70" />
              CV
            </a>

            <button
              onClick={() => gotoChip("n_contact_01", "Contact")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition inline-flex items-center gap-2"
              title="Contact"
            >
              <Mail className="w-4 h-4 text-white/70" />
              Contact
            </button>
          </div>
        </div>

        {/* Topic chips */}
        <div className="mx-auto max-w-7xl mt-5 flex flex-wrap gap-2">
          {F.ui.topicChips.map((c) => (
            <button
              key={c.id}
              onClick={() => gotoChip(c.goto, c.label)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 px-6 pb-6 pt-6 min-h-[calc(100vh-160px)]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-220px)]">
          {/* Chat pane */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_80px_rgba(34,211,238,0.08)] overflow-hidden lg:flex lg:flex-col lg:min-h-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Bot className="w-4 h-4 text-cyan-300/80" />
                Interview session
                <span className="text-white/40">•</span>
                <span className="text-white/60">{currentNode.section}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTimeline(true)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition inline-flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-white/70" />
                  Timeline
                </button>
                <button
                  onClick={repeatQuestion}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-white/70" />
                  Repeat
                </button>
                <button
                  onClick={changeAnswer}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition inline-flex items-center gap-2"
                >
                  <CornerUpLeft className="w-4 h-4 text-white/70" />
                  Change answer
                </button>
              </div>
            </div>

            <div ref={chatScrollRef}className="max-h-[66vh] overflow-y-auto px-5 py-5 lg:flex-1 lg:min-h-0 lg:max-h-none">
              <div className="space-y-4">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div className={cx("flex items-end gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                      <div className="shrink-0">
                        <div
                          className={cx(
                            "h-9 w-9 rounded-2xl border border-white/10 grid place-items-center",
                            m.role === "user" ? "bg-white/10" : "bg-white/5"
                          )}
                        >
                          {m.role === "user" ? (
                            <div className="text-xs text-white/70 font-semibold">You</div>
                          ) : (
                            <Bot className="w-5 h-5 text-cyan-300/80" />
                          )}
                        </div>
                      </div>

                      <div
                        className={cx(
                          "max-w-[80%] rounded-3xl border border-white/10 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
                          m.role === "user"
                            ? "bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(167,139,250,0.14))] text-white"
                            : "bg-white/5 text-white/90"
                        )}
                      >
                        {m.role === "bot" ? (
                          <TypewriterText text={m.text} active={typingBotId === m.id} />
                        ) : (
                          m.text
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {/* Options for the CURRENT node (always show under the latest bot message) */}
                {currentNode?.options?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2 justify-start">
                    {currentNode.options.map((o) => (
                      <button
                        key={o.id}
                        disabled={isTransitioning}
                        onClick={() => pushTurn(o.utterance ?? o.label, o.goto, o.id)}
                        className={cx(
                          "group relative overflow-hidden border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition",
                          "rounded-xl px-3 py-1.5 text-xs sm:rounded-2xl sm:px-4 sm:py-2 sm:text-sm",
                          isTransitioning && "opacity-60 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        <span className="relative z-10">{o.label}</span>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(300px_140px_at_20%_20%,rgba(34,211,238,0.18),transparent_60%)]" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Optional text input (no embeddings) */}
            <div className="border-t border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <input
                  placeholder="Optional: type a question (routes via topic keywords only)…"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const v = (e.currentTarget.value || "").trim().toLowerCase();
                    if (!v) return;

                    // keyword routing only (no embeddings)
                    const rules = (flow as any).intents?.routingRules ?? [];
                    const hit = rules.find((r: any) => (r.keywords ?? []).some((k: string) => v.includes(k)));
                    if (hit?.goto) pushTurn(v, hit.goto, "typed_intent");
                    else pushTurn(v, "n_summary_01", "typed_fallback");

                    e.currentTarget.value = "";
                  }}
                />
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
                  onClick={() => pushTurn("Show me projects", "n_proj_01", "quick_projects")}
                  title="Quick jump"
                >
                  Projects
                </button>
              </div>
              <div className="mt-2 text-xs text-white/50">
                This input never “chats”. It only routes you to the correct section using keyword intents.
              </div>
            </div>
          </div>

          {/* Evidence panel */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(167,139,250,0.07)] lg:flex lg:flex-col lg:min-h-0">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm text-white/80">Evidence panel</div>
              <div className="text-xs text-white/50">Shows proof for the current answer</div>
            </div>

            <div className="p-5 space-y-3 lg:overflow-y-auto lg:min-h-0 lg:flex-1">
              {evidence.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  No evidence attached to this node yet.
                  <div className="mt-2 text-xs text-white/50">
                    Add images/videos/links in <code className="text-white/80">flowV1.json</code> under this node’s
                    <code className="text-white/80"> evidence</code>.
                  </div>
                </div>
              ) : (
                evidence.map((ev, i) => <EvidenceCard key={i} ev={ev} />)
              )}

              {(currentNode?.evidence?.length ?? 0) > MAX_EVIDENCE && (
                <div className="text-xs text-white/50">
                  Showing {MAX_EVIDENCE} items. (Rule: keep evidence focused.)
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-2">Pro tip</div>
                <div className="text-sm text-white/80">
                  Fancy UI doesn’t matter if proof is buried. Keep answers short, then reveal evidence with one click.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline modal */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTimeline(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a1020]/90 backdrop-blur-xl p-5"
              initial={{ scale: 0.98, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/80">Timeline</div>
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                  onClick={() => setShowTimeline(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {nodeHistory.map((h, idx) => {
                  const node = nodesById.get(h.nodeId);
                  if (!node) return null;
                  const isCurrent = idx === nodeHistory.length - 1;
                  return (
                    <button
                      key={`${h.nodeId}-${idx}`}
                      onClick={() => jumpTo(idx)}
                      className={cx(
                        "w-full text-left rounded-2xl border border-white/10 px-4 py-3 transition",
                        isCurrent ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="text-xs text-white/50">{node.section}</div>
                      <div className="text-sm text-white/85 line-clamp-2">{node.bot}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-white/50">
                Clicking an item rewinds state to that point (deterministic rebuild).
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
);
}
