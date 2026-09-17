# BK Bersama

BK Bersama ("Guidance Counseling, Together") is a mobile-first story-sharing space for students and school counselors. It reimagines the original [bk_bersama](https://github.com/dewaprabawa/bk_bersama) Flutter app as a responsive web app, built phone-first: student stories, likes, comments, and profile management, wrapped in an app-like shell with a bottom navigation bar.

## What's live right now

- **Landing page** (`/`) — introduces BK Bersama with a peek at real stories.
- **Feed** (`/feed`) — "Semua Cerita" and "Cerita Saya" tabs, story cards with tags, likes, and comment counts.
- **Story detail** (`/feed/:storyId`) — full story, like toggle, and a comment thread you can post to.
- **Compose** (`/compose`) — write and share a new story, choose a topic tag, and post anonymously or not.
- **Konseling** (`/counseling`) — private counseling booking system for students and BK counselors.
- **Inspirasi** (`/inspiration`) — mental health inspirations and practical coping tips powered by AI (Groq).
- **Profile** (`/profile`) — student and counselor profile management with PIN-based security.
- **Admin** (`/admin`) — counselor and student directory management.

All data is persisted in **MongoDB Atlas**.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router) on Vite 7
- Tailwind CSS 4 with a custom "paper & cork" theme (see `src/styles.css`)
- [MongoDB](https://www.mongodb.com/) for reliable document persistence
- `lucide-react` icons
- Deployed on Netlify

## Running locally

```bash
pnpm install
pnpm dev
```

The dev server runs on port 3000. Ensure `MONGODB_URI` is configured in `.env`.
