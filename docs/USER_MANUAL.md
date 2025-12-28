# AI Knowledge Hub — User Manual

## Overview
AI Knowledge Hub is a multi-tenant RAG platform to centralize company knowledge, search it with AI, and produce SOPs. Upload documents, ingest them into a vector DB, chat with contextual answers, and generate operational procedures. Designed for security (Supabase Auth + RLS) and scale (pgvector + LangChain + OpenAI).

## Who benefits (by company size)
- Startup: fast onboarding, centralize scattered docs, create SOPs without heavy tooling.
- Small business: single place for manuals/policies, quick answers to “how do we…” questions, exportable SOPs.
- Mid-size: department-level knowledge bases, governed access, auditable SOP generation.
- Enterprise: multi-tenant isolation, structured ingestion, retrieval on large corpora, repeatable SOPs with export and review flows.

## Access & Accounts
- Sign in with email/password or Google.
- Profile: see your email, role, current plan, renewal or trial end, and manage password or account deletion.

## Navigation map
- Dashboard: entry points and status at a glance.
- Documents: upload and monitor ingestion pipeline.
- Chat: ask questions on your ingested docs (RAG).
- Procedures: generate, manage, and export SOPs.
- Plans: choose or change subscription.
- Contact: reach support (technical, commercial, billing, other).

## Documents — Ingestion pipeline
1) Go to `Documents`.
2) Upload PDF files; statuses: pending → processing → ingested.
3) After ingestion, content is chunked, embedded (pgvector), and searchable in Chat and usable for SOPs.
Tips:
- Prefer clean PDFs; avoid scans without OCR.
- Re-upload updated versions to refresh answers.

## Chat (RAG) — Ask with context
1) Open `Chat`.
2) Ask a question; the system retrieves top chunks and answers concisely.
3) Start new chats to separate topics; inspect context used for each reply.
Use cases:
- SOP clarifications, policy Q&A, onboarding FAQs, process reminders.

## Procedures (SOP) — From docs to action
1) Go to `Procedures`.
2) Generate a SOP by providing title and scope/context.
3) Manage SOPs: view, rename, delete, export in Markdown or PDF.
Use cases:
- Safety checklists, onboarding steps, runbooks, compliance procedures.

## Plans & Billing
- Open `Plans` to switch between trial and paid tiers.
- Profile shows plan name, billing cycle, renewal/trial end, and cancellation status.
- Cancelled plans stay active until period end; trial remains until expiry.

## Contact & Support
- Go to `Contact`, pick a topic (technical, commercial, billing, other), add subject/message, email (prefilled if logged in), optional phone.
- You receive a confirmation; admin is notified automatically.

## Security & Privacy
- Auth via Supabase Auth; data isolation with RLS per tenant.
- Documents stored in Supabase Storage; embeddings in pgvector.
- CSP/HSTS and rate limits on critical endpoints.

## Troubleshooting
- Upload issues: ensure PDF and retry; check status in Documents.
- Chat quality: confirm ingestion completed; add context; retry with clearer questions.
- SOP export: if fails, retry; ensure source SOP exists and is saved.
- Plans: revisit `Plans` or use `Contact` for billing/support.

## Getting the most out of it
- Keep documents updated; re-ingest after major changes.
- Use clear titles/scopes for SOPs to improve structure.
- For teams, share context in Chat to reduce repeated questions.

## Need help?
- Use the Contact page or email the configured admin/support address. Provide examples and the page/flow where you encountered issues for faster resolution.

