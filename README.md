# Modern Automobiles

Bike-service platform: customers book a service (pickup or drop-off), approve a quote
before repairs begin, and track appointment and repair status live.

## Stack

| Layer | Choice | Status |
| --- | --- | --- |
| Web app | Next.js 16 (App Router) + React 19 + TypeScript | in use |
| Styling | Tailwind CSS v4, design tokens in `src/app/globals.css` | in use |
| Database | PostgreSQL + Prisma | planned |
| Auth | Auth.js with phone/email OTP login; role-based access (customer / staff / admin) | planned |
| Live status updates | Server-Sent Events (upgrade to a managed realtime service if needed) | planned |
| Notifications | SMS / WhatsApp / email on status change and quote ready | planned |
| Validation | Zod on every server input | planned |
| Hosting | Vercel (app) + managed Postgres (Neon/Supabase), Sentry for errors | planned |

## Design tokens (sampled from the approved home-page design)

`brand #D8191F` · `brand-logo #E61920` · `ink #0A0A0A` · `stage #202121` · `cream #FCF8F1` · `field #F7F3EC`
Fonts: Anton (headline), Barlow Condensed (brand / labels / buttons), Barlow (body).

## Placeholders to replace

- `src/lib/catalog.ts` — branches, brands and models are sample data.
- `src/components/logo.tsx` — the "MA" mark is redrawn from a screenshot; swap in the official SVG.
- `/track`, `/book` and `/plans/*` are not built yet (they currently show the 404 screen).

## Error & status pages

| Screen | Where | Notes |
| --- | --- | --- |
| 404 | `src/app/not-found.tsx` | any unknown URL / `notFound()` |
| 500 | `src/app/error.tsx` | page-level errors; "Try again" re-renders the page; shows a reference id |
| 500 (layout) | `src/app/global-error.tsx` | last resort when the root layout itself fails |
| 503 maintenance | `src/app/maintenance/page.tsx` + `src/proxy.ts` | see below |
| Offline | `src/app/offline/page.tsx` + `public/sw.js` | shown by the service worker when a page can't load without a connection (production only) |

All of them share `src/components/error-screen.tsx`; artwork is in `public/images/errors/` (made from `assets/error_page_images`).

**Maintenance mode:** set `MAINTENANCE_MODE=1` (hosting dashboard or `.env.local`) and every page answers with the maintenance screen and a real HTTP `503` + `Retry-After`. Unset it to go live again — visitors on the maintenance screen are sent back automatically (it re-checks `/api/health` every 20s). Preview the screen any time at `/maintenance?preview`.

## Images (build scripts)

Source images live in `assets/`; the site uses processed copies in `public/images/`. After replacing an image in `assets/`, run the matching script (output files get a content hash in their name, so browsers never show a stale copy):

| Command | Source folder | What it does |
| --- | --- | --- |
| `npm run images:how` | `assets/how_modernautomobiles_images` (`01-…` to `05-…`) | enlarges, sharpens and adds fine grain to the "How it works" photos |
| `npm run images:parts` | `assets/parts_oil_images` | turns the brand logos into crisp white (or outlined colour) logos for the "Parts & oils we use" carousel |

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```
