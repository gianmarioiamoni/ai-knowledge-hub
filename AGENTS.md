# AI KNOWLEDGE HUB – AGENTS OVERVIEW
Sistema AI basato su MERN-like stack + Next.js 15 + Supabase + LangChain + OpenAI  
Version: 1.0  
Author: Gianmario

---

## 1. PROJECT DESCRIPTION

AI Knowledge Hub è una piattaforma multi-tenant che permette alle aziende di:

- caricare i propri documenti (manuali, policy, PDF, contratti, procedure)
- estrarre automaticamente testo strutturato
- indicizzare e vettorializzare i contenuti tramite Supabase + pgvector
- eseguire retrieval AI (RAG) con LangChain e GPT-4.1
- ottenere risposte contestuali basate sulla documentazione aziendale
- generare SOP (Standard Operating Procedures) automatiche e procedure operative
- gestire utenti, conversazioni, e processi di knowledge management

Il progetto è progettato per essere realistico, scalabile, vendibile come SaaS e altamente dimostrativo delle tue competenze full-stack e AI engineering.

---

## 2. CORE OBJECTIVES

1. Creare una piattaforma AI per knowledge management aziendale basata su RAG.
2. Offrire un’interfaccia moderna e professionale (Shadcn UI + Tailwind).
3. Supportare multi-tenancy tramite Supabase Auth + RLS.
4. Realizzare un ingestion workflow completo: upload → extraction → chunking → embeddings.
5. Implementare una pipeline RAG end-to-end affidabile, ottimizzata e personalizzabile.
6. Generare SOP e documenti operativi basati sui contenuti aziendali.
7. Rendere il progetto altamente presentabile come portfolio.
8. Applicare architetture pulite, SRP, SOLID, TDD dove possibile.

---

## 3. ARCHITECTURAL OVERVIEW

### Frontend
- **Next.js 15 (App Router)** con React Server Components.
- Shadcn UI + Tailwind CSS per una UI moderna e coerente.
- Routing strutturato:  
  - `/dashboard`  
  - `/documents`  
  - `/chat`  
  - `/procedures`  
  - `/settings`  

### Backend
- Next.js API Routes / Server Actions.
- Moduli server-side in `/lib/server/*`:  
  - ingestion pipeline  
  - RAG pipeline  
  - procedure generator  
  - Supabase client wrapper  
  - auth utilities  

### AI / LangChain
- OpenAI GPT-4.1 come modello principale.
- GPT-4.1-mini per operazioni di servizio.
- LangChain per:
  - text splitting
  - embeddings generation
  - vector retrieval
  - RAG chain construction
  - SOP generation templates

### Database & Storage – Supabase
- **Supabase Auth** → gestione utenti/tenant.
- **Postgres + pgvector** → archiviazione chunk vettoriali.
- **Supabase Storage** → documenti originali (PDF, docx).
- RLS attivato per isolare ogni organizzazione.

---

## 4. SYSTEM MODULES

### 4.1 Authentication & Tenant Management
Tabelle:
- `organizations`
- `organization_members`
- `users` (Supabase-managed)

Ruoli:
- `ORG_ADMIN`
- `ORG_MEMBER`

### 4.2 Document Management
- Upload documenti tramite UI drag&drop.
- Salvataggio in Supabase Storage.
- Status ingestion (pending → processing → ingested).

### 4.3 Ingestion Pipeline
Step:
1. Extraction (PDF → testo)
2. Cleaning & normalization
3. Chunking (LangChain Recursive Splitter)
4. Embeddings (OpenAI embedding models)
5. Inserimento chunks in `document_chunks` (con vettore)

Tabelle principali:
- `documents`
- `document_chunks`

### 4.4 RAG Assistant
- Query → embedding → similarity search → top-k context → generazione finale.
- Conversazione persistente:
  - `conversations`
  - `messages`

### 4.5 SOP Generator
- Template specializzato GPT-4.1 per:
  - scopo
  - pre-condizioni
  - passi numerati
  - avvisi di sicurezza
  - checklist
- Produzione PDF/Markdown (fase avanzata).
- Tabella:
  - `procedures`

### 4.6 Dashboard Amministrativa
Metriche:
- documenti caricati
- query effettuate
- procedure generate
- utenti attivi

