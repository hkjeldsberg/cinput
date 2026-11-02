import { Suspense } from "react";
import { deleteVideo, logout } from "@/app/actions";
import { AddLibraryVideoForm, StartDateForm } from "@/components/forms";
import { btn, btnGhost, card, LevelChip, pageTitle, sectionTitle } from "@/components/ui";
import { getStartDate, getVideos, today } from "@/lib/data";
import { watchUrl } from "@/lib/youtube";

export default function SettingsPage() {
  return (
    <>
      <h1 className={pageTitle}>Settings</h1>
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
        <h2 className={`${sectionTitle} mb-3`}>Start date</h2>
        <StartDateForm defaultValue={start ?? today()} submitLabel="Save start date" />
      </section>

      <section className={card}>
        <h2 className={`${sectionTitle} mb-3`}>Add a video to the library</h2>
        <AddLibraryVideoForm />
      </section>

      <section className={card}>
        <h2 className={`${sectionTitle} mb-3`}>
          Video library <span className="text-[15px] font-normal text-ink-soft">{videos.length}</span>
        </h2>
        <ul className="flex flex-col divide-y-2 divide-papel">
          {videos.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <a
                  href={v.youtube_id ? watchUrl(v.youtube_id) : v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-bold hover:text-fucsia"
                >
                  {v.title}
                </a>
                <p className="flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
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
      <section className={`${card} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-[15px] text-ink-soft">Signed in on this device for 30 days.</p>
        <form action={logout}>
          <button className={btn}>Log out</button>
        </form>
      </section>
    </>
  );
}
