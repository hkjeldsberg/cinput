import Link from "next/link";
import { card } from "@/components/ui";
import { WEEKS } from "@/lib/plan";

export default function GuidePage() {
  return (
    <>
      <div>
        <h1 className="text-4xl font-extrabold">How it works</h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          You learn by watching Spanish you mostly understand, every day, for 30 days. No flashcards, no grammar
          drills. Up to 30 minutes a day is enough.
        </p>
      </div>

      <section className={card}>
        <h2 className="text-xl font-bold">Every day</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-3 pl-5 marker:font-bold marker:text-bloom">
          <li>
            Open <Link href="/" className="font-semibold text-bloom underline">today&apos;s tile</Link> and pick 1 to 3
            of the suggested videos. Choose topics you actually care about. Bored is a reason to switch topic, not to
            stop.
          </li>
          <li>
            Watch without subtitles. If you lose a key sentence, rewind once. Otherwise keep going: you don&apos;t need
            every word.
          </li>
          <li>
            Mark the video as watched. Enter the minutes and roughly how much you understood. Be honest; the number
            steers the next video.
          </li>
          <li>
            Save up to 5 phrases worth keeping: chunks you would actually say, like <em>me cae bien</em> or{" "}
            <em>no pasa nada</em>. Not every new word.
          </li>
          <li>That&apos;s the day. The tile turns green and your streak grows.</li>
        </ol>
      </section>

      <section className={card}>
        <h2 className="text-xl font-bold">Is the video at the right level?</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <strong className="text-leaf">80 to 90% understood</strong> is the sweet spot. Stay there.
          </li>
          <li>
            <strong className="text-bloom">Under 75%</strong>, or you&apos;re translating in your head: too hard. Pick
            an easier video next time.
          </li>
          <li>
            <strong>Over 90%</strong>: try something harder. Three videos in a row over 90% without rewinding earns
            the level-up badge.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-xl font-bold">The 30 days</h2>
        <p className="mt-1 text-ink-soft">Difficulty rises one notch per week. The suggested videos follow along.</p>
        <ol className="mt-3 flex flex-col gap-3">
          {WEEKS.map((w) => (
            <li key={w.week} className="flex gap-3">
              <span className="w-24 shrink-0 font-bold">
                {w.week === 5 ? "Días 29–30" : `Semana ${w.week}`}
              </span>
              <span>
                <span className="font-semibold">{w.focus}.</span>{" "}
                <span className="text-ink-soft">
                  {w.level_label}. By the end: {w.target.charAt(0).toLowerCase() + w.target.slice(1)}.
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={card}>
        <h2 className="text-xl font-bold">Once a week</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            Fill in the <Link href="/review" className="font-semibold text-bloom underline">weekly check</Link>: how
            much you understood, what felt hard, one topic to look for next week. Under 5 minutes.
          </li>
          <li>
            Use a few of the week&apos;s <Link href="/phrases" className="font-semibold text-bloom underline">phrases</Link>{" "}
            in one real exchange: a shop, a bar, or your tutor.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-xl font-bold">When life gets in the way</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>Missed a day? Skip it. Never double up the next day.</li>
          <li>Two missed days in a row? Restart with one short, easy video. The board suggests one.</li>
          <li>
            Extra listening on walks or while cooking is a bonus. Add it to a day with &quot;Add your own
            video&quot;, but it never replaces the daily session.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-xl font-bold">What success looks like</h2>
        <p className="mt-2">
          25 of 30 days done, 12+ hours watched, and normal-speed Intermediate videos feeling easy by week 4. On days
          29 and 30 you rewatch week-1 videos and notice how much more you catch.
        </p>
      </section>
    </>
  );
}
