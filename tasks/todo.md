# CInput — Implementation Plan

Sources: `PRD.md`, `V0.md`. Rules: `CLAUDE.md` (no git commands).

## Decisions
- **Day types:** video only, every day. Keep V0 weekly level progression + day 29-30 review. Max 30 min/day, videos 10-20 min.
- **Videos:** curated seed list in Supabase (Dreaming Spanish + video podcasts on YouTube), editable in app. User can also add own URL to a day.
- **Stack:** Next.js (App Router, TS), Tailwind, shadcn/ui, supabase-js, Vercel.
- **Auth:** single password from `.env` (`APP_PASSWORD`). Server action checks it, sets signed httpOnly cookie (HMAC with `AUTH_SECRET`). Proxy/middleware guards all routes except `/login`.
- **Data access:** server-side only via Supabase service role key (no Supabase Auth). RLS on, no public policies, so anon key gets nothing.
- **Design:** playful/gamified, mobile-first. Streak, hours ring, badges.

## Data model — schema `cinput`
- `settings` (single row): `start_date`, `daily_goal_min` (30), `hours_goal` (12), `days_goal` (25)
- `plan_days`: `day_number` 1-30, `week`, `focus`, `level_label`, `target`, `is_review`
- `videos`: `id`, `title`, `youtube_id`, `url`, `channel`, `level` (beginner/intermediate/advanced), `ds_level` (1-7), `duration_min`, `topic`, `is_custom`
- `day_videos`: `day_number`, `video_id`, `position`: suggestions per day, total ≤ 30 min
- `watch_logs`: `id`, `day_number`, `video_id`, `watched_at`, `minutes`, `comprehension_pct`, `rewound` (bool)
- `phrases`: `id`, `watch_log_id`, `phrase`, `meaning`, `note`. A DB trigger enforces **max 5 per video log**.
- `weekly_reviews`: `week`, `comprehension_pct`, `what_felt_hard`, `next_topic` (V0 weekly check)

## Features
1. **Login page:** password field. Wrong password gives an error. The cookie lasts 30 days.
2. **30-day board (home):** grid of 30 day tiles colored by state (done / today / missed / upcoming) and grouped by week with focus + level. Header shows streak, hours ring (x / 12h), days done (x / 25).
3. **Day page:**
   - Week focus, level, target.
   - Suggested videos (embedded YouTube thumbnail + link, duration). A running total shows planned minutes ≤ 30.
   - "Mark watched" for each video, with minutes and a comprehension slider. Below 75% shows a "go easier" hint, above 90% shows "try harder".
   - Up to 5 phrases per watched video, with inline add/edit/delete. The add button is disabled at 5.
   - Option to add your own video URL to the day.
4. **V0 rules surfaced:**
   - Missed day = skipped and never doubled up. After 2 missed days in a row, a banner suggests a 10-min easy video.
   - Level-up badge: 3 videos in a row above 90% without rewinding.
   - Day 29-30 auto-suggest rewatching day 1-7 videos.
5. **Phrase bank:** all phrases, filterable by week, plus a "this week's 5" view.
6. **Weekly check:** short form at the end of each week.
7. **Badges (gamified):** first session, 7-day streak, 5h, 12h, 25 days, level up.
8. **Settings:** start date (changeable), video library editor (add/replace/remove).

