# CInput: design brief

This brief is for a designer (human or AI) proposing new themes, styles or design directions for CInput. It describes what the app is, who uses it, every screen and state that exists today, the current visual system, and the constraints a proposal has to respect.

## The product

CInput is a personal web app that guides one learner through **30 days of comprehensible input in Spanish**. Comprehensible input means learning by watching video you mostly understand, not by studying grammar or drilling flashcards.

Each day the app suggests 1 to 3 YouTube videos, each 10 to 20 minutes, for at most 30 minutes in total. Most come from Dreaming Spanish. After watching, the learner:

- logs how many minutes they watched
- rates how much they understood (0 to 100%)
- saves up to 5 phrases worth keeping from each video

Difficulty rises one notch per week, and days 29 to 30 rewatch week-1 videos so the learner can see their progress.

- **Name:** CInput (short for "comprehensible input")
- **Platform:** web app, used mostly on a phone, sometimes on a laptop. It runs locally, with Vercel deployment planned.
- **Users:** a single user, who logs in with one password.
- **Language mix:** the interface is in English. Spanish appears as flavor and content: "Día 4 de 30", "Semana 2", badge names like "Racha de 7", dates in Spanish (`lunes, 2 de noviembre`), and the saved phrases themselves.

## The person

- An adult learner finishing level A2 and heading toward B1, who has already done grammar study and tutor sessions.
- Lives in Puerto de la Cruz, Tenerife (Canary Islands), and prefers Latin American Spanish. Canarian Spanish sounds close to it.
- Uses the app once a day, in a short session of 20 to 30 minutes, often on a phone. Some sessions happen on the go.
- What keeps them going is habit and visible progress: streaks, hours, days done. The app should feel encouraging and a little playful, never like homework.

## Core loop and what the design must support

1. **Open the app and see where I am.** Which day it is, whether today is done, my streak and hours, and which days I missed.
2. **Open today's videos and watch one.** Watching happens on YouTube in a new tab, because Dreaming Spanish blocks embedding.
3. **Log the video.** Minutes, comprehension, and whether I rewound. The app then shows a hint: "Under 75%: pick an easier video", "Right level", or "Over 90%: try a harder video".
4. **Save up to 5 phrases** for that video. After 5, the form disappears.
5. **Once a week,** fill in a short weekly check and review the week's phrases.

## Rules the UI communicates

These come from the method and should stay legible in any redesign:

- **Comprehension sweet spot is 80 to 90%.** Under 75% means go easier; over 90% means go harder.
- **Level-up signal:** 3 videos in a row over 90% without rewinding. This shows a banner and earns a badge.
- **Missed day:** skip it, never double up.
- **Two or more missed days in a row:** a restart banner suggests one short, easy video.
- **Daily cap of 30 minutes,** shown as a progress bar on the day page.
- **Goals:** 25 of 30 days done and 12 hours watched. Both are shown as progress.

## Screens (information architecture)

The navigation has 5 items, shown as a top bar on desktop and a bottom tab bar on mobile: Days, Phrases, Weekly check (short label "Week"), How it works ("How to"), and Settings. There is also a Log out link.

### 1. Login (`/login`)
A single password field, the app name, a one-line tagline ("30 days of Spanish you can understand.") and an error message for a wrong password.

### 2. Board / home (`/`), the signature screen
- **Before the start:** a "Pick your day 1" card with a date picker and a link to How it works.
- **Hero:** a large "Día 4 de 30" that links to today, with a status line underneath ("Open today's videos" or "Done for today…").
- **Stats:** streak 🔥, days done (x/25) and phrases count, plus an **hours ring**: a circular progress ring against the 12-hour goal.
- **Banners (conditional):**
  - "Restart with something easy" (sun-colored border), which lists 2 short videos.
  - "Ready to level up" (pink border).
- **The 30-day grid:** grouped by week (Semana 1 to 4, then Review), 7 columns, with one square tile per day. Each tile shows the day number large, and below it the date (e.g. "3 nov") or the minutes watched (e.g. "26′"). A tile has 4 states:
  - **done:** green, white text. Today's tile "pops" when it turns done.
  - **today:** sun yellow with a soft glow ring.
  - **missed:** faded gray-blue.
  - **upcoming:** white.
- **Badges:** 7 badges in a grid of 2 or 4 columns, each an emoji, a Spanish name and a hint. Earned badges show in full; unearned ones are greyed out. The badges:
  - Primer paso
  - Racha de 7
  - Coleccionista
  - Cinco horas
  - 12 horas
  - 25 días
  - ¡Sube de nivel!

### 3. Day (`/day/[n]`)
- **Navigation:** previous day, All days, next day.
- **Header:** the date in Spanish, a "Today" chip, a large "Día N", the week's focus, the level, and the week's target.
- **Minutes bar:** minutes watched against the 30-minute cap, with the planned minutes next to it.
- **Review note:** on days 29 and 30 only.
- **Video cards, one per suggested video:**
  - a YouTube thumbnail (16:9) with a duration badge
  - title, channel, a level chip (Easy, Intermediate, Upper intermediate, Advanced) and a "Watched" chip
  - **Not watched:** an inline log form with minutes, a comprehension slider with a live hint, a "rewound" checkbox and a "Mark as watched" button, plus a "Remove from this day" link.
  - **Watched:** a summary line with an Undo link, a "Phrases worth keeping 3 of 5" counter, the list of phrases (each with a delete ✕), and an add-phrase form with the phrase, an optional meaning and a "Save phrase" button.
- **"Add your own video":** a collapsible form with YouTube URL, title, channel, minutes and level.

