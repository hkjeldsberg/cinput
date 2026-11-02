import Link from "next/link";
import { Suspense } from "react";
import { StartDateForm } from "@/components/forms";
import { FlagConfetti, FlagDrop } from "@/components/garland";
import { card, formatDate, formatLongDate, HoursRing, pageTitle, Pennant, Rosette, sectionTitle } from "@/components/ui";
import { getEasyVideos, getOverview, today } from "@/lib/data";
import { TOTAL_DAYS, WEEKS } from "@/lib/plan";
import { dayDate, dayState } from "@/lib/progress";
import { watchUrl } from "@/lib/youtube";

export default function BoardPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading your 30 days…</p>}>
      <Board />
    </Suspense>
  );
}

const STATE_LABEL = { done: "done", today: "today", missed: "missed", upcoming: "upcoming" } as const;

async function Board() {
  const o = await getOverview();
  const start = o.settings.start_date;

  if (!start) {
    return (
      <section className={card}>
        <h1 className={pageTitle}>Pick your day 1</h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          30 days, up to 30 minutes of video a day. Choose when day 1 is and the plan lines up from there.
        </p>
        <Link href="/guide" className="mt-2 inline-block font-bold text-fucsia underline">
          Read how it works first
        </Link>
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
      <FlagConfetti active={o.done.size >= o.settings.days_goal} />

      <section>
        <p className="text-[15px] text-ink-soft">{formatLongDate(today())}</p>
        {current < 1 ? (
          <h1 className="font-display text-[40px] leading-none sm:text-[52px]">Starts {formatDate(start)}</h1>
        ) : finished ? (
          <h1 className="font-display text-[40px] leading-none sm:text-[52px]">¡Terminado!</h1>
        ) : (
          <Link href={`/day/${current}`} className="group block">
            <h1 className="font-display text-[52px] leading-none">
              Día {current}
              <span className="text-[22px] text-ink-soft"> de 30</span>
            </h1>
            <p className="mt-2 text-[15px] font-extrabold text-fucsia group-hover:underline">
              {todayDone ? "Done for today. Add more or save phrases" : "Open today's videos"}
            </p>
          </Link>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <dl className="flex gap-5 sm:gap-8">
            <div className="flex flex-col-reverse">
              <dt className="text-[13px] text-ink-soft">day streak</dt>
              <dd className="font-display text-[30px] leading-none">{o.streak}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-[13px] text-ink-soft">days done</dt>
              <dd className="font-display text-[30px] leading-none">
                {o.done.size}/{o.settings.days_goal}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-[13px] text-ink-soft">phrases</dt>
              <dd className="font-display text-[30px] leading-none">{o.phrases}</dd>
            </div>
          </dl>
          <HoursRing minutes={o.minutes} goalHours={o.settings.hours_goal} />
        </div>
      </section>

      {o.missedInARow >= 2 && !todayDone && <RestartBanner missed={o.missedInARow} />}

      {o.levelUp && (
        <section className={`${card} border-[3px] border-dotted border-fucsia`}>
          <h2 className="text-[17px] font-extrabold">Ready to level up</h2>
          <p className="text-[15px] text-ink-soft">
            3 videos over 90% without rewinding. Pick a harder video for your next session.
          </p>
        </section>
      )}

      <section className="flex flex-col gap-4" aria-label="30-day plan">
        {WEEKS.map((w) => (
          <div key={w.week}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <h2 className="text-[13px] font-extrabold">{w.week === 5 ? "Repaso" : `Semana ${w.week}`}</h2>
              <p className="hidden text-[11px] text-ink-soft sm:block">{w.week === 5 ? w.level_label : w.focus}</p>
            </div>
            {/* The string the week's flags hang from. */}
            <div className="relative">
              <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-ink-soft/35" />
              <ol className="grid grid-cols-7 gap-1.5 pt-[2px] sm:gap-2">
                {Array.from({ length: w.days[1] - w.days[0] + 1 }, (_, i) => w.days[0] + i).map((n, i) => {
                  const state = dayState(n, current, o.done);
                  const mins = o.minutesByDay.get(n);
                  const pct = o.pctByDay.get(n);
                  return (
                    <li key={n} className="sway" style={{ animationDelay: `${-((n * 0.37 + i * 0.5) % 3.4)}s` }}>
                      <FlagDrop day={n} done={state === "done"}>
                        <Link
                          href={`/day/${n}`}
                          aria-label={`Day ${n}, ${STATE_LABEL[state]}${mins ? `, ${mins} minutes` : ""}${
                            pct !== undefined ? `, ${pct}% understood` : ""
                          }`}
                          className="block rounded-sm"
                        >
                          <Pennant
                            day={n}
                            state={state}
                            pct={pct}
                            sub={mins ? `${mins}′` : formatDate(dayDate(start, n))}
                          />
                        </Link>
                      </FlagDrop>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ))}
      </section>

      <section aria-label="Badges">
        <h2 className={`${sectionTitle} mb-3`}>Badges</h2>
        <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-3">
          {o.badges.map((b) => (
            <li key={b.id}>
              <Rosette badge={b} />
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
    <section className={`${card} border-[3px] border-dotted border-cempasuchil`}>
      <h2 className="text-[17px] font-extrabold">Restart with something easy</h2>
      <p className="text-[15px] text-ink-soft">
        {missed} days missed in a row. Skip them, don&apos;t double up. Today just watch one short, easy video.
      </p>
      {easy.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {easy.map((v) => (
            <li key={v.id} className="text-[15px]">
              <a
                href={v.youtube_id ? watchUrl(v.youtube_id) : v.url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-fucsia underline"
              >
                {v.title}
              </a>{" "}
              <span className="text-[13px] text-ink-soft">{v.duration_min} min</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
