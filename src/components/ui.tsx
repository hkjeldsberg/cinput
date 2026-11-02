import type { Level } from "@/lib/plan";
import type { Badge, DayState, Hint } from "@/lib/progress";

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-fucsia px-5 py-2.5 font-bold text-on-fucsia shadow-[0_4px_0_0_var(--morado)] transition-[transform,box-shadow] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--morado)] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";
export const btnGhost =
  "inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold text-ink-soft hover:bg-papel hover:text-ink";
export const input =
  "w-full rounded-xl border-2 border-papel bg-card px-3 py-2 text-[15px] text-ink placeholder:text-ink-soft/70 focus:border-fucsia focus:outline-none";
export const card = "rounded-3xl bg-card p-5";
export const pageTitle = "font-display text-[30px] leading-tight sm:text-[40px]";
export const sectionTitle = "text-[22px] font-extrabold leading-tight";

const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Easy",
  intermediate: "Intermediate",
  upper: "Upper intermediate",
  advanced: "Advanced",
};
const LEVEL_STYLE: Record<Level, string> = {
  beginner: "bg-verde text-white",
  intermediate: "bg-cempasuchil text-[#2b0a3d]",
  upper: "bg-morado text-white",
  advanced: "bg-flag-fucsia text-white",
};

export function LevelChip({ level }: { level: Level }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${LEVEL_STYLE[level]}`}>
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

export const HINT_SHORT: Record<Hint, string> = {
  easier: "Go easier",
  right: "Right level",
  harder: "Try harder",
};

export function HoursRing({ minutes, goalHours }: { minutes: number; goalHours: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, minutes / (goalHours * 60));
  const hours = minutes / 60;
  return (
    <div
      className="relative size-[88px] shrink-0 sm:size-24"
      role="img"
      aria-label={`${hours.toFixed(1)} of ${goalHours} hours`}
    >
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--papel)" strokeWidth="10" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--fucsia)"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-[22px]">{hours < 10 ? hours.toFixed(1) : Math.round(hours)}</span>
        <span className="mt-0.5 text-[11px] text-ink-soft">of {goalHours} h</span>
      </div>
    </div>
  );
}

// Done flags cycle through the fiesta colors along the garland.
const DONE_FILL = ["bg-morado", "bg-verde", "bg-flag-fucsia"];

const FLAG_STYLE: Record<DayState, string> = {
  done: "pennant text-white",
  today: "pennant bg-cempasuchil text-[#2b0a3d]",
  missed: "pennant-torn bg-torn text-ink-soft",
  upcoming: "pennant bg-papel text-ink",
};

/**
 * A papel picado flag. Done flags get lace by comprehension:
 * one row of cut-outs under 80%, two rows at 80%+, a marigold center at 90%+.
 */
export function Pennant({ day, state, sub, pct }: { day: number; state: DayState; sub?: string; pct?: number }) {
  const done = state === "done";
  const lace = done ? ((pct ?? 0) >= 80 ? 2 : 1) : 0;
  return (
    <div
      className={`relative flex aspect-[4/5] flex-col items-center justify-center pb-[15%] ${FLAG_STYLE[state]} ${
        done ? DONE_FILL[(day - 1) % 3] : ""
      }`}
    >
      {lace === 2 && <span aria-hidden className="lace absolute inset-x-1 top-1" />}
      <span className={`font-display text-[17px] leading-none min-[400px]:text-[19px] sm:text-[24px] ${state === "missed" ? "opacity-60" : ""}`}>
        {day}
      </span>
      {sub && state !== "missed" && (
        <span
          className={`mt-0.5 flex items-center gap-0.5 text-[9px] font-bold leading-none min-[400px]:text-[10px] sm:mt-1 sm:text-[11px] ${
            done ? "" : "opacity-75"
          }`}
        >
          {done && (pct ?? 0) >= 90 && (
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-cempasuchil sm:size-2" />
          )}
          {sub}
        </span>
      )}
      {lace > 0 && <span aria-hidden className="lace absolute inset-x-1 bottom-[17%]" />}
    </div>
  );
}

/** Rosette badge with a progress line while locked. */
export function Rosette({ badge }: { badge: Badge }) {
  return (
    <div className={`${card} flex h-full items-center gap-3 p-3 min-[400px]:flex-col min-[400px]:items-start min-[400px]:p-4`} title={badge.hint}>
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-full ${
          badge.earned ? "rosette" : "rosette-locked"
        }`}
      >
        <span
          className={`flex size-10 items-center justify-center rounded-full font-display text-[15px] ${
            badge.earned ? "bg-flag-fucsia text-white" : "bg-papel text-ink-soft"
          }`}
        >
          {badge.glyph}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-extrabold leading-tight">{badge.label}</p>
        <p className="text-[13px] text-ink-soft">{badge.earned ? `Earned · ${badge.hint}` : `Locked · ${badge.progress}`}</p>
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
