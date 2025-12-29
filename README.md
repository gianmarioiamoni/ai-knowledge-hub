# AI Knowledge Hub
Multi-tenant RAG platform (Next.js + Supabase + LangChain + OpenAI) to ingest documents, chat with contextual answers, and generate SOPs. Includes subscriptions (Stripe), contact center with email notifications (Nodemailer), and bilingual UX (en/it).

## Core Features
- Document ingestion to pgvector (Supabase) via PDF upload.
- RAG Chat on ingested knowledge with context inspection.
- SOP generation and export (Markdown/PDF).
- Multi-tenant auth with Supabase + RLS.
- Subscriptions and billing (Stripe checkout, webhook sync).
- Contact form with admin/user emails (Nodemailer).
- Help Center with manuals (EN/IT), FAQ, quick links.

## Tech Stack (what we use and why)
- **Next.js 15 (App Router, RSC-first)**: server-first rendering, locale-aware routing, API routes, server actions.
- **Tailwind CSS + shadcn UI + Radix primitives**: consistent, accessible UI components and fast styling.
- **Supabase Auth + RLS**: multi-tenant authentication and row-level security to isolate tenants.
- **Supabase Storage + Postgres + pgvector**: store source docs and vector embeddings for retrieval.
- **LangChain**: text splitting, embeddings generation, retrieval orchestration (top-k context).
- **OpenAI (GPT-4.1 / -mini)**: embeddings + generation for RAG answers and SOP drafting.
- **Stripe**: checkout, subscription lifecycle, webhooks for plan sync.
- **Nodemailer** (Gmail shortcut or SMTP): transactional emails (contact, signup, plan changes, reminders).
- **Sentry (optional)**: error monitoring hook via env.

## Getting Started
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Environment (.env.local)
Minimum (use either Gmail shortcut or SMTP):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# Email (option 1 – Gmail)
GMAIL_USER=
GMAIL_APP_PASSWORD=
# Email (option 2 – SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

ADMIN_EMAIL=           # admin notifications (or SUPERADMIN_EMAIL)
SUPERADMIN_EMAIL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SMB_MONTHLY=
STRIPE_PRICE_SMB_ANNUAL=
STRIPE_PRICE_ENTERPRISE_MONTHLY=
STRIPE_PRICE_ENTERPRISE_ANNUAL=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=optional   # protect /api/cron/reminders
```

### Email setup
- Gmail: set `GMAIL_USER` + `GMAIL_APP_PASSWORD` (app password).
- SMTP: provide all `SMTP_*` + `SMTP_FROM`.
- `ADMIN_EMAIL` (or `SUPERADMIN_EMAIL`) must be set to receive admin notifications.

### Stripe
- Configure webhook to `/api/stripe/webhook` (use `stripe listen --forward-to localhost:3000/api/stripe/webhook` in dev and set `STRIPE_WEBHOOK_SECRET`).
- Checkout success/cancel are handled automatically; plans are defined in env price IDs.

## Key URLs
- Help Center: `/{locale}/help`
- Pricing (public, no auth): `/{locale}/pricing`
- Contact: `/{locale}/contact`
- Manuals: EN `docs/USER_MANUAL.md`, IT `docs/USER_MANUAL_IT.md` (also linked from Help).

## Scripts
- `npm run dev` — start dev server
- `npm test` — run tests (where present)

## Notes
- Non-authenticated users see only Pricing + Help.
- Reminders cron: `GET /api/cron/reminders` (protect with `CRON_SECRET` header `x-cron-secret`).

## License
MIT
