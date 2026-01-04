# AI Knowledge Hub — Manuale Utente (IT)

## Panoramica
AI Knowledge Hub è una piattaforma RAG multi-tenant per centralizzare la conoscenza aziendale, fare ricerche con AI e produrre SOP. Puoi caricare documenti, memorizzarli in un database vettoriale, fare chat con risposte contestuali e generare procedure operative. Sicurezza (Supabase Auth + RLS + RBAC) e scalabilità (pgvector + LangChain + OpenAI) sono caratteristiche fondamentali della piattaforma.

**Cos'è una SOP?**  
Una Standard Operating Procedure (SOP) è un insieme strutturato e ripetibile di step per svolgere un'attività in modo sicuro e consistente (es. onboarding, runbook di incident, checklist di compliance).

## A chi è utile (per dimensione di azienda)
- **Startup**: onboarding rapido, centralizzazione documenti, SOP senza tool complessi, invito membri team con ruoli appropriati.
- **Piccola impresa**: manuali/policy in un unico posto, risposte rapide a "come si fa…", SOP esportabili, collaborazione team con accesso basato su ruoli.
- **Media impresa**: knowledge base per reparto, accessi governati, SOP tracciabili, gestione team e controllo permessi.
- **Grande impresa**: multi-tenant isolato, ingestion strutturata, retrieval su grandi corpus, SOP ripetibili con export e revisione, supervisione super admin.

## Ruoli Utente & Cosa Puoi Fare

### VIEWER (Sola Lettura)
- **Visualizza documenti**: Sfoglia documenti aziendali caricati
- **Usa Chat (RAG)**: Fai domande e ottieni risposte AI
- **Visualizza SOP**: Leggi procedure esistenti
- **Non può**: Caricare documenti, generare SOP, invitare utenti o modificare nulla

**Ideale per**: Dipendenti che devono consultare informazioni ma non creano contenuti.

### CONTRIBUTOR (Utente Standard)
- **Tutto ciò che può fare VIEWER**, più:
- **Carica documenti**: Aggiungi PDF alla knowledge base
- **Gestisci propri documenti**: Elimina documenti che hai caricato
- **Genera SOP**: Crea nuove procedure basate su documenti aziendali
- **Esporta SOP**: Scarica procedure in Markdown o PDF
- **Non può**: Invitare utenti, gestire team o modificare impostazioni organizzazione

**Ideale per**: La maggior parte dei dipendenti che lavorano attivamente con la documentazione.

### COMPANY_ADMIN (Amministratore Organizzazione)
- **Tutto ciò che può fare CONTRIBUTOR**, più:
- **Invita membri team**: Invia inviti email con assegnazione ruolo
- **Gestisci utenti**: Cambia ruoli, sospendi/abilita account, rimuovi utenti
- **Monitora inviti**: Traccia inviti pendenti, accettati, scaduti e revocati
- **Gestisci abbonamento**: Aggiorna, degrada o cancella piano organizzazione
- **Accedi alla fatturazione**: Visualizza e gestisci informazioni di pagamento

**Ideale per**: Team lead, manager o admin IT che gestiscono l'organizzazione.

### SUPER_ADMIN (Amministratore Piattaforma)
- **Supervisione globale**: Gestisci tutte le organizzazioni e utenti
- **Statistiche di sistema**: Monitora utilizzo e salute della piattaforma
- **Gestione utenti**: Promuovi/degrada utenti tra organizzazioni
- **Controllo organizzazioni**: Abilita/disabilita organizzazioni

**Ideale per**: Solo amministratori piattaforma (non utenti azienda normali).

## Accesso & Account
- **Login** con email/password o Google OAuth.
- **Pagina Profilo**: Vedi email, ruolo, piano corrente, data rinnovo o fine trial, gestione password e cancellazione account.
- **Logout**: Disponibile in tutte le pagine (angolo alto-destra) per uscire velocemente.

