import Link from "next/link";
import { Suspense } from "react";
import { StartDateForm } from "@/components/forms";
import { card, formatDate, HoursRing } from "@/components/ui";
import { getEasyVideos, getOverview, today } from "@/lib/data";
import { TOTAL_DAYS, WEEKS } from "@/lib/plan";
import { dayDate, dayState, type DayState } from "@/lib/progress";
import { watchUrl } from "@/lib/youtube";

export default function BoardPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading your 30 days…</p>}>
      <Board />
    </Suspense>
  );
}

const TILE: Record<DayState, string> = {
  done: "bg-leaf text-white",
  today: "bg-sun text-ink ring-4 ring-sun/40",
  missed: "bg-mist/60 text-ink-soft",
  upcoming: "bg-white text-ink",
};

async function Board() {
  const o = await getOverview();
  const start = o.settings.start_date;

  if (!start) {
    return (
      <section className={card}>
        <h1 className="text-3xl font-extrabold">Pick your day 1</h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          30 days, up to 30 minutes of video a day. Choose when day 1 is and the plan lines up from there.
        </p>
        <div className="mt-5">
          <StartDateForm defaultValue={today()} />
        </div>
      </section>
    );
  }

  const current = o.current;
  const finished = current > TOTAL_DAYS;
  const todayDone = o.done.has(current);

  return (
    <>
      <section className="flex items-center justify-between gap-4">
        <div>
          {current < 1 ? (
            <h1 className="text-4xl font-extrabold">Starts {formatDate(start)}</h1>
          ) : finished ? (
            <h1 className="text-4xl font-extrabold">¡Terminado!</h1>
          ) : (
            <Link href={`/day/${current}`} className="group block">
              <h1 className="text-6xl font-extrabold leading-none tracking-tight">
                Día {current}
                <span className="text-2xl font-bold text-ink-soft"> de 30</span>
              </h1>
              <p className="mt-2 font-medium text-bloom group-hover:underline">
                {todayDone ? "Done for today. Add more or save phrases" : "Open today's videos"}
              </p>
            </Link>
          )}
          <dl className="mt-4 flex gap-5 text-sm">
            <div>
              <dt className="text-ink-soft">Streak</dt>
              <dd className="text-2xl font-bold">🔥 {o.streak}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Days done</dt>
              <dd className="text-2xl font-bold">
                {o.done.size}
                <span className="text-base text-ink-soft">/{o.settings.days_goal}</span>
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Phrases</dt>
              <dd className="text-2xl font-bold">{o.phrases}</dd>
            </div>
          </dl>
        </div>
        <HoursRing minutes={o.minutes} goalHours={o.settings.hours_goal} />
      </section>

      {o.missedInARow >= 2 && !todayDone && <RestartBanner missed={o.missedInARow} />}

      {o.levelUp && (
        <section className={`${card} border-2 border-bloom`}>
          <h2 className="text-xl font-bold">🚀 Ready to level up</h2>
          <p className="text-ink-soft">
            Your last 3 videos were above 90% with no rewinding. Pick a harder video for your next session.
          </p>
        </section>
      )}

      <section className="flex flex-col gap-5" aria-label="30-day plan">
        {WEEKS.map((w) => (
          <div key={w.week}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 className="text-lg font-bold">{w.week === 5 ? "Review" : `Semana ${w.week}`}</h2>
              <p className="text-sm text-ink-soft">{w.week === 5 ? w.level_label : w.focus}</p>
            </div>
            <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: w.days[1] - w.days[0] + 1 }, (_, i) => w.days[0] + i).map((n) => {
                const state = dayState(n, current, o.done);
                const mins = o.minutesByDay.get(n);
                return (
                  <li key={n}>
                    <Link
                      href={`/day/${n}`}
                      aria-label={`Day ${n}, ${state}${mins ? `, ${mins} minutes` : ""}`}
                      className={`flex aspect-square flex-col items-center justify-center rounded-2xl transition-transform hover:-translate-y-0.5 ${TILE[state]} ${state === "done" && n === current ? "tile-pop" : ""}`}
                    >
                      <span className="text-xl font-extrabold leading-none sm:text-2xl">{n}</span>
                      <span className="mt-0.5 text-[10px] opacity-80 sm:text-xs">
                        {mins ? `${mins}′` : formatDate(dayDate(start, n))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <section aria-label="Badges">
        <h2 className="mb-2 text-lg font-bold">Badges</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {o.badges.map((b) => (
            <li
              key={b.id}
              className={`rounded-2xl p-3 ${b.earned ? "bg-white" : "bg-white/40 text-ink-soft"}`}
              title={b.hint}
            >
              <span className={`text-2xl ${b.earned ? "" : "grayscale opacity-40"}`}>{b.emoji}</span>
              <p className="font-semibold">{b.label}</p>
              <p className="text-xs text-ink-soft">{b.hint}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

async function RestartBanner({ missed }: { missed: number }) {
  const easy = await getEasyVideos(2);
  return (
    <section className={`${card} border-2 border-sun`}>
      <h2 className="text-xl font-bold">Restart with something easy</h2>
      <p className="text-ink-soft">
        {missed} days missed in a row. Skip them, don&apos;t double up. Today just watch one short, easy video.
      </p>
      {easy.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {easy.map((v) => (
            <li key={v.id}>
              <a href={v.youtube_id ? watchUrl(v.youtube_id) : v.url} target="_blank" rel="noreferrer" className="font-medium text-bloom underline">
                {v.title}
              </a>{" "}
              <span className="text-sm text-ink-soft">{v.duration_min} min</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
