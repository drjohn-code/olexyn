# olexyn

Sustainability project with our IP formulation — the **OLEXION** landing page.

OLEXION makes AF‑C1, an applied bio‑based fuel additive ("Chemistry in Motion").
This repository is the marketing site: a single‑page, scroll‑driven cinematic
landing page built with Next.js, with Supabase wired up for future auth/data.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS‑first; theme tokens live in `src/app/globals.css`, no `tailwind.config.js`)
- **Supabase** via `@supabase/supabase-js` + `@supabase/ssr`
- Self‑hosted fonts (Saira / Hanken Grotesk / Space Mono) via `next/font`

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the page.

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Environment variables

Set these in `.env.local` (gitignored — see `.env.example` for the template):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | New‑style publishable key (preferred) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Legacy fallback if the project hasn't migrated to publishable keys |

## Project structure

```
src/
  app/
    layout.tsx              # fonts + metadata
    page.tsx                # renders the landing page
    globals.css             # Tailwind import + OLEXION design system (bespoke CSS/keyframes)
  components/olexion/
    Landing.tsx             # full landing-page markup ('use client')
    scroll-choreography.ts  # hero video scroll-scrub + per-act animation engine
    simulator.ts            # savings calculator + animated stat rings
    validation-reveal.ts    # partner-logo wall flip-in on scroll
  utils/supabase/
    client.ts               # browser client
    server.ts               # server client (cookies via next/headers)
    middleware.ts           # updateSession() session-refresh helper
  middleware.ts             # Next middleware entry (matcher skips static assets)
public/assets/              # hero.mp4, vision image, engine renders, partner logos, brand wordmark
```

## Deploy

Deploys to [Vercel](https://vercel.com/) (already linked). Set the same environment
variables in the Vercel project settings.