## Navigazione

### Navigazione Desktop (schermi ≥1024px)
- **Barra menu superiore**: Dashboard, Documents, Chat, Procedures (+ Plans e Admin per Company Admin)
- **Icone**: Help (?), Cambio lingua (🌐), Command palette (⌘K)
- **Pulsante Logout**: Sempre visibile nell'header pagina (allineato a destra)

### Navigazione Mobile (schermi <1024px)
- **Header compatto**: Nome organizzazione, icone essenziali
- **Command Palette (⌘K)**: Metodo navigazione primario
  - Premi **Ctrl+K** (Windows/Linux) o **Cmd+K** (Mac)
  - Mostra tutte le pagine accessibili in base al tuo ruolo
  - Digita per filtrare, frecce per navigare, Invio per aprire
- **Voci menu**: Filtrate dinamicamente in base ai tuoi permessi

### Mappa di Navigazione
- **Dashboard**: Panoramica stato e azioni rapide
- **Documents**: Upload e monitoraggio pipeline ingestion
- **Chat**: Domande sui documenti ingestati (RAG)
- **Procedures**: Generazione, gestione ed export SOP
- **Admin** *(solo COMPANY_ADMIN)*: Gestione team, inviti, ruoli utente
- **Plans** *(solo COMPANY_ADMIN)*: Gestione abbonamento e fatturazione
- **Profile**: Impostazioni personali e gestione account
- **Contact**: Supporto (tecnico, commerciale, billing, altro)
- **Help**: Manuali utente, FAQ e documentazione

## Documenti — Pipeline di Ingestion

### Caricare Documenti *(CONTRIBUTOR e superiori)*
1. Vai alla pagina **Documents**
2. Clicca **Upload** o trascina file PDF
3. Monitora progressione stato:
   - **Pending**: Caricato, in attesa di elaborazione
   - **Processing**: Viene suddiviso ed embedded
   - **Ingested**: Pronto per uso in Chat e SOP
   - **Failed**: Errore durante elaborazione (riprova ricaricando)

### Dopo l'Ingestion
- Il contenuto viene automaticamente:
  - Suddiviso in chunk semantici
  - Convertito in embedding vettoriali (OpenAI)
  - Archiviato in database pgvector
  - Ricercabile in Chat
  - Disponibile per generazione SOP

### Suggerimenti
- **Preferisci PDF puliti**: PDF basati su testo funzionano meglio
- **Evita immagini scansionate**: A meno che non abbiano OCR (riconoscimento ottico caratteri)
- **Aggiorna regolarmente**: Ricarica documenti modificati per aggiornare risposte AI
- **Controlla stato**: Assicurati che documenti mostrino "Ingested" prima di usarli

## Chat (RAG) — Domande con Contesto

### Come Usare
1. Apri pagina **Chat**
2. Digita domanda in linguaggio naturale
3. L'AI recupera chunk rilevanti dai tuoi documenti
4. Ottieni risposta concisa e contestuale con riferimenti alle fonti

### Funzionalità
- **Ispezione contesto**: Vedi quali chunk documenti sono stati usati per ogni risposta
- **Cronologia conversazione**: Mantiene contesto nella stessa chat
- **Chat multiple**: Inizia nuove conversazioni per separare argomenti
- **Attribuzione fonte**: Sappi quali documenti hanno informato ogni risposta

### Casi d'Uso
- "Qual è la nostra policy sulle password?"
- "Come faccio l'onboarding di un nuovo dipendente?"
- "Quali sono le procedure di sicurezza per la macchina X?"
- "Riassumi le nostre linee guida comunicazione clienti"
- "Qual è il processo per rimborso spese?"

### Suggerimenti
- **Sii specifico**: "Qual è la policy ferie per dipendenti full-time?" vs "ferie"
- **Assicura ingestion**: Verifica che documenti rilevanti siano "Ingested"
- **Aggiungi contesto**: Includi nome reparto o processo se necessario
- **Rivedi fonti**: Controlla chunk contesto per verificare accuratezza risposta

