import "server-only";
import { requireAuth } from "./auth";
import { db, must } from "./db";
import { TOTAL_DAYS } from "./plan";
import {
  badges,
  bestStreak,
  currentDay,
  levelUpReady,
  missedInARow,
  streak,
  todayIn,
} from "./progress";
import type { Phrase, PlanDay, Settings, Video, WatchLog, WeeklyReview } from "./types";

export function today(): string {
  return todayIn(process.env.APP_TIME_ZONE || "Atlantic/Canary");
}

async function getSettings(): Promise<Settings> {
  return must(await db().from("settings").select("start_date, daily_goal_min, hours_goal, days_goal").single());
}

/** Everything the board and header need. */
export async function getOverview() {
  await requireAuth();
  const [settings, plan, logs, phraseCount] = await Promise.all([
    getSettings(),
    db().from("plan_days").select("*").order("day_number").then(must<PlanDay[]>),
    db().from("watch_logs").select("*").then(must<WatchLog[]>),
    db().from("phrases").select("id", { count: "exact", head: true }),
  ]);

  const done = new Set(logs.map((l) => l.day_number));
  const minutes = logs.reduce((s, l) => s + l.minutes, 0);
  const minutesByDay = new Map<number, number>();
  for (const l of logs) minutesByDay.set(l.day_number, (minutesByDay.get(l.day_number) ?? 0) + l.minutes);
  const current = settings.start_date ? currentDay(settings.start_date, today()) : 0;
  const levelUp = levelUpReady(logs);
  const phrases = phraseCount.count ?? 0;

  return {
    settings,
    plan,
    done,
    minutesByDay,
    current,
    minutes,
    phrases,
    streak: streak(done, current),
    missedInARow: current > 1 && current <= TOTAL_DAYS + 1 ? missedInARow(done, current) : 0,
    levelUp,
    badges: badges(
      { daysDone: done.size, minutes, bestStreak: bestStreak(done), levelUp, phrases },
      { hours: settings.hours_goal, days: settings.days_goal },
    ),
  };
}

export type DayVideo = Video & { log: (WatchLog & { phrases: Phrase[] }) | null };

export async function getDay(dayNumber: number) {
  await requireAuth();
  const [settings, day, dayVideos, logs] = await Promise.all([
    getSettings(),
    db().from("plan_days").select("*").eq("day_number", dayNumber).maybeSingle().then(must<PlanDay | null>),
    db()
      .from("day_videos")
      .select("position, videos(*)")
      .eq("day_number", dayNumber)
      .order("position")
      .then(must<{ position: number; videos: Video }[]>),
    db()
      .from("watch_logs")
      .select("*, phrases(*)")
      .eq("day_number", dayNumber)
      .order("created_at", { referencedTable: "phrases" })
      .then(must<(WatchLog & { phrases: Phrase[] })[]>),
  ]);
  if (!day) return null;

  const videos: DayVideo[] = dayVideos.map(({ videos: v }) => ({
    ...v,
    log: logs.find((l) => l.video_id === v.id) ?? null,
  }));
  return { settings, day, videos, current: settings.start_date ? currentDay(settings.start_date, today()) : 0 };
}

/** Short beginner videos for the V0 "two missed days → 10-min easy video" restart. */
export async function getEasyVideos(limit = 3): Promise<Video[]> {
  await requireAuth();
  return must(
    await db().from("videos").select("*").eq("level", "beginner").lte("duration_min", 12).order("duration_min").limit(limit),
  );
}

export type PhraseRow = Phrase & { watch_logs: { day_number: number; videos: { title: string } } };

export async function getPhrases(): Promise<PhraseRow[]> {
  await requireAuth();
  return must(
    await db()
      .from("phrases")
      .select("*, watch_logs(day_number, videos(title))")
      .order("created_at", { ascending: false }),
  );
}

export async function getVideos(): Promise<Video[]> {
  await requireAuth();
  return must(await db().from("videos").select("*").order("level").order("title"));
}

export async function getReviews(): Promise<{ reviews: WeeklyReview[]; logs: WatchLog[]; plan: PlanDay[] }> {
  await requireAuth();
  const [reviews, logs, plan] = await Promise.all([
    db().from("weekly_reviews").select("*").order("week").then(must<WeeklyReview[]>),
    db().from("watch_logs").select("*").then(must<WatchLog[]>),
    db().from("plan_days").select("*").then(must<PlanDay[]>),
  ]);
  return { reviews, logs, plan };
}

export async function getStartDate(): Promise<string | null> {
  await requireAuth();
  return (await getSettings()).start_date;
}
