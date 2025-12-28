# AI Knowledge Hub — Manuale Utente (IT)

## Panoramica
AI Knowledge Hub è una piattaforma RAG multi-tenant per centralizzare la conoscenza aziendale, cercarla con AI e produrre SOP. Puoi caricare documenti, ingerirli in un database vettoriale, fare chat con risposte contestuali e generare procedure operative. Sicurezza (Supabase Auth + RLS), scalabilità (pgvector + LangChain + OpenAI).

## Per chi è utile (per dimensione)
- Startup: onboarding rapido, centralizzazione dei documenti sparsi, SOP senza tool complessi.
- Piccola impresa: manuali/policy in un unico posto, risposte rapide a “come si fa…”, SOP esportabili.
- Media impresa: knowledge base per reparto, accessi governati, SOP tracciabili.
- Grande impresa: multi-tenant isolato, ingestion strutturata, retrieval su grandi corpus, SOP ripetibili con export e revisione.

## Accesso & Account
- Login con email/password o Google.
- Profilo: email, ruolo, piano corrente, data di rinnovo o fine trial, gestione password e cancellazione account.

## Mappa di navigazione
- Dashboard: stato e accessi rapidi.
- Documents: upload e monitoraggio ingestion.
- Chat: domande sui documenti ingestati (RAG).
- Procedures: generazione, gestione ed export SOP.
- Plans: scelta/cambio piano.
- Contact: supporto (tecnico, commerciale, billing, altro).

## Documenti — Pipeline di ingestion
1) Vai su `Documents`.
2) Carica file PDF; stati: pending → processing → ingested.
3) Dopo l’ingestion, i contenuti sono spezzati, embedded (pgvector) e ricercabili in Chat e utilizzabili per le SOP.
Suggerimenti:
- Preferisci PDF puliti; evita scan senza OCR.
- Ricarica versioni aggiornate per riflettere nuove risposte.

## Chat (RAG) — Domande con contesto
1) Apri `Chat`.
2) Poni la domanda; il sistema recupera i chunk migliori e risponde in modo conciso.
3) Crea nuove chat per separare i temi; guarda il contesto usato per ogni risposta.
Esempi d’uso:
- Chiarimenti su SOP, policy Q&A, onboarding FAQ, promemoria di processo.

## Procedures (SOP) — Dai documenti all’azione
1) Vai su `Procedures`.
2) Genera una SOP indicando titolo e ambito/contesto.
3) Gestisci: visualizza, rinomina, elimina, esporta in Markdown o PDF.
Esempi d’uso:
- Checklist di sicurezza, passi di onboarding, runbook, procedure di compliance.

## Piani & Billing
- In `Plans` puoi passare da trial a piani a pagamento.
- In Profilo trovi nome piano, ciclo di fatturazione, rinnovo/fine trial, stato di cancellazione.
- Se annulli, il piano resta attivo fino a fine periodo; il trial dura fino a scadenza.

## Contatti & Supporto
- Vai su `Contact`, scegli argomento (tecnico, commerciale, billing, altro), aggiungi oggetto/messaggio, email (prefill se loggato), telefono opzionale.
- Ricevi conferma; l’admin viene notificato automaticamente.

## Sicurezza & Privacy
- Supabase Auth per autenticazione; RLS per isolamento tenant.
- Documenti in Supabase Storage; embedding in pgvector.
- CSP/HSTS e rate limit sugli endpoint critici.

## Risoluzione problemi
- Upload: assicurati che sia PDF e riprova; controlla lo stato in Documents.
- Qualità chat: verifica ingestion completata; aggiungi contesto; poni domande più chiare.
- Export SOP: se fallisce, riprova; verifica che la SOP esista e sia salvata.
- Piani: torna su `Plans` o contatta supporto via `Contact`.

## Best practice
- Mantieni i documenti aggiornati e re-ingesta dopo modifiche importanti.
- Usa titoli/contesti chiari per le SOP per migliorare la struttura.
- Condividi contesto nelle chat di team per ridurre domande ripetute.

## Serve aiuto?
- Usa la pagina Contact o scrivi all’email admin/support configurata. Indica esempi e la pagina/flow in cui hai avuto problemi per una risposta più rapida.