## Procedures (SOP) — Dai Documenti all'Azione

### Generare SOP *(CONTRIBUTOR e superiori)*
1. Vai alla pagina **Procedures**
2. Clicca **Generate New SOP**
3. Fornisci:
   - **Titolo**: Nome chiaro per procedura (es. "Onboarding Dipendenti")
   - **Ambito/Contesto**: Cosa dovrebbe coprire la SOP (es. "Setup primo giorno nuovi assunti")
4. L'AI genera SOP strutturata basata sui tuoi documenti:
   - Scopo e ambito
   - Prerequisiti
   - Passi numerati
   - Avvisi sicurezza
   - Checklist

### Gestire SOP
- **Visualizza**: Leggi procedura completa con passi formattati
- **Modifica**: Modifica titolo o rigenera contenuto *(in sviluppo)*
- **Esporta Markdown**: Scarica come file .md
- **Esporta PDF**: Scarica PDF formattato *(richiede setup backend)*
- **Elimina**: Rimuovi procedura (con conferma)

### Casi d'Uso
- Checklist sicurezza per operazione macchinari
- Passi onboarding nuovi dipendenti
- Runbook risposta incidenti
- Procedure compliance
- Workflow supporto clienti
- Checklist deployment software

### Suggerimenti
- **Titoli chiari**: "Come Deployare Codice Produzione" vs "Deployment"
- **Ambito specifico**: Includi passi chiave che vuoi coperti
- **Aggiorna fonti**: Rigenera SOP quando documenti sottostanti cambiano
- **Rivedi output**: Rivedi sempre procedure generate da AI per accuratezza

## Gestione Team *(solo COMPANY_ADMIN)*

I Company Admin hanno accesso alla pagina **Admin** per gestione team.

### Invitare Membri Team

1. Vai alla pagina **Admin**
2. Nella sezione **Invita Nuovo Membro**:
   - Inserisci indirizzo email
   - Seleziona ruolo (CONTRIBUTOR o VIEWER)
   - Clicca **Invita**
3. L'utente riceve email invito con link registrazione
4. Traccia stato invito:
   - **Pending**: Inviato, in attesa accettazione
   - **Accepted**: Utente si è registrato
   - **Expired**: Link invito scaduto (reinvia se necessario)
   - **Revoked**: Invito annullato da admin

### Gestire Utenti Esistenti

Nella sezione **Users**, puoi:

- **Cambia ruolo**: Seleziona nuovo ruolo da dropdown (COMPANY_ADMIN, CONTRIBUTOR, VIEWER)
  - Modifiche applicate immediatamente
  - Utente vede permessi aggiornati alla prossima azione
- **Sospendi utente**: Disabilita temporaneamente accesso account
  - Utente non può loggarsi mentre sospeso
  - Dati rimangono intatti
  - Può essere riabilitato in qualsiasi momento
- **Abilita utente**: Ripristina accesso per account sospesi
- **Elimina utente**: Rimuovi permanentemente da organizzazione
  - Richiede conferma
  - Utente rimosso da tutti i team
  - Contenuto caricato può rimanere (dipende da policy)

### Monitorare Inviti

- **Filtra inviti**: Visualizza per stato (tutti, pending, accepted, expired, revoked)
- **Revoca invito**: Annulla inviti pendenti
- **Elimina invito**: Rimuovi record invito
- **Eliminazione bulk**: Rimuovi tutti inviti contemporaneamente

### Best Practice
- **Assegna ruoli minimi**: Inizia con VIEWER, promuovi a CONTRIBUTOR se necessario
- **Rivedi regolarmente**: Controlla membri team e ruoli periodicamente
- **Rimuovi prontamente**: Elimina o sospendi utenti che lasciano organizzazione
- **Traccia inviti**: Pulisci inviti scaduti o rifiutati

