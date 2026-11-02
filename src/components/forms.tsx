"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addLibraryVideo,
  addPhrase,
  addVideoToDay,
  type FormState,
  login,
  logWatch,
  saveReview,
  setStartDate,
} from "@/app/actions";
import { comprehensionHint } from "@/lib/progress";
import { btn, HINT_TEXT, input, LEVEL_OPTIONS } from "./ui";

function Submit({ children, className = btn, disabled }: { children: React.ReactNode; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? "Saving…" : children}
    </button>
  );
}

function Message({ state, ok }: { state: FormState; ok?: string }) {
  if (state.error)
    return (
      <p role="alert" className="text-sm font-medium text-bloom">
        {state.error}
      </p>
    );
  if (state.ok && ok)
    return (
      <p role="status" className="text-sm font-medium text-leaf">
        {ok}
      </p>
    );
  return null;
}

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="password" className="font-medium">
        Password
      </label>
      <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className={input} />
      <Message state={state} />
      <Submit>Log in</Submit>
    </form>
  );
}

export function StartDateForm({ defaultValue, submitLabel = "Start day 1" }: { defaultValue: string; submitLabel?: string }) {
  const [state, action] = useActionState(setStartDate, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 font-medium">
        Day 1 is
        <input name="start_date" type="date" required defaultValue={defaultValue} className={input} />
      </label>
      <Submit>{submitLabel}</Submit>
      <div className="basis-full">
        <Message state={state} ok="Start date saved" />
      </div>
    </form>
  );
}

export function LogWatchForm({ dayNumber, videoId, duration }: { dayNumber: number; videoId: string; duration: number }) {
  const [state, action] = useActionState(logWatch, {});
  const [pct, setPct] = useState(80);
  return (
    <form action={action} className="mt-4 flex flex-col gap-3 rounded-2xl bg-foam p-4">
      <input type="hidden" name="day_number" value={dayNumber} />
      <input type="hidden" name="video_id" value={videoId} />
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Minutes watched
          <input name="minutes" type="number" min={1} max={60} defaultValue={duration} className={`${input} w-24`} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          I understood about {pct}%
          <input
            name="comprehension_pct"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="mt-2"
          />
        </label>
      </div>
      <p className="text-sm text-ink-soft">{HINT_TEXT[comprehensionHint(pct)]}</p>
      <label className="flex items-center gap-2 text-sm">
        <input name="rewound" type="checkbox" className="size-4 accent-bloom" />I rewound to catch something
      </label>
      <Message state={state} />
      <Submit className={`${btn} self-start`}>Mark as watched</Submit>
    </form>
  );
}

export function PhraseForm({ watchLogId, remaining }: { watchLogId: string; remaining: number }) {
  const [state, action] = useActionState(addPhrase, {});
  if (remaining <= 0) return <p className="text-sm text-ink-soft">All 5 phrases saved for this video.</p>;
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="watch_log_id" value={watchLogId} />
      <input name="phrase" required maxLength={200} placeholder="Frase en español" aria-label="Phrase" className={input} />
      <input name="meaning" maxLength={200} placeholder="Meaning (optional)" aria-label="Meaning" className={input} />
      <Submit className={`${btn} shrink-0`}>Save phrase</Submit>
      <Message state={state} />
    </form>
  );
}

function VideoFields() {
  return (
    <>
      <input name="url" type="url" required placeholder="https://www.youtube.com/watch?v=…" aria-label="YouTube link" className={input} />
      <input name="title" required maxLength={200} placeholder="Title" aria-label="Title" className={input} />
      <div className="flex flex-wrap gap-2">
        <input name="channel" maxLength={100} placeholder="Channel" aria-label="Channel" className={`${input} flex-1`} />
        <input name="duration_min" type="number" min={1} max={30} required placeholder="Min" aria-label="Minutes" className={`${input} w-24`} />
        <select name="level" defaultValue="intermediate" aria-label="Level" className={`${input} w-auto`}>
          {LEVEL_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function AddVideoToDayForm({ dayNumber }: { dayNumber: number }) {
  const [state, action] = useActionState(addVideoToDay, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="day_number" value={dayNumber} />
      <VideoFields />
      <Message state={state} ok="Video added to this day" />
      <Submit className={`${btn} self-start`}>Add to day {dayNumber}</Submit>
    </form>
  );
}

export function AddLibraryVideoForm() {
  const [state, action] = useActionState(addLibraryVideo, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <VideoFields />
      <input name="topic" maxLength={100} placeholder="Topic (optional)" aria-label="Topic" className={input} />
      <Message state={state} ok="Video added to library" />
      <Submit className={`${btn} self-start`}>Add to library</Submit>
    </form>
  );
}

export function ReviewForm({
  week,
  defaults,
}: {
  week: number;
  defaults: { comprehension_pct: number; what_felt_hard: string; next_topic: string };
}) {
  const [state, action] = useActionState(saveReview, {});
  const [pct, setPct] = useState(defaults.comprehension_pct);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="week" value={week} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        Comprehension this week: about {pct}%
        <input
          name="comprehension_pct"
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        What felt hard
        <textarea name="what_felt_hard" rows={2} maxLength={500} defaultValue={defaults.what_felt_hard} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        One topic to look for next week
        <input name="next_topic" maxLength={200} defaultValue={defaults.next_topic} className={input} />
      </label>
      <Message state={state} ok="Week saved" />
      <Submit className={`${btn} self-start`}>Save week {week}</Submit>
    </form>
  );
}
