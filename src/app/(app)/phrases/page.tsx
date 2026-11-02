import Link from "next/link";
import { Suspense } from "react";
import { card, pageTitle, sectionTitle } from "@/components/ui";
import { getPhrases, type PhraseRow } from "@/lib/data";
import { weekOf } from "@/lib/plan";

export default function PhrasesPage() {
  return (
    <>
      <h1 className={pageTitle}>Your phrases</h1>
      <Suspense fallback={<p className="text-ink-soft">Loading phrases…</p>}>
        <Phrases />
      </Suspense>
    </>
  );
}

async function Phrases() {
  const phrases = await getPhrases();
  if (phrases.length === 0) {
    return (
      <p className={card}>
        No phrases yet. After you mark a video as watched, save up to 5 phrases from it.{" "}
        <Link href="/" className="font-bold text-fucsia underline">
          Go to today
        </Link>
      </p>
    );
  }

  const byWeek = new Map<number, PhraseRow[]>();
  for (const p of phrases) {
    const w = weekOf(p.watch_logs.day_number);
    byWeek.set(w, [...(byWeek.get(w) ?? []), p]);
  }

  return (
    <>
      <p className="text-ink-soft">
        Use a few of this week&apos;s phrases in one real exchange: a shop, a bar, or your tutor.
      </p>
      {[...byWeek.entries()]
        .sort(([a], [b]) => b - a)
        .map(([week, rows]) => (
          <section key={week} className={card}>
            <h2 className={`${sectionTitle} mb-3`}>
              {week === 5 ? "Review days" : `Semana ${week}`}{" "}
              <span className="text-[15px] font-normal text-ink-soft">{rows.length} {rows.length === 1 ? "phrase" : "phrases"}</span>
            </h2>
            <ul className="flex flex-col divide-y-2 divide-papel">
              {rows.map((p) => (
                <li key={p.id} className="py-2">
                  <p className="text-[17px] font-bold">{p.phrase}</p>
                  {p.meaning && <p className="text-ink-soft">{p.meaning}</p>}
                  <p className="text-[11px] text-ink-soft">
                    <Link href={`/day/${p.watch_logs.day_number}`} className="hover:underline">
                      Día {p.watch_logs.day_number}
                    </Link>
                    , {p.watch_logs.videos.title}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  );
}