## Piani & Billing *(solo COMPANY_ADMIN)*

### Gestire Abbonamento
1. Vai alla pagina **Plans**
2. Confronta tier disponibili:
   - **Trial**: Prova gratuita con funzionalità limitate e tempo
   - **SMB**: Piano Piccola/Media Impresa
   - **Enterprise**: Funzionalità avanzate e supporto
3. Clicca **Choose Plan** o **Upgrade**
4. Completa checkout Stripe
5. Abbonamento si attiva immediatamente

### Informazioni Fatturazione
- Visualizza in pagina **Profile**:
  - Nome piano corrente
  - Ciclo fatturazione (mensile/annuale)
  - Data prossimo rinnovo o fine trial
  - Stato cancellazione (se applicabile)

### Cancellazione
- Piani cancellati rimangono attivi fino a fine periodo
- Trial rimane attivo fino a data scadenza
- Nessun rimborso proporzionale (policy Stripe)
- Possibile riabbonamento in qualsiasi momento

## Contatti & Supporto

### Inviare Richieste Supporto
1. Vai alla pagina **Contact**
2. Compila form:
   - **Categoria**: Tecnico, Commerciale, Billing, Altro
   - **Oggetto**: Descrizione breve problema
   - **Messaggio**: Spiegazione dettagliata
   - **Email**: Pre-compilata se loggato (modificabile)
   - **Telefono**: Numero contatto opzionale
3. Clicca **Invia**
4. Ricevi email conferma
5. Admin viene notificato automaticamente

### Tempi Risposta
- Tecnico: 24-48 ore (giorni lavorativi)
- Billing: 24 ore
- Commerciale: 2-3 giorni lavorativi

### Per Risoluzione Più Veloce
- Includi screenshot se applicabile
- Specifica pagina/funzionalità dove si verifica problema
- Descrivi passi per riprodurre
- Menziona tuo ruolo e organizzazione

## Sicurezza & Privacy

### Autenticazione
- Supabase Auth con email/password o OAuth (Google)
- Gestione sessione sicura con scadenza automatica
- Reset password via email

### Isolamento Dati
- **Architettura multi-tenant**: Dati di ogni organizzazione completamente isolati
- **Row-Level Security (RLS)**: Controllo accesso applicato database
- **Nessun accesso cross-tenant**: Anche admin non possono vedere dati altre organizzazioni

### Archiviazione Dati
- **Documenti**: Supabase Storage con crittografia a riposo
- **Embedding**: PostgreSQL + pgvector
- **Dati utente**: Supabase Auth (crittografati)

### Applicazione Permessi
- **Livello UI**: Nascondi funzionalità in base a ruolo
- **Livello API**: Validazione server-side per tutte azioni
- **Livello database**: Policy RLS prevengono accesso non autorizzato

### Header Sicurezza
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options

### Rate Limiting
- Query chat: Previene abuso
- Endpoint API: Protegge da attacchi
- Upload file: Limiti ragionevoli

## Risoluzione Problemi

### Problemi Upload
- **Problema**: Upload PDF fallisce
- **Soluzioni**:
  - Assicura che file sia PDF valido (non corrotto)
  - Controlla dimensione file (max 10MB tipicamente)
  - Verifica di avere ruolo CONTRIBUTOR o superiore
  - Riprova dopo pochi secondi
  - Controlla pagina Documents per stato

### Problemi Qualità Chat
- **Problema**: Risposte imprecise o vaghe
- **Soluzioni**:
  - Conferma che documenti siano completamente "Ingested"
  - Usa domande più specifiche
  - Aggiungi contesto (reparto, processo, periodo temporale)
  - Verifica se documenti rilevanti sono caricati
  - Rivedi chunk fonte per verificare contesto