## Tasks
- [x] Scaffold Next.js + Tailwind + shadcn in project root
- [x] `.env.example`: `APP_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] SQL migration `supabase/migrations/0001_cinput.sql`: schema, tables, trigger, RLS, grants
- [x] Seed SQL: 30 plan days from V0 + curated video list. Video IDs verified by web lookup; anything unverified is flagged.
- [x] Auth: login action, signed cookie, proxy guard, logout
- [x] Pure logic module + unit tests (vitest): day date calc, day state, streak, missed-in-a-row, level-up signal, minute totals
- [x] Board page
- [x] Day page (videos, watch log, comprehension, phrases)
- [x] Phrase bank, weekly check, settings/library
- [x] Gamification header + badges
- [x] Apply migrations to hkjeldsberg-apps (user ran SQL in dashboard; `db push` blocked by other apps' migration history)
- [x] Verify: tests green, `next build` clean, browser run-through of login → log video → 5 phrases → 6th blocked
- [ ] Deploy to Vercel (after confirmation)

## Answers
- Supabase project: hkjeldsberg-apps (yejedgolubpfgxufsmnl). Day 1 chosen in app. Local only first.
- Deviation: plain Tailwind instead of shadcn (few components, fewer deps).
- Videos: 64 checked (43 Dreaming Spanish, link-out because DS blocks embedding).

## Open questions before build (resolved)
1. Supabase project: do you have one already (URL + service role key)? Should I apply the migration via Supabase CLI, or will you paste the SQL into the dashboard? Note: `cinput` must be added under API → Exposed schemas.
2. Start date for day 1: today (2026-11-02) or pick in app?
3. Vercel deploy now, or local only first?

## Review
- 22 unit tests pass (dates, streaks, V0 rules, video assignment, session token, YouTube URL parsing). tsc, eslint, `next build` clean.
- DB: 30 plan days, 64 videos, 53 day assignments seeded. 5-phrase trigger tested directly (6th rejected). Unauthenticated REST request returns 401.
- Browser run-through: wrong password rejected; start date set; board states (missed/today/done), restart banner, streak, hours ring; log video; 5 phrases saved then form replaced; phrase bank, weekly check, settings render. Test data deleted afterwards, start date reset to null.
- Fixes found during verification: `connection()` before session time check (Cache Components), restart banner shows real missed count, English login error, review row label.
- Not verified: logging in through the form in the automated tab (user logged in elsewhere; the session was tested with a token made from the dev AUTH_SECRET). Mobile layout checked by design only, not on a device.

---

# Redesign: "Papel picado" (design/04 Papel picado.pdf)

## Plan
- [x] Tokens light + dark (ink, ink-soft, ground, card, fucsia, morado, verde, cempasúchil, papel) as CSS vars; `@theme inline` maps them. Dark via `prefers-color-scheme`.
- [x] Fonts: Bagel Fat One (display, day numbers), Nunito Sans (body/UI). Scale 52/30/22/15/13/11.
- [x] Pennant tile component: zig-zag flag hanging from a week "string".
  - done: colored (morado/verde/fucsia cycling by day) + lace: 1 row <80%, 2 rows ≥80%, marigold center ≥90%
  - today: cempasúchil · missed: torn flag, faded · upcoming: papel
  - sway 3.4s (reduced-motion off); first time a day is seen done the flag drops in (CSS spring, once per day via localStorage)
  - confetti of flags once when days goal (25) is reached
- [x] Board: hero (date, Día N de 30, link), stats in display numbers + fucsia hours ring, dotted banners, rosette badges with progress text
- [x] Nav: active pill (fucsia) top and bottom; client NavLinks with usePathname
- [x] Buttons: fucsia pill with morado ledge; level chips recolored; log form "Comprehension · 86% · Right level"
- [x] Restyle day, phrases, review, guide, settings, login (garland on login); icons to pennant
- [x] Verify: tests, tsc, lint, build; browser desktop + 390px mobile, light + dark; log/phrase/undo/remove/add flows still work; clean test data

## Review
- Implemented per design/04: tokens light+dark, Bagel Fat One + Nunito Sans, pennant garlands with lace/marigold/torn states, sway, drop-in, confetti, rosette badges with progress, dotted banners, active nav pills, fucsia ledge buttons, recolored level chips, pennant icons.
- Deviations: CSS keyframes instead of framer-motion (same spring-drop look, no new dependency). Marigold dot sits inline before the minutes so small phone flags don't overflow. Desktop "Log out" moved to Settings so header and content share one column; mobile keeps it in the header.
- Verified in Chrome: desktop 1728px and phone frames at 390px and 360px (no horizontal scroll), light and forced dark. Flows: log video (live hint), add/delete phrase, undo, add own video, remove from day, weekly check save. 23 tests, tsc, eslint, `next build` clean. Test data removed, start date reset.
- Not verified: real iOS/Android device; OS-level dark mode switch (dark tested by applying the stylesheet's dark rules).
