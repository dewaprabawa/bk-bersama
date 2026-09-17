# PLAN.md — BK Bersama roadmap

## Milestone 1 — Mobile-first product surface (done)

The branded, clickable product: landing page, feed with "Semua Cerita" / "Cerita Saya" tabs, story detail with likes and comments, a compose flow, and a profile screen — all mobile-first with a bottom nav app shell. Data is realistic stub content held in a React context (`src/lib/app-store.tsx`) so the feed, likes, and comments feel interactive during this session.

## Milestone 2 — Persistence with Netlify DB (done)

- Designed a schema (`src/db/schema.ts`) with Drizzle ORM: `users`, `stories`, `comments`, `likes` tables.
- Replaced `src/lib/app-store.tsx` with server functions backed by Netlify DB / PostgreSQL (`src/server/stories.functions.ts` & `src/server/profile.functions.ts`).
- Migrated the feed, story detail, compose, and profile screens to read/write real PostgreSQL rows with loaders and mutations.

## Milestone 3 — Authentication & roles

- Add sign-in for students and a separate role for guru BK (counselors), likely via Netlify Identity.
- Gate the profile screen behind a signed-in student; scope "Cerita Saya" to the logged-in user's own stories.
- Give counselor accounts a distinct badge and permissions.

## Milestone 4 — Guru BK moderation view

- A counselor-only screen listing stories that need a response, sorted by urgency/tag (e.g. Kesehatan Mental first).
- Let counselors mark a story as "sedang ditangani" (being handled) or "selesai" (resolved).

## Milestone 5 — Notifications

- Notify a student in-app (and optionally by email via a Netlify Function) when a counselor or peer responds to their story.

## Milestone 6 — Media uploads

- Real photo uploads for profile pictures and optional story attachments, stored in Netlify Blobs, replacing the client-only `FileReader` preview used today.
