import { Suspense } from "react";
import { ReviewForm } from "@/components/forms";
import { card } from "@/components/ui";
import { getReviews } from "@/lib/data";
import { WEEKS } from "@/lib/plan";

export default function ReviewPage() {
  return (
    <>
      <div>
        <h1 className="text-4xl font-extrabold">Weekly check</h1>
        <p className="mt-1 text-ink-soft">Under 5 minutes, once a week.</p>
      </div>
      <Suspense fallback={<p className="text-ink-soft">Loading weeks…</p>}>
        <Reviews />
      </Suspense>
    </>
  );
}

async function Reviews() {
  const { reviews, logs, plan } = await getReviews();
  const weekOfDay = new Map(plan.map((d) => [d.day_number, d.week]));

  return WEEKS.filter((w) => w.week <= 4).map((w) => {
    const weekLogs = logs.filter((l) => weekOfDay.get(l.day_number) === w.week);
    const minutes = weekLogs.reduce((s, l) => s + l.minutes, 0);
    const avg = weekLogs.length
      ? Math.round(weekLogs.reduce((s, l) => s + l.comprehension_pct, 0) / weekLogs.length)
      : null;
    const saved = reviews.find((r) => r.week === w.week);
    return (
      <section key={w.week} className={card}>
        <h2 className="text-xl font-bold">Semana {w.week}</h2>
        <p className="text-sm text-ink-soft">Target: {w.target}</p>
        <p className="my-3 text-sm">
          {weekLogs.length} videos, {minutes} min
          {avg !== null && <>, average comprehension {avg}%</>}
        </p>
        <ReviewForm
          week={w.week}
          defaults={{
            comprehension_pct: saved?.comprehension_pct ?? avg ?? 80,
            what_felt_hard: saved?.what_felt_hard ?? "",
            next_topic: saved?.next_topic ?? "",
          }}
        />
      </section>
    );
  });
}
