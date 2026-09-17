# AGENTS.md

This document orients AI agents (and humans) working on this codebase.

## Project overview

BK Bersama is a mobile-first story-sharing web app for students and school counselors (guru BK), rebuilt from the original Flutter app [bk_bersama](https://github.com/dewaprabawa/bk_bersama). It is a multi-screen product; the current milestone ships the full UI surface with in-memory stub data. See `PLAN.md` for the roadmap (persistence, auth, moderation, notifications) — start there before adding backend work.

### Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (custom "paper & cork" theme, no shadcn) |
| Database | MongoDB Atlas (official `mongodb` driver) |
| Icons | lucide-react |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory structure

```
├── content/posts/blog-entry-1.md   # Inert content-collections leftover from the base template, unused by any route
├── content-collections.ts          # Same — kept only so the vite plugin has a valid collection to process
├── public/
├── src/
│   ├── components/
│   │   ├── app-top-bar.tsx     # Sticky header used by every /_app screen (title, optional back button)
│   │   ├── bottom-nav.tsx      # App-shell bottom navigation (Beranda / Tulis / Profil)
│   │   ├── story-card.tsx      # Feed + landing story preview card
│   │   └── tag-chip.tsx        # Category pill (Akademik, Pertemanan, ...)
│   ├── lib/
│   │   ├── fixtures.ts         # Stub stories, comments, and the current user profile
│   │   ├── app-store.tsx       # React context holding session-local stories/likes/comments state
│   │   └── utils.ts            # cn() class merge helper
│   ├── routes/
│   │   ├── __root.tsx          # Document shell, meta tags
│   │   ├── index.tsx           # Landing page (marketing, outside the app shell)
│   │   ├── _app.tsx            # Pathless layout: mobile app shell + bottom nav, wraps AppStoreProvider
│   │   ├── _app.feed.tsx       # /feed — tabs + story list
│   │   ├── _app.feed.$storyId.tsx  # /feed/:storyId — story detail, likes, comments
│   │   ├── _app.compose.tsx    # /compose — write a new story
│   │   └── _app.profile.tsx    # /profile — profile form + stats
│   └── styles.css              # Tailwind import, @theme tokens, grain/cork/washi-tape effects
├── PLAN.md                     # Milestone roadmap — read before starting backend work
└── README.md
```

## Key concepts

### Data flow (current milestone)

There is no database yet. `AppStoreProvider` (`src/lib/app-store.tsx`) seeds state from `fixtures.ts` and exposes `addStory`, `toggleLike`, `addComment`. All app screens (`/feed`, `/feed/:storyId`, `/compose`, `/profile`) read from `useAppStore()`, so new stories/likes/comments persist for the session but reset on reload. When implementing Milestone 2, replace this context with server functions reading/writing Netlify DB — the screens' data shape (`Story`, `Comment` types in `fixtures.ts`) should carry over largely unchanged.

### App shell vs. landing page

`/` (landing) is a standalone marketing page with no bottom nav. Every other screen lives under the pathless `_app` layout route, which renders the phone-frame shell (`max-w-[440px]`, cork background behind it on wide viewports) and the fixed bottom nav. New app screens should be added as `_app.<name>.tsx` files so they inherit the shell.

### Styling

- Tailwind v4 `@theme` tokens in `src/styles.css` define the palette (`paper`, `ink`, `forest`, `terracotta`, `cork`, `gold`, `rose`) and fonts (`font-display` = Fraunces, `font-body` = Karla). Use these tokens (`bg-paper`, `text-forest-dark`, etc.) rather than introducing new ad-hoc colors.
- No shadcn/Radix UI components are used — custom markup styled directly with Tailwind utility classes, matching the "paper journal on a corkboard" aesthetic.

## Conventions

- Components: PascalCase filenames are not used; files are kebab-case (`story-card.tsx`), exported functions are PascalCase.
- Routes: TanStack Router file-based dot-notation (see above).
- Import paths use the `@/` alias for `src/*`.
- Indonesian is the UI language throughout (the target audience is Indonesian secondary school students and counselors) — keep new copy in Indonesian for consistency.

## Development commands

```bash
npm install
npm run dev      # Vite dev server on port 3000
npm run build    # Production build
```
