import { Suspense } from "react";
import { deleteVideo } from "@/app/actions";
import { AddLibraryVideoForm, StartDateForm } from "@/components/forms";
import { btnGhost, card, LevelChip } from "@/components/ui";
import { getStartDate, getVideos, today } from "@/lib/data";
import { watchUrl } from "@/lib/youtube";

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold">Settings</h1>
      <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const [start, videos] = await Promise.all([getStartDate(), getVideos()]);
  return (
    <>
      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Start date</h2>
        <StartDateForm defaultValue={start ?? today()} submitLabel="Save start date" />
      </section>

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Add a video to the library</h2>
        <AddLibraryVideoForm />
      </section>

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">
          Video library <span className="text-base font-normal text-ink-soft">{videos.length}</span>
        </h2>
        <ul className="flex flex-col divide-y-2 divide-foam">
          {videos.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <a
                  href={v.youtube_id ? watchUrl(v.youtube_id) : v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-semibold hover:text-bloom"
                >
                  {v.title}
                </a>
                <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  <LevelChip level={v.level} />
                  {v.duration_min} min, {v.channel}
                </p>
              </div>
              <form action={deleteVideo}>
                <input type="hidden" name="id" value={v.id} />
                <button className={btnGhost} aria-label={`Delete ${v.title}`}>
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
