# AI Knowledge Hub — User Manual (EN)

The full user manual lives in the codebase under `docs/USER_MANUAL.md`.  
This copy is provided for quick access via the Help Center.

## Overview
AI Knowledge Hub is a multi-tenant RAG platform to centralize company knowledge, search it with AI, and produce SOPs. Upload documents, ingest them into a vector DB, chat with contextual answers, and generate operational procedures. Designed for security (Supabase Auth + RLS) and scale (pgvector + LangChain + OpenAI).

**What is a SOP?**  
A Standard Operating Procedure (SOP) is a structured, repeatable set of steps to perform a task safely and consistently (e.g., onboarding steps, incident runbooks, compliance checklists).

## Who benefits (by company size)
- Startup: fast onboarding, centralize scattered docs, create SOPs without heavy tooling.
- Small business: single place for manuals/policies, quick answers to “how do we…” questions, exportable SOPs.
- Mid-size: department-level knowledge bases, governed access, auditable SOP generation.
- Enterprise: multi-tenant isolation, structured ingestion, retrieval on large corpora, repeatable SOPs with export and review flows.

## Navigation map
- Dashboard, Documents, Chat (RAG), Procedures (SOP), Plans, Contact.

## Documents — Ingestion pipeline
Upload PDF → pending → processing → ingested. After ingestion, content is chunked, embedded, and searchable in Chat and usable for SOPs.

## Chat (RAG)
Ask questions; the system retrieves top chunks and answers concisely. Use separate chats per topic; view context used.

## Procedures (SOP)
Generate SOPs with title and scope; manage, rename, delete, export Markdown/PDF. Examples: safety checklists, onboarding steps, runbooks, compliance procedures.

## Plans & Billing
Switch plans from `Plans`; Profile shows plan name, billing, renewal/trial end, cancellation status.

## Contact & Support
`Contact` page for technical/commercial/billing/other; confirmation sent; admin notified.

## Security & Privacy
Supabase Auth + RLS; Supabase Storage + pgvector; CSP/HSTS and rate limits.

## Troubleshooting
- Upload: ensure PDF and retry.
- Chat: confirm ingestion complete; add context.
- SOP export: retry; ensure SOP exists/saved.
- Plans: revisit `Plans` or use `Contact`.

