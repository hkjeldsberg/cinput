import { describe, expect, it } from "vitest";
import { assignVideos, DAILY_MAX_MIN, PLAN_DAYS, type SeedVideo } from "./plan";
import {
  bestStreak,
  comprehensionHint,
  currentDay,
  dayDate,
  dayState,
  levelUpReady,
  missedInARow,
  streak,
  todayIn,
} from "./progress";

const set = (...n: number[]) => new Set(n);

describe("dates", () => {
  it("maps day numbers to dates across month ends", () => {
    expect(dayDate("2026-11-20", 1)).toBe("2026-11-20");
    expect(dayDate("2026-11-20", 12)).toBe("2026-12-01");
  });
  it("computes current day", () => {
    expect(currentDay("2026-11-02", "2026-11-02")).toBe(1);
    expect(currentDay("2026-11-02", "2026-11-01")).toBe(0);
    expect(currentDay("2026-11-02", "2026-12-01")).toBe(30);
  });
  it("respects time zone for today", () => {
    const late = new Date("2026-11-02T23:30:00Z");
    expect(todayIn("Atlantic/Canary", late)).toBe("2026-11-02");
    expect(todayIn("Europe/Oslo", late)).toBe("2026-11-03");
  });
});

describe("day state and streaks", () => {
  it("classifies days", () => {
    expect(dayState(3, 5, set(3))).toBe("done");
    expect(dayState(5, 5, set())).toBe("today");
    expect(dayState(4, 5, set())).toBe("missed");
    expect(dayState(6, 5, set())).toBe("upcoming");
  });
  it("counts streak up to yesterday while today is open", () => {
    expect(streak(set(2, 3, 4), 5)).toBe(3);
    expect(streak(set(2, 3, 4, 5), 5)).toBe(4);
    expect(streak(set(1, 3), 5)).toBe(0);
  });
  it("counts missed days in a row before today", () => {
    expect(missedInARow(set(1, 2), 5)).toBe(2);
    expect(missedInARow(set(1, 2, 3, 4), 5)).toBe(0);
    expect(missedInARow(set(), 1)).toBe(0);
  });
  it("finds best streak", () => {
    expect(bestStreak(set(1, 2, 4, 5, 6))).toBe(3);
  });
});

describe("V0 rules", () => {
  it("gives comprehension hints at 75/90 thresholds", () => {
    expect(comprehensionHint(74)).toBe("easier");
    expect(comprehensionHint(75)).toBe("right");
    expect(comprehensionHint(90)).toBe("right");
    expect(comprehensionHint(91)).toBe("harder");
  });
  it("signals level-up after 3 videos >90% without rewinding", () => {
    const log = (pct: number, rewound: boolean, at: string) => ({ comprehension_pct: pct, rewound, watched_at: at });
    expect(levelUpReady([log(95, false, "1"), log(92, false, "2"), log(99, false, "3")])).toBe(true);
    expect(levelUpReady([log(95, false, "1"), log(92, true, "2"), log(99, false, "3")])).toBe(false);
    expect(levelUpReady([log(50, false, "0"), log(95, false, "1"), log(92, false, "2")])).toBe(false);
  });
});

describe("assignVideos", () => {
  const mk = (level: SeedVideo["level"], n: number, dur: number): SeedVideo[] =>
    Array.from({ length: n }, (_, i) => ({ key: `${level}${i}`, level, duration_min: dur }));
  const videos = [...mk("beginner", 8, 12), ...mk("intermediate", 20, 14), ...mk("upper", 10, 15), ...mk("advanced", 5, 11)];
  const byKey = new Map(videos.map((v) => [v.key, v]));
  const result = assignVideos(videos);

  it("fills every day within the 30-minute cap", () => {
    for (const d of PLAN_DAYS) {
      const keys = result.get(d.day_number) ?? [];
      expect(keys.length, `day ${d.day_number}`).toBeGreaterThan(0);
      const total = keys.reduce((s, k) => s + byKey.get(k)!.duration_min, 0);
      expect(total).toBeLessThanOrEqual(DAILY_MAX_MIN);
    }
  });
  it("uses advanced videos only on week-4 advanced days", () => {
    for (const [day, keys] of result) {
      const hasAdvanced = keys.some((k) => byKey.get(k)!.level === "advanced");
      expect(hasAdvanced, `day ${day}`).toBe(day === 24 || day === 27);
    }
  });
  it("review days rewatch week-1 videos", () => {
    const week1 = new Set([1, 2, 3, 4, 5, 6, 7].flatMap((d) => result.get(d)!));
    for (const k of [...result.get(29)!, ...result.get(30)!]) expect(week1.has(k)).toBe(true);
  });
});
