# AI Knowledge Hub
Multi-tenant RAG platform (Next.js + Supabase + LangChain + OpenAI) to ingest documents, chat with contextual answers, and generate SOPs. Includes role-based access control, team management, subscriptions (Stripe), contact center with email notifications (Nodemailer), and bilingual UX (en/it).

## Core Features
- **Document ingestion** to pgvector (Supabase) via PDF upload with intelligent chunking and embedding.
- **RAG Chat** on ingested knowledge with context inspection and conversation history.
- **SOP generation and export** (Markdown/PDF) based on company documentation.
- **Multi-tenant auth** with Supabase + RLS for complete data isolation.
- **Role-Based Access Control (RBAC)** with 4 user roles: SUPER_ADMIN, COMPANY_ADMIN, CONTRIBUTOR, VIEWER.
- **Team Management** for Company Admins: invite members, assign roles, manage permissions.
- **Subscriptions and billing** (Stripe checkout, webhook sync, plan management).
- **Contact form** with admin/user emails (Nodemailer) for support requests.
- **Help Center** with comprehensive manuals (EN/IT), FAQ, and quick links.
- **Responsive navigation** with mobile-first CommandPalette (Ctrl+K/Cmd+K).

## User Roles & Permissions

### SUPER_ADMIN
- Global system administrator
- Manage all organizations and users
- Access to system-wide statistics and monitoring
- Can promote/demote users, disable organizations

### COMPANY_ADMIN
- Organization administrator
- Invite and manage team members (assign roles, suspend, delete)
- Manage organization subscription and billing
- Full access to all company features (documents, chat, procedures)

### CONTRIBUTOR
- Standard user with full operational access
- Upload and manage documents
- Use chat (RAG) for questions
- Generate and export SOPs
- Cannot invite users or change roles

### VIEWER
- Read-only access
- View documents (but cannot upload)
- Use chat (RAG) for questions
- View existing SOPs (but cannot generate new ones)
- Cannot modify organization settings

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

### Authenticated Users
- Dashboard: `/{locale}/dashboard` - Overview and quick actions
- Documents: `/{locale}/documents` - Upload and manage documents
- Chat: `/{locale}/chat` - RAG-powered Q&A on company knowledge
- Procedures: `/{locale}/procedures` - Generate and manage SOPs
- Admin: `/{locale}/admin` - Team management (COMPANY_ADMIN only)
- Plans: `/{locale}/plans` - Subscription management (COMPANY_ADMIN only)
- Profile: `/{locale}/profile` - User settings and account management

### Super Admin
- Dashboard: `/{locale}/dashboard` - Super admin overview
- Stats: `/{locale}/admin-stats` - System-wide metrics and monitoring
- Users: `/{locale}/admin/users` - Global user management

### Public (No Auth)
- Help Center: `/{locale}/help` - User manuals, FAQ, and documentation
- Pricing: `/{locale}/pricing` - Plan comparison and features
- Contact: `/{locale}/contact` - Support request form
- Privacy: `/{locale}/privacy` - Privacy policy

### Documentation
- EN Manual: `docs/USER_MANUAL.md`
- IT Manual: `docs/USER_MANUAL_IT.md`

## Navigation

### Desktop (≥1024px)
- TopNav with role-based menu items
- CommandPalette (Ctrl+K / Cmd+K) for quick navigation
- Help icon, language switcher, logout button

### Mobile & Tablet (<1024px)
- Compact header with essential icons
- CommandPalette (Ctrl+K / Cmd+K) as primary navigation
- All menu items dynamically filtered by user role
- Mobile-first, touch-friendly interface

## Team Management (COMPANY_ADMIN)

Company Admins can manage their team from the Admin page:

1. **Invite Members**
   - Send email invitations with specific roles (CONTRIBUTOR or VIEWER)
   - Track invitation status (pending, accepted, expired, revoked)
   - Revoke or delete invitations

2. **Manage Users**
   - Change user roles (COMPANY_ADMIN, CONTRIBUTOR, VIEWER)
   - Suspend or enable user accounts
   - Remove users from organization
   - View user creation date and status

3. **Monitor Activity**
   - See all active team members
   - Filter invitations by status
   - Track team growth and composition

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm test` — run tests (where present)
- `npm run lint` — check code quality

## Security Features
- **Row-Level Security (RLS)** on all database tables
- **Role-based permissions** enforced at both UI and API levels
- **Content Security Policy (CSP)** and HSTS headers
- **Rate limiting** on critical endpoints (chat, auth, exports)
- **Email validation** for invitations and user management
- **CSRF protection** on all forms and server actions
- **Secure session management** with Supabase Auth

## Notes
- Non-authenticated users see only Pricing + Help + Contact.
- User roles are assigned during invitation or by Company Admin.
- Each organization is completely isolated (multi-tenant RLS).
- CommandPalette shows only accessible pages based on user role.
- Reminders cron: `GET /api/cron/reminders` (protect with `CRON_SECRET` header `x-cron-secret`).
- Logout button available on all authenticated pages (top-right corner).

## License
MIT
