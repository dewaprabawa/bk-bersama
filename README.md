# BK Bersama

BK Bersama ("Guidance Counseling, Together") is a mobile-first story-sharing space for students and school counselors. It reimagines the original [bk_bersama](https://github.com/dewaprabawa/bk_bersama) Flutter app as a responsive web app, built phone-first: student stories, likes, comments, and profile management, wrapped in an app-like shell with a bottom navigation bar.

## What's live right now

- **Landing page** (`/`) — introduces BK Bersama with a peek at real stories.
- **Feed** (`/feed`) — "Semua Cerita" and "Cerita Saya" tabs, story cards with tags, likes, and comment counts.
- **Story detail** (`/feed/:storyId`) — full story, like toggle, and a comment thread you can post to.
- **Compose** (`/compose`) — write and share a new story, choose a topic tag, and post anonymously or not.
- **Profile** (`/profile`) — the student profile form (name, class, address, phone, photo, bio) plus personal stats.

All content ships with realistic stub data held in memory for this session (see `src/lib/fixtures.ts` and `src/lib/app-store.tsx`). Nothing is persisted to a database yet — that is the next milestone, outlined in `PLAN.md`.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router) on Vite 7
- Tailwind CSS 4 with a custom "paper & cork" theme (see `src/styles.css`)
- `lucide-react` icons
- Deployed on Netlify

## Running locally

```bash
npm install
npm run dev
```

The dev server runs on port 3000 (or via `netlify dev` on port 8888 for full Netlify emulation).

## Roadmap

See `PLAN.md` for the milestones ahead: persistence with Netlify DB, real authentication for students and counselors, moderation tools for guru BK, and notifications.
