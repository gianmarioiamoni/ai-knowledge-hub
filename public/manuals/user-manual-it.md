# AI Knowledge Hub — Manuale Utente (IT)

La versione completa del manuale è in `docs/USER_MANUAL_IT.md`.  
Questa copia è disponibile per un accesso rapido dall’Help Center.

## Panoramica
AI Knowledge Hub è una piattaforma RAG multi-tenant per centralizzare la conoscenza, fare ricerche con AI e produrre SOP. Carichi documenti, li ingerisci in un database vettoriale, fai chat con risposte contestuali e generi procedure operative. Sicurezza (Supabase Auth + RLS) e scalabilità (pgvector + LangChain + OpenAI).

**Cos’è una SOP?**  
Una Standard Operating Procedure (SOP) è un insieme strutturato e ripetibile di step per svolgere un’attività in modo sicuro e consistente (es. onboarding, runbook di incident, checklist di compliance).

## A chi è utile
- Startup: onboarding rapido, centralizzazione dei documenti, SOP senza tool complessi.
- Piccola impresa: manuali/policy in un unico posto, risposte rapide, SOP esportabili.
- Media impresa: knowledge base per reparto, accessi governati, SOP tracciabili.
- Grande impresa: multi-tenant isolato, ingestion strutturata, retrieval su grandi corpus, SOP ripetibili con export e revisione.

## Navigazione
- Dashboard, Documents, Chat (RAG), Procedures (SOP), Plans, Contact.

## Documenti — Ingestion
Carica PDF → pending → processing → ingested. Dopo l’ingestion, i contenuti sono spezzati, embedded e ricercabili in Chat e usabili per le SOP.

## Chat (RAG)
Fai domande; il sistema recupera i chunk migliori e risponde in modo conciso. Crea chat separate per tema; consulta il contesto usato.

## Procedures (SOP)
Genera SOP con titolo e contesto; gestisci, rinomina, elimina, esporta in Markdown/PDF. Esempi: checklist sicurezza, onboarding, runbook, compliance.

## Piani & Billing
Gestisci i piani da `Plans`; in Profilo trovi piano, ciclo, rinnovo/fine trial, stato di cancellazione.

## Contatti & Supporto
Pagina `Contact` per temi tecnici/commerciali/billing/altro; ricevi conferma; admin notificato.

## Sicurezza & Privacy
Supabase Auth + RLS; Supabase Storage + pgvector; CSP/HSTS e rate limit.

## Risoluzione problemi
- Upload: assicurati sia PDF e riprova.
- Chat: verifica ingestion completata; aggiungi contesto.
- Export SOP: riprova; verifica che la SOP esista e sia salvata.
- Piani: torna su `Plans` o contatta via `Contact`.

