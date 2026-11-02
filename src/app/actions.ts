"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db, must } from "@/lib/db";
import { DAILY_MAX_MIN } from "@/lib/plan";
import { checkPassword, createToken, SESSION_COOKIE } from "@/lib/session";
import { parseYouTubeId } from "@/lib/youtube";

export type FormState = { error?: string; ok?: boolean };

function fail(err: z.ZodError | string): FormState {
  return { error: typeof err === "string" ? err : err.issues[0]?.message ?? "Invalid input" };
}

// ---------- auth ----------

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) return fail("Wrong password. Try again.");
  const { token, expires } = await createToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

// ---------- settings ----------

const dateSchema = z.object({ start_date: z.iso.date("Pick a valid date") });

export async function setStartDate(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const parsed = dateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  must(await db().from("settings").update({ start_date: parsed.data.start_date }).eq("id", 1).select());
  refresh();
  return { ok: true };
}

// ---------- watching ----------

const watchSchema = z.object({
  day_number: z.coerce.number().int().min(1).max(30),
  video_id: z.uuid(),
  minutes: z.coerce.number().int().min(1, "At least 1 minute").max(60, "Max 60 minutes"),
  comprehension_pct: z.coerce.number().int().min(0).max(100),
  rewound: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export async function logWatch(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const parsed = watchSchema.safeParse({ ...Object.fromEntries(formData), rewound: formData.get("rewound") });
  if (!parsed.success) return fail(parsed.error);
  must(await db().from("watch_logs").upsert(parsed.data, { onConflict: "day_number,video_id" }).select());
  refresh();
  return { ok: true };
}

export async function unlogWatch(formData: FormData) {
  await requireAuth();
  const id = z.uuid().parse(formData.get("id"));
  must(await db().from("watch_logs").delete().eq("id", id).select());
  refresh();
}

// ---------- phrases ----------

const phraseSchema = z.object({
  watch_log_id: z.uuid(),
  phrase: z.string().trim().min(1, "Write the phrase").max(200),
  meaning: z.string().trim().max(200).default(""),
});

export async function addPhrase(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const parsed = phraseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { error } = await db().from("phrases").insert(parsed.data);
  if (error) return fail(error.message.includes("phrase_limit") ? "Max 5 phrases per video" : error.message);
  refresh();
  return { ok: true };
}

export async function deletePhrase(formData: FormData) {
  await requireAuth();
  const id = z.uuid().parse(formData.get("id"));
  must(await db().from("phrases").delete().eq("id", id).select());
  refresh();
}

// ---------- videos ----------

const videoSchema = z.object({
  url: z.url("Paste a YouTube link"),
  title: z.string().trim().min(1, "Add a title").max(200),
  channel: z.string().trim().max(100).default(""),
  level: z.enum(["beginner", "intermediate", "upper", "advanced"]),
  duration_min: z.coerce.number().int().min(1).max(DAILY_MAX_MIN, `Max ${DAILY_MAX_MIN} minutes`),
  topic: z.string().trim().max(100).default(""),
});

async function insertVideo(formData: FormData) {
  const parsed = videoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: fail(parsed.error) };
  const youtube_id = parseYouTubeId(parsed.data.url);
  if (!youtube_id) return { error: fail("Only YouTube links are supported") };

  const existing = must<{ id: string } | null>(
    await db().from("videos").select("id").eq("youtube_id", youtube_id).maybeSingle(),
  );
  if (existing) return { id: existing.id };
  const row = must<{ id: string }>(
    await db()
      .from("videos")
      .insert({ ...parsed.data, youtube_id, is_custom: true })
      .select("id")
      .single(),
  );
  return { id: row.id };
}

export async function addVideoToDay(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const day = z.coerce.number().int().min(1).max(30).parse(formData.get("day_number"));
  const res = await insertVideo(formData);
  if ("error" in res) return res.error!;
  const { count } = await db().from("day_videos").select("*", { count: "exact", head: true }).eq("day_number", day);
  must(
    await db()
      .from("day_videos")
      .upsert({ day_number: day, video_id: res.id, position: count ?? 0 }, { onConflict: "day_number,video_id" })
      .select(),
  );
  refresh();
  return { ok: true };
}

export async function removeVideoFromDay(formData: FormData) {
  await requireAuth();
  const day = z.coerce.number().int().min(1).max(30).parse(formData.get("day_number"));
  const videoId = z.uuid().parse(formData.get("video_id"));
  must(await db().from("day_videos").delete().eq("day_number", day).eq("video_id", videoId).select());
  refresh();
}

export async function addLibraryVideo(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const res = await insertVideo(formData);
  if ("error" in res) return res.error!;
  refresh();
  return { ok: true };
}

export async function deleteVideo(formData: FormData) {
  await requireAuth();
  const id = z.uuid().parse(formData.get("id"));
  must(await db().from("videos").delete().eq("id", id).select());
  refresh();
}

// ---------- weekly review ----------

const reviewSchema = z.object({
  week: z.coerce.number().int().min(1).max(5),
  comprehension_pct: z.coerce.number().int().min(0).max(100),
  what_felt_hard: z.string().trim().max(500).default(""),
  next_topic: z.string().trim().max(200).default(""),
});

export async function saveReview(_: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  must(
    await db()
      .from("weekly_reviews")
      .upsert({ ...parsed.data, updated_at: new Date().toISOString() })
      .select(),
  );
  refresh();
  return { ok: true };
}
