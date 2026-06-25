# AskHero Platform

AskHero is an AI-powered real estate search and home-buying intelligence platform for `https://askhero.net`.

This repo contains:

- Main AskHero platform: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, Supabase, Resend, Google Analytics, Microsoft Clarity, and Vercel support.
- Standalone Deal Room workspace: `askhero-deal-room/`, a React/Express/Prisma/Socket.io transaction workspace.

## Main Platform Features

- Premium dark navy, white, and gold public site
- Homepage, search, listing detail, Hero Score, For Realtors, About, Contact, Privacy, Terms
- Supabase Auth-ready buyer and realtor login flow
- Buyer dashboard for saved homes, saved searches, comparisons, and inquiry history
- Realtor dashboard with manual listing submission
- Admin dashboard protected by `ADMIN_PASSWORD`
- CSV export for users, waitlist, realtor profiles, listings, leads, contact messages, realtor signups, and audit logs
- Supabase SQL schema with RLS policies
- Manual listing upload and approval-ready data model
- API-ready IDX/RESO provider architecture
- Modular Hero Score engine
- Resend email notifications
- Google Analytics and Microsoft Clarity support

The public search page displays "Real listings coming soon" until approved real listings exist. No fake public listings, addresses, prices, or user-count claims are included in the main platform.

## Main Platform Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. Run the SQL in:

```text
supabase/schema.sql
```

4. Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=hello@askhero.net
CONNECT_EMAIL=connect@askhero.net
ADMIN_PASSWORD=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

5. Run locally:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Main Platform URLs

- `/`
- `/search`
- `/listings/[id]`
- `/hero-score`
- `/for-realtors`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/login`
- `/dashboard`
- `/dashboard/listings/new`
- `/realtor/dashboard`
- `/admin`

## API Routes

- `POST /api/waitlist`
- `POST /api/contact`
- `POST /api/realtor-signup`
- `POST /api/listings/manual`
- `POST /api/listings/builder`
- `POST /api/listings/builder/confirm`
- `POST /api/listings/build`
- `POST /api/listings/[id]/enrich`
- `POST /api/listings/[id]/confirm`
- `GET /api/listings/search`
- `GET /api/listings/[id]`
- `POST /api/leads`
- `POST /api/saved-homes`
- `POST /api/saved-searches`
- `POST /api/comparisons`
- `GET /api/admin/export?table=...`
- `PATCH /api/admin/listings/[id]/approval`
- `PATCH /api/admin/realtors/[id]/approval`

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase Auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only API/admin database key |
| `RESEND_API_KEY` | Email sending |
| `ADMIN_EMAIL` | Admin alert recipient |
| `CONNECT_EMAIL` | Buyer lead email identity |
| `ADMIN_PASSWORD` | `/admin` password |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Optional Microsoft Clarity |
| `CRIME_PROVIDER` | Crime provider mode. Use `auto` to prefer Crimeometer, then FBI CDE, then unavailable. |
| `ATTOM_API_URL` | Optional ATTOM property detail endpoint override. |
| `FEMA_PROVIDER` | Flood provider mode. Use `public` for FEMA public data. |
| `FEMA_OPENFEMA_BASE_URL` | OpenFEMA public API base URL. |
| `FEMA_NFHL_BASE_URL` | FEMA NFHL public service base URL. |
| `CRIMEOMETER_API_KEY` | Optional Crimeometer API key for Hero Crime Signal. |
| `FBI_CRIME_BASE_URL` | FBI Crime Data Explorer base URL. Default: `https://api.usa.gov/crime/fbi/cde`. |
| `FBI_CRIME_API_KEY` | Optional api.data.gov key for FBI Crime Data Explorer fallback. |


Hero Listing Builder uses only user-provided facts unless `PROPERTY_HISTORY_API_URL` is configured. Do not connect random scraped listing pages; use a licensed property data provider or an internal enrichment endpoint that returns verified facts.


Provider enrichment is optional and safe by default. If a provider API key is missing, AskHero stores a clear unavailable message and continues draft creation. Do not scrape public listing websites or invent property facts.

### Hero Crime Signal

AskHero chooses crime data providers in this order when `CRIME_PROVIDER=auto`:

1. `CRIMEOMETER_API_KEY`
2. `FBI_CRIME_API_KEY`
3. Unavailable provider status

FBI Crime Data Explorer data is public law-enforcement reporting data and may not reflect real-time conditions or neighborhood-level conditions. AskHero stores the normalized result in `listing_enrichment.crime_data` and shows provider status in the admin dashboard.

For local development only, test the FBI fallback with:

```bash
http://localhost:3000/api/debug/fbi-crime?city=Concord&state=NC
```

### Hero Flood Signal

AskHero uses FEMA public flood hazard data for Hero Flood Signal. No FEMA API key is required.

Set:

```bash
FEMA_PROVIDER=public
FEMA_OPENFEMA_BASE_URL=https://www.fema.gov/api/open
FEMA_NFHL_BASE_URL=https://hazards.fema.gov
GOOGLE_MAPS_API_KEY=
```

When listing coordinates are available, AskHero queries FEMA directly. When coordinates are missing, AskHero uses Google Maps geocoding first. If geocoding or FEMA data is unavailable, listing creation continues and flood data is marked unavailable.

Local debug route:

```bash
http://localhost:3000/api/debug/fema-flood?address=9545%20Valencia%20Avenue%20NW%2C%20Concord%2C%20NC%2028027
http://localhost:3000/api/debug/fema-flood?lat=35.4&lng=-80.7
```

Limitations: FEMA public flood hazard data may not reflect all insurance, lender, local drainage, stormwater, or real-time conditions. AskHero does not estimate flood insurance premiums and does not claim any property is safe from flooding.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import into Vercel.
3. Set framework preset to Next.js.
4. Add the environment variables above.
5. Deploy.
6. Add `askhero.net` in Vercel Domains.
7. Update DNS using Vercel's records.
8. Verify `askhero.net` in Resend before sending from `hello@askhero.net` or `connect@askhero.net`.

## MLS/IDX/RESO Guide

See:

```text
docs/mls-idx-integration.md
```

AskHero does not claim MLS access. Broker/MLS approval and data-provider credentials are required before live feed integration.

## Deal Room

The transaction workspace lives at:

```text
askhero-deal-room/
```

See `askhero-deal-room/README.md` for its React/Express/Prisma setup, seed data, Socket.io events, and local test URLs.

## Verification

```bash
npm run lint
npm run build
```