### 4. Phrases (`/phrases`)
All saved phrases grouped by week, newest week first. Each phrase is shown large, with its meaning underneath and a small source line ("Día 4, <video title>"). The empty state links to today.

### 5. Weekly check (`/review`)
One card per week (1 to 4). Each card shows the week's target, computed stats (videos, minutes, average comprehension), a comprehension slider, a "What felt hard" textarea, a "One topic to look for next week" field and a "Save week N" button.

### 6. How it works (`/guide`)
A guide to the method, in cards:
- Every day: a numbered 5-step routine
- Is the video at the right level?
- The 30 days: a week-by-week timeline
- Once a week
- When life gets in the way
- What success looks like

### 7. Settings (`/settings`)
- The start date.
- An "Add a video to the library" form.
- The video library list (64 videos): title, level chip, minutes and channel, each with a Delete link.

## States to design for

- Empty: not started yet, no phrases, no videos on a day.
- Loading: each page streams in with a one-line "Loading…" fallback. Skeletons are welcome.
- Form feedback: a pending "Saving…" button, inline errors (e.g. "Max 5 phrases per video", "Only YouTube links are supported") and success notes.
- Before the start date, during the 30 days, and after day 30 ("¡Terminado!").
- Several missed days, a streak in progress, and the level-up banner.
- The phrase limit reached for a video.

## Current visual system

The current direction is "Canarian coast": playful and game-like, with chunky rounded tiles and a sea-foam background. It is deliberately not the generic cream-and-terracotta look.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0E3B5C` | Text, headings (deep Atlantic blue) |
| `ink-soft` | `#4A6A80` | Secondary text |
| `foam` | `#E8F4F2` | Page background (sea foam) |
| `card` | `#FFFFFF` | Cards, upcoming tiles |
| `bloom` | `#D6246E` | Primary actions, links, focus ring (bougainvillea) |
| `bloom-dark` | `#A8124F` | Button hover |
| `sun` | `#FFC83D` | Today, restart banner, icon dot |
| `leaf` | `#2E9E5B` | Done, progress, success (banana-leaf green) |
| `mist` | `#C7D5DB` | Missed days |
| `line` | `#CFE3E0` | Borders, card shadow line |

- **Type:** Bricolage Grotesque (Google Fonts) is the only family. Headings and day numbers are extra-bold with tight tracking; the day numbers are deliberately huge and act as graphics.
- **Shape:**
  - Cards: radius 24px, with a flat 2px "shadow" in the `line` color instead of a blur.
  - Tiles: radius 16px.
  - Buttons and chips: pill-shaped.
  - Inputs: 12px radius with a 2px border.
- **Motion:** a single tile "pop" when today turns done. Reduced motion is respected. No other decorative motion.
- **Icon / favicon:** a pink rounded tile with a thick white "C" drawn as an arc, and a yellow sun dot in its opening.
- **Copy voice:** plain, short and encouraging, in sentence case. No all-caps labels. Buttons say exactly what they do ("Mark as watched", "Save phrase").

## Constraints

- **Stack:**
  - Next.js 16 (App Router, Cache Components) with Tailwind CSS v4.
  - Tokens live in `src/app/globals.css` under `@theme inline`; the class helpers live in `src/components/ui.tsx`.
  - Fonts load through `next/font/google`.
- **No component library.** Plain Tailwind; a proposal can introduce one only if it clearly earns it.
- **Mobile first:**
  - Works from 360px wide, with a 16px side gutter and no horizontal scrolling.
  - The 7-column grid has to fit on a phone.
  - The bottom tab bar is used on mobile.
- **Accessibility:**
  - WCAG AA contrast, including tile states and chips.
  - A visible keyboard focus.
  - Day state can't be shown by color alone; tiles carry an aria-label, and a visual cue beyond color is welcome.
  - Reduced motion respected.
- **Thumbnails are YouTube images** that the app doesn't control, and they are often loud and colorful. Cards should hold up next to them.
- **Dark mode does not exist yet.** It is a welcome addition, especially for evening sessions.
- **Spanish flavor stays:** the "Día / Semana" labels, Spanish dates and badge names.

## What is open for proposals

- New themes:
  - an alternative palette
  - a dark mode
  - a seasonal or "volcanic Teide" variant, or something else rooted in the Canary Islands or Latin America
- The 30-day board as the memorable element, for example:
  - an alternative to the tile grid, such as a path, map or calendar metaphor
  - richer done states (comprehension shown as fill or intensity)
  - a celebration moment at 25 days or 12 hours
- Gamification: badge art, streak visuals, the hours ring, the level-up moment.
- The phrase bank as something you'd want to reread (a card deck, a notebook).
- Typography pairings, if a second family adds personality without hurting readability.
- Small delights that answer user actions: logging a video, saving the 5th phrase.

## What to keep

- The single-user, one-session-a-day simplicity: at most 2 taps from opening the app to today's videos.
- The method's rules and numbers listed above, kept legible.
- Calm restraint around the memorable element: one bold idea, with the rest quiet.

## Deliverables wanted from a design proposal

1. A short concept: its name, a mood in one or two sentences, and why it fits this learner and place.
2. Tokens: 6 to 10 named colors with hex values (light and dark), the type families and their roles, a type scale, and radius, shadow and spacing rules.
3. The board screen (mobile and desktop) and the day page with one watched and one unwatched video, as mockups or ASCII wireframes.
4. All four tile states, the badges (earned and unearned), and both banners.
5. Notes on motion and on how the proposal meets the accessibility constraints.
6. Optionally, the Tailwind v4 `@theme` block that would replace the current one in `src/app/globals.css`.