---

## 5. DATA STRUCTURE SUMMARY (Supabase)

Elementi principali:

### organizations
- `id`
- `name`
- `created_at`

### organization_members
- `user_id`
- `organization_id`
- `role`
- RLS per garantire isolamento tenant

### documents
- `id`
- `organization_id`
- `file_path`
- `file_type`
- `status` (pending, processing, ingested)
- `created_at`

### document_chunks
- `id`
- `organization_id`
- `document_id`
- `chunk_text`
- `chunk_metadata` (JSONB)
- `embedding` (vector)

### conversations
- `id`
- `organization_id`
- `user_id`
- `title`

### messages
- `conversation_id`
- `role`
- `content`
- `metadata`

### procedures
- `id`
- `organization_id`
- `title`
- `content`
- `source_documents`
- `created_at`

---

## 6. END-TO-END FLOW

1. **User uploads document**  
2. File salvato su Supabase Storage  
3. Pipeline extraction → chunking → embeddings  
4. Inserimento `document_chunks`  
5. Utente apre la chat → fa una domanda  
6. LangChain:
   - embedding query
   - similarity search
   - costruzione contesto
7. GPT-4.1 genera la risposta  
8. Utente può salvare la risposta o generare una SOP  
9. SOP salvata nella sezione `/procedures`

---

## 7. DELIVERABLES (MVP)

1. Supabase project con Auth, DB e pgvector attivi  
2. Next.js 15 + Tailwind + Shadcn configurati  
3. Login + Signup + gestione tenant  
4. Upload documenti + pipeline ingestion funzionante  
5. Vector store popolato correttamente  
6. Chat assistant con RAG completo  
7. Persistenza conversazioni  
8. Generatore SOP (testuale)  
9. UI dashboard base

---

## 8. ROADMAP & MILESTONES

### PHASE 0 – Setup (1–2 settimane)
- Configurazione Next.js + Shadcn  
- Setup Supabase (Auth, Storage, pgvector)  
- Definizione schema DB  
- Setup OpenAI + LangChain  

### PHASE 1 – Document Upload & Ingestion (2 settimane)
- UI upload documenti  
- API upload → storage  
- Engine estrazione testo  
- Chunking + embeddings  
- Scrittura vectordb  

### PHASE 2 – RAG Assistant (2–3 settimane)
- Endpoint `/api/chat/query`  
- Retrieval pipeline  
- RAG chain con LangChain  
- Interfaccia chat + history  

### PHASE 3 – SOP Generator (2 settimane)
- Template SOP  
- API procedure create  
- UI lista SOP  
- Esportazione Markdown/PDF (opzionale MVP+)  

### PHASE 4 – Dashboard & Multi-Tenant Hardening (2 settimane)
- Metriche  
- Logging  
- RLS policies  
- Controlli sicurezza  

### PHASE 5 – Finalization & Portfolio Packaging (1–2 settimane)
- Documentazione  
- Test unitari/integration (mock OpenAI)  
- Ottimizzazioni performance  
- README professionale  
- Screenshot + demo flow

---

## 9. FUTURE FEATURES (POST-MVP)

- Ruoli avanzati: approvazione SOP, revisioni, versioning  
- Workflow automation (AI agent orchestration)  
- Notifiche email/slack  
- Addestramento personalizzato su dataset interni  
- Aggiornamento automatico SOP da variazioni documentali  
- Supporto multi-lingua (import/export)  

---

## 10. AI AGENTS GUIDELINES (PER CURSOR)

Quando utilizzi Cursor AI Agents su questo progetto, devono:

1. Seguire rigorosamente architettura e struttura definite in questo file.  
2. Non generare codice fuori dalle convenzioni (TS, SRP, SOLID, folder structure).  
3. Usare Shadcn UI per tutti i componenti UI.  
4. Usare server actions / API routes per ingestion e RAG.  
5. Non duplicare codice; proporre miglioramenti modulari.  
6. Applicare le *Rules for AI* globali.  
7. Suggerire sempre best practice per performance, sicurezza, UX.  

---

## 11. CONTACT & OWNERSHIP

Project Owner: **Gianmario**  
Knowledge Hub AI System – 2025  
