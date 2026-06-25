# AskHero Deal Room

Standalone full-stack transaction workspace for AskHero. It activates when a buyer is ready to make an offer and guides offer building, negotiation, and closing.

## Stack

- React 18
- React Router v6
- Tailwind CSS
- Node 20
- Express
- PostgreSQL
- Prisma
- Socket.io
- Anthropic Claude API
- JWT auth
- Resend email
- Twilio SMS
- AWS S3, HelloSign, and Blend integration-ready environment variables

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Create a PostgreSQL database and set `DATABASE_URL`.

4. Run Prisma migration:

```bash
npm run prisma:migrate
```

5. Seed local test fixtures:

```bash
npm run prisma:seed
```

The seed data is local test fixture data for development only. It is not used by the main AskHero public listing platform.

6. Run both client and server:

```bash
npm run dev
```

## Local URLs

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

## Test Accounts

- Buyer: `buyer1@test.com` / `test123`
- Buyer: `buyer2@test.com` / `test123`
- Agent: `agent1@test.com` / `test123`
- Agent: `agent2@test.com` / `test123`

## API Keys

- `ANTHROPIC_API_KEY`: Claude AI offer and negotiation analysis
- `RESEND_API_KEY`: Email notifications
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: SMS alerts
- `HELLOSIGN_API_KEY`: Future e-signature workflow
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`: Future offer document storage through the modular AWS S3 client
- `BLEND_API_KEY`: Future mortgage pre-qualification embed

## Routes

- `/login`
- `/onboard`
- `/dashboard`
- `/deal/:dealId`
- `/agent`

## Backend Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/deals`
- `GET /api/deals/:id`
- `GET /api/deals/buyer/:buyerId`
- `GET /api/deals/agent/:agentId`
- `PATCH /api/deals/:id/status`
- `POST /api/offers`
- `GET /api/offers/deal/:dealId`
- `POST /api/negotiations/analyze`
- `POST /api/negotiations/counter`
- `GET /api/agents/leads`
- `GET /api/agents/:id/deals`
- `POST /api/agents/message`
- `POST /api/ai/offer-suggestion`
- `POST /api/ai/counter-analysis`
- `POST /api/ai/closing-coach`
- `GET /api/properties/:id`
- `GET /api/properties/search`
