import type { Level } from "@/lib/plan";
import type { Hint } from "@/lib/progress";

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-bloom px-5 py-2.5 font-semibold text-white transition-colors hover:bg-bloom-dark disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-foam hover:text-ink";
export const input =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-ink placeholder:text-ink-soft/60 focus:border-bloom focus:outline-none";
export const card = "rounded-3xl bg-card p-5 shadow-[0_2px_0_0_var(--color-line)]";

const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Easy",
  intermediate: "Intermediate",
  upper: "Upper intermediate",
  advanced: "Advanced",
};
const LEVEL_STYLE: Record<Level, string> = {
  beginner: "bg-leaf/15 text-leaf",
  intermediate: "bg-ink/10 text-ink",
  upper: "bg-sun/30 text-[#7a5a00]",
  advanced: "bg-bloom/15 text-bloom",
};

export function LevelChip({ level }: { level: Level }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[level]}`}>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABEL) as [Level, string][];

export const HINT_TEXT: Record<Hint, string> = {
  easier: "Under 75%: pick an easier video next time.",
  right: "Right level. Keep going.",
  harder: "Over 90%: try a harder video next time.",
};

export function HoursRing({ minutes, goalHours }: { minutes: number; goalHours: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, minutes / (goalHours * 60));
  const hours = minutes / 60;
  return (
    <div className="relative size-24 shrink-0" role="img" aria-label={`${hours.toFixed(1)} of ${goalHours} hours`}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-line)" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--color-leaf)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-xl font-bold">{hours < 10 ? hours.toFixed(1) : Math.round(hours)}</span>
        <span className="text-xs text-ink-soft">of {goalHours} h</span>
      </div>
    </div>
  );
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatLongDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
