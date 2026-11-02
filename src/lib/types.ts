import type { Level, PlanDay } from "./plan";

export type Settings = {
  start_date: string | null;
  daily_goal_min: number;
  hours_goal: number;
  days_goal: number;
};

export type Video = {
  id: string;
  youtube_id: string | null;
  url: string;
  title: string;
  channel: string;
  level: Level;
  ds_level: number | null;
  duration_min: number;
  topic: string;
  is_custom: boolean;
};

export type Phrase = { id: string; watch_log_id: string; phrase: string; meaning: string; created_at: string };

export type WatchLog = {
  id: string;
  day_number: number;
  video_id: string;
  minutes: number;
  comprehension_pct: number;
  rewound: boolean;
  watched_at: string;
};

export type WeeklyReview = {
  week: number;
  comprehension_pct: number | null;
  what_felt_hard: string;
  next_topic: string;
};

export type { Level, PlanDay };