### Problemi Generazione SOP
- **Problema**: Contenuto SOP incompleto o fuori tema
- **Soluzioni**:
  - Fornisci ambito/contesto più chiaro
  - Assicura che documenti fonte contengano info rilevanti
  - Sii specifico sui passi richiesti
  - Prova a rigenerare con prompt raffinato
  - Rivedi e modifica output

### Fallimenti Export
- **Problema**: Export PDF/Markdown fallisce
- **Soluzioni**:
  - Riprova export dopo pochi secondi
  - Assicura che SOP esista e sia salvata
  - Controlla console browser per errori
  - Prova browser diverso
  - Contatta supporto se persistente

### Errori Accesso Negato
- **Problema**: Non puoi accedere certe funzionalità
- **Soluzioni**:
  - Controlla tuo ruolo in pagina Profile
  - Contatta Company Admin per richiedere upgrade ruolo
  - Verifica di essere loggato
  - Pulisci cache browser e re-login

### Problemi Inviti
- **Problema**: Utente invitato non può registrarsi
- **Soluzioni**:
  - Controlla cartella spam per email invito
  - Verifica che indirizzo email sia corretto
  - Reinvia invito se scaduto
  - Controlla stato invito in pagina Admin
  - Contatta supporto con dettagli invito

## Ottenere il Massimo

### Per Tutti gli Utenti
- **Mantieni documenti aggiornati**: Re-ingesta dopo modifiche importanti
- **Usa linguaggio chiaro**: Domande specifiche ottengono risposte migliori
- **Esplora contesto**: Rivedi chunk fonte per capire ragionamento AI
- **Organizza chat**: Usa conversazioni separate per argomenti diversi

### Per Contributors
- **Carica sistematicamente**: Organizza documenti per categoria/reparto
- **Nomenclatura chiara**: Usa nomi file descrittivi
- **Aggiorna regolarmente**: Aggiorna documenti quando policy cambiano
- **Genera SOP**: Trasforma domande frequenti in procedure

### Per Company Admins
- **Assegna ruoli attentamente**: Segui principio minimo privilegio
- **Monitora utilizzo**: Controlla chi è attivo e chi necessita training
- **Rivedi team regolarmente**: Controlla ruoli e permessi trimestralmente
- **Pulisci inviti**: Elimina inviti scaduti periodicamente
- **Gestisci abbonamento**: Upgrade/downgrade in base a dimensione team

### Per Team
- **Condividi procedure**: Esporta SOP e distribuisci a team rilevanti
- **Collabora in chat**: Condividi query utili con colleghi
- **Standardizza upload**: Concordate convenzioni nomenclatura e organizzazione
- **Fornisci feedback**: Segnala problemi per migliorare knowledge base

## Scorciatoie Tastiera

- **Ctrl+K** (Windows/Linux) o **Cmd+K** (Mac): Apri Command Palette
- **Esc**: Chiudi Command Palette
- **Frecce**: Naviga risultati Command Palette
- **Invio**: Seleziona/apri elemento evidenziato

## Serve Aiuto?

### Supporto In-App
- **Pagina Help**: `/{locale}/help` - Manuali, FAQ, link rapidi
- **Pagina Contact**: `/{locale}/contact` - Invia ticket supporto

### Supporto Email
- Email all'indirizzo admin/support configurato
- Includi:
  - Tua email e organizzazione
  - Pagina/funzionalità dove si verifica problema
  - Passi per riprodurre
  - Screenshot (se applicabili)
  - Comportamento atteso vs effettivo

### Priorità Risposta
1. Critico: Sistema down, perdita dati (immediato)
2. Alto: Funzionalità rotte, problemi accesso (24 ore)
3. Medio: Problemi usabilità, domande (48 ore)
4. Basso: Richieste funzionalità, miglioramenti (best effort)

---

**Versione**: 2.0  
**Ultimo Aggiornamento**: Gennaio 2026  
**Per documentazione tecnica**: Vedi README.md nella root progetto
