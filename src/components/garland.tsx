"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "cinput:dropped-days";
const CONFETTI_KEY = "cinput:confetti";

function readSeen(): number[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * The first time a day is seen as done, its flag drops in on the string.
 * Remembered per browser so it only plays once per day.
 */
export function FlagDrop({ day, done, children }: { day: number; done: boolean; children: React.ReactNode }) {
  const [drop, setDrop] = useState(false);

  useEffect(() => {
    if (!done) return;
    const seen = readSeen();
    if (seen.includes(day)) return;
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, day]));
    } catch {
      // Storage unavailable: skip remembering, the animation still plays.
    }
    // Playing an animation on mount is a sync with browser state, not derived data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrop(true);
  }, [day, done]);

  return <div className={drop ? "flag-drop" : undefined}>{children}</div>;
}

const COLORS = ["#6a1b9a", "#00796b", "#c2185b", "#ffb300", "#f1ddea"];

type Piece = { left: number; color: string; delay: number; dur: number; drift: number; spin: number };

/** Confetti of little flags, once, when the days goal is reached. */
export function FlagConfetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    try {
      if (localStorage.getItem(CONFETTI_KEY)) return;
      localStorage.setItem(CONFETTI_KEY, "1");
    } catch {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(
      Array.from({ length: 42 }, (_, i) => ({
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.8,
        dur: 2.4 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 540,
      })),
    );
    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="flag-confetti pennant"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
