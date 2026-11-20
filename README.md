# Maadan Automobiles

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
- `src/lib/app.ts` — paste the real Google Play / App Store links into `APP_LINKS` (the badges just scroll to the section until then).
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


## Rider login (`/login`) — UI preview

`/login?next=/some/path` is the rider sign-in: a red toolbox on a workshop bench; tapping the drawer front slides it open and an SMS-code form appears in the tray (mobile number → verification code → "Signed in" → redirect to `next`, default `/`). The pictures come from `assets/Modern-Automobiles-Toolbox` (`npm run images:toolbox`); the header, heading, labels, fields and buttons are live HTML. Esc or "Close" shuts the drawer and returns focus to the handle; reduced-motion users get the form straight away.

**There is no authentication backend in this project yet, so the screen runs on a clearly labelled preview stand-in** (a "UI preview · no SMS is sent · code 123456" note is shown in the drawer). Integration points — everything lives in `src/lib/rider-auth.ts`:

| Function | Replace with | Expected response |
| --- | --- | --- |
| `sendCode(phone)` | `POST /api/auth/otp/send { phone: "+91…" }` | `200 { codeLength, expiresInSec, resendAfterSec }`; `429 { retryAfterSec }` |
| `verifyCode(phone, code)` | `POST /api/auth/otp/verify { phone, code }` | `200 { redirectTo? }` + session cookie; `401` wrong code; `410` expired; `429` too many tries |

Map HTTP failures to `AuthError("invalid" \| "expired" \| "rate_limited" \| "invalid_phone" \| "server")` and a thrown `fetch` to `AuthError("network")` — the screen already shows the matching inline message and keeps what the rider typed. Code length, expiry and the resend delay are read from the send response (nothing is hard-coded in the UI). Then set `AUTH_IS_PREVIEW = false` and delete the `preview*` functions. The destination (`next`) is only followed after `verifyCode` resolves and only if it is a same-site path (`safeNext`). Preview helpers for testing the error paths: number `90000 00000` fails once with a network error; code `000000` fails once; any other code than `123456` is "invalid".

## Images (build scripts)

Source images live in `assets/`; the site uses processed, content-hashed copies in `public/images/` (served as static, immutable files, so there is no on-demand image processing after a deploy). After replacing an image in `assets/`, run the matching script (output files get a content hash in their name, so browsers never show a stale copy):

| Command | Source folder | What it does |
| --- | --- | --- |
| `npm run images` | all of the below | runs everything in one go |
| `npm run images:hero` | `assets/home_page_image.png` | crops, enlarges, sharpens and exports the home hero as small responsive WebP files + an instant blurred preview |
| `npm run images:site` | `assets/bike_service_images`, `assets/maintenace_plans` | converts the service and plan pictures (and the menu thumbnails) to small WebP files |
| `npm run images:app` | `assets/Modern-Automobiles-App-Promo-Assets` | builds the phone photo, feature icons and store badges for the "Your bike service, in your pocket" section |
| `npm run images:about` | `assets/Modern-Automobiles-About-Us-Assets` | builds the team photo and the three "What you can expect" icons for the About us section |
| `npm run images:footer` | `assets/Modern-Automobiles-Footer-Assets` | builds the motorcycle drawing for the site footer |
| `npm run images:loading` | `assets/Modern-Automobiles-Loading-Screen-Assets` | builds the motorcycle drawing for the loading screen / first-visit splash (the brand lockup there is live text) |
| `npm run images:toolbox` | `assets/Modern-Automobiles-Toolbox/assets` | repairs and crops the workshop/cabinet picture and builds the drawer front and tray for the rider login |
| `npm run images:how` | `assets/how_modernautomobiles_images` (`01-…` to `05-…`) | enlarges, sharpens and adds fine grain to the "How it works" photos |
| `npm run images:parts` | `assets/parts_oil_images` | turns the brand logos into crisp white (or outlined colour) logos for the "Parts & oils we use" carousel |

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```
