import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deletePhrase, removeVideoFromDay, unlogWatch } from "@/app/actions";
import { AddVideoToDayForm, LogWatchForm, PhraseForm } from "@/components/forms";
import { btnGhost, card, formatLongDate, HINT_TEXT, LevelChip } from "@/components/ui";
import { type DayVideo, getDay } from "@/lib/data";
import { DAILY_MAX_MIN, TOTAL_DAYS } from "@/lib/plan";
import { comprehensionHint, dayDate } from "@/lib/progress";
import { thumbUrl, watchUrl } from "@/lib/youtube";

export default function DayPage({ params }: PageProps<"/day/[n]">) {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading day…</p>}>
      <Day params={params} />
    </Suspense>
  );
}

const MAX_PHRASES = 5;

async function Day({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_DAYS) notFound();
  const data = await getDay(n);
  if (!data) notFound();
  const { day, videos, settings, current } = data;

  const planned = videos.reduce((s, v) => s + v.duration_min, 0);
  const watched = videos.reduce((s, v) => s + (v.log?.minutes ?? 0), 0);

  return (
    <>
      <nav className="-mx-3 flex items-center justify-between" aria-label="Days">
        {n > 1 ? (
          <Link href={`/day/${n - 1}`} className={btnGhost}>
            ‹ Día {n - 1}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/" className={btnGhost}>
          All days
        </Link>
        {n < TOTAL_DAYS ? (
          <Link href={`/day/${n + 1}`} className={btnGhost}>
            Día {n + 1} ›
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <header>
        <p className="flex flex-wrap items-center gap-2 text-[15px] text-ink-soft">
          {settings.start_date ? formatLongDate(dayDate(settings.start_date, n)) : `Semana ${day.week}`}
          {n === current && (
            <span className="rounded-full bg-cempasuchil px-2.5 py-0.5 text-[11px] font-extrabold text-[#2b0a3d]">
              Today
            </span>
          )}
        </p>
        <h1 className="mt-1 font-display text-[52px] leading-none">Día {n}</h1>
        <p className="mt-3 text-[17px] font-extrabold">{day.focus}</p>
        <p className="text-[15px] text-ink-soft">
          {day.level_label}. Goal this week: {day.target.charAt(0).toLowerCase() + day.target.slice(1)}.
        </p>
      </header>

      <MinuteBar planned={planned} watched={watched} />

      {day.is_review && (
        <p className={`${card} border-[3px] border-dotted border-cempasuchil text-[15px]`}>
          Rewatch these week-1 videos. Notice how much more you catch now, then pick next month&apos;s level.
        </p>
      )}

      <section className="flex flex-col gap-4" aria-label="Videos">
        {videos.length === 0 && (
          <p className={`${card} text-[15px]`}>No videos planned for this day yet. Add one you want to watch below.</p>
        )}
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} dayNumber={n} />
        ))}
      </section>

      <details className={card}>
        <summary className="cursor-pointer text-[15px] font-extrabold">Add your own video</summary>
        <div className="mt-4">
          <AddVideoToDayForm dayNumber={n} />
        </div>
      </details>
    </>
  );
}

function MinuteBar({ planned, watched }: { planned: number; watched: number }) {
  const pct = Math.min(100, (watched / DAILY_MAX_MIN) * 100);
  return (
    <div>
      <div className="flex justify-between gap-3 text-[13px]">
        <span className="font-extrabold">{watched} min watched</span>
        <span className="text-ink-soft">
          {planned} min planned, max {DAILY_MAX_MIN}
        </span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-papel">
        <div className="h-full rounded-full bg-verde transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function VideoCard({ video: v, dayNumber }: { video: DayVideo; dayNumber: number }) {
  const href = v.youtube_id ? watchUrl(v.youtube_id) : v.url;
  const log = v.log;
  return (
    <article className={`${card} ${log ? "ring-2 ring-verde" : ""}`}>
      <div className="flex gap-3 sm:gap-4">
        <a href={href} target="_blank" rel="noreferrer" className="relative shrink-0 self-start" aria-label={`Watch ${v.title} on YouTube`}>
          {v.youtube_id && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl(v.youtube_id)} alt="" width={160} height={90} className="block aspect-video w-28 rounded-xl object-cover min-[400px]:w-32 sm:w-40" />
          )}
          <span className="absolute bottom-1 right-1 rounded-md bg-[#2b0a3d]/85 px-1.5 text-[11px] font-bold text-white">
            {v.duration_min} min
          </span>
        </a>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold leading-snug">
            <a href={href} target="_blank" rel="noreferrer" className="hover:text-fucsia">
              {v.title}
            </a>
          </h3>
          <p className="text-[13px] text-ink-soft">{v.channel}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <LevelChip level={v.level} />
            {log && <span className="rounded-full bg-verde px-2.5 py-0.5 text-[11px] font-extrabold text-white">Watched</span>}
          </div>
        </div>
      </div>

      {log ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
            <p>
              <strong>{log.minutes} min</strong>, understood about <strong>{log.comprehension_pct}%</strong>
              {log.rewound && ", rewound"}. {HINT_TEXT[comprehensionHint(log.comprehension_pct)]}
            </p>
            <form action={unlogWatch}>
              <input type="hidden" name="id" value={log.id} />
              <button className={btnGhost}>Undo</button>
            </form>
          </div>

          <div>
            <h4 className="text-[15px] font-extrabold">
              Phrases worth keeping{" "}
              <span className="text-[13px] font-normal text-ink-soft">
                {log.phrases.length} of {MAX_PHRASES}
              </span>
            </h4>
            {log.phrases.length > 0 && (
              <ul className="my-2 flex flex-col gap-1">
                {log.phrases.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-ground py-1.5 pr-1 pl-3 text-[15px]">
                    <span>
                      <span className="font-extrabold">{p.phrase}</span>
                      {p.meaning && <span className="text-ink-soft">: {p.meaning}</span>}
                    </span>
                    <form action={deletePhrase}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-papel hover:text-fucsia" aria-label={`Delete ${p.phrase}`}>
                        ✕
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            <PhraseForm watchLogId={log.id} remaining={MAX_PHRASES - log.phrases.length} />
          </div>
        </div>
      ) : (
        <>
          <LogWatchForm dayNumber={dayNumber} videoId={v.id} duration={v.duration_min} />
          <form action={removeVideoFromDay} className="mt-2 text-right">
            <input type="hidden" name="day_number" value={dayNumber} />
            <input type="hidden" name="video_id" value={v.id} />
            <button className={btnGhost}>Remove from this day</button>
          </form>
        </>
      )}
    </article>
  );
}
