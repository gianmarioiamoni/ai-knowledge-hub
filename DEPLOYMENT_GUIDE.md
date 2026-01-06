# 🚀 Guida Deployment Vercel - AI Knowledge Hub

Guida completa step-by-step per il deployment su Vercel.

---

## 📋 CHECKLIST VARIABILI D'AMBIENTE

Prima di iniziare, prepara queste variabili (copiale dal tuo `.env.local`):

### **OBBLIGATORIE:**

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### OpenAI
```
OPENAI_API_KEY=sk-...
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_test_... (o sk_live_... per produzione)
STRIPE_WEBHOOK_SECRET=whsec_... (ricrea dopo deploy)
STRIPE_PRICE_SMB_MONTHLY=price_...
STRIPE_PRICE_SMB_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_...
```

### **EMAIL (uno dei due set):**

**Opzione 1 - Gmail:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Opzione 2 - SMTP Generico:**
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
```

### **OPZIONALI (Raccomandate):**

```
# Admin/Super Admin
ADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PASSWORD=SuperSecurePassword123!
SUPERADMIN_NAME=Super Admin

# Demo Users
DEMO_USER_EMAIL=demo@yourdomain.com
DEMO_USER_PASSWORD=DemoPassword123!
DEMO_USER_NAME=Demo User

# Cron Jobs
CRON_SECRET=generate-a-random-secret-key

# Monitoring (opzionale)
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🎯 FASE 1: SETUP VERCEL

### **Step 1: Crea Account Vercel**

1. Vai su https://vercel.com
2. Clicca "Sign Up"
3. **Usa "Continue with GitHub"** (raccomandato)
4. Autorizza Vercel ad accedere ai tuoi repository

### **Step 2: Importa il Progetto**

1. Nel dashboard Vercel, clicca **"Add New..." → "Project"**
2. Trova il repository `ai-knowledge-hub`
3. Clicca **"Import"**

### **Step 3: Configurazione Progetto**

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Node.js Version:** 18.x o 20.x (raccomandato: 20.x)

⚠️ **NON FARE ANCORA DEPLOY!** Prima dobbiamo configurare le env vars.

---

## 🔐 FASE 2: CONFIGURAZIONE ENVIRONMENT VARIABLES

### **Step 1: Accedi alle Impostazioni**

1. Nel progetto Vercel, vai su **"Settings"** (tab in alto)
2. Nel menu laterale, clicca **"Environment Variables"**

### **Step 2: Aggiungi le Variabili**

Per OGNI variabile nella checklist sopra:

1. Clicca **"Add New"**
2. **Key**: Nome della variabile (es. `NEXT_PUBLIC_SUPABASE_URL`)
3. **Value**: Il valore dal tuo `.env.local`
4. **Environment**: Seleziona tutti e 3 (Production, Preview, Development)
5. Clicca **"Save"**

⚠️ **IMPORTANTE:**
- Le variabili `NEXT_PUBLIC_*` DEVONO avere questo prefisso
- Non mettere virgolette attorno ai valori
- Copia-incolla con attenzione (senza spazi extra)

### **Step 3: Verifica**

Dovresti avere almeno 18-20 variabili configurate (dipende da opzionali).

---

## 🗄️ FASE 3: CONFIGURAZIONE SUPABASE

### **Step 1: URL Callbacks (Authentication)**

1. Vai su Supabase Dashboard → **Authentication** → **URL Configuration**
2. Aggiungi questi URL (sostituisci `your-app.vercel.app` con il tuo dominio):

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs** (aggiungi tutti):
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/*/auth/callback
https://your-app.vercel.app/en/auth/callback
https://your-app.vercel.app/it/auth/callback
http://localhost:3000/auth/callback
http://localhost:3000/*/auth/callback
```

### **Step 2: CORS (Storage)**

Se usi Supabase Storage:

1. Vai su **Storage** → **Policies**
2. Aggiungi dominio Vercel alle CORS allowed origins:
```
https://your-app.vercel.app
```

### **Step 3: Database (RLS Policies)**

Le tue RLS policies dovrebbero già essere configurate. Verifica che:
- Tutte le tabelle abbiano RLS enabled
- Le policies funzionano correttamente

---

## 🚀 FASE 4: PRIMO DEPLOY

### **Step 1: Deploy**

1. Nel dashboard Vercel, vai su **"Deployments"**
2. Clicca **"Deploy"** (o torna alla schermata iniziale e clicca "Deploy")
3. Vercel farà:
   - Clone del repository
   - Install delle dipendenze
   - Build dell'applicazione
   - Deploy

⏱️ **Tempo stimato:** 3-5 minuti

### **Step 2: Controlla i Log**

Durante il deploy, clicca su **"Building"** per vedere i log in real-time.

Se ci sono errori:
- Controlla i log attentamente
- Verifica le env vars
- Controlla che non ci siano typo

### **Step 3: Successo! 🎉**

Quando vedi **"Ready"**, il tuo sito è live!

URL di default: `https://ai-knowledge-hub-xxx.vercel.app`

---

## 🔍 FASE 5: POST-DEPLOYMENT TESTING

### **Test 1: Homepage**

1. Apri l'URL Vercel
2. Verifica che la homepage si carichi
3. Controlla che le statistiche siano visibili

### **Test 2: Login**

1. Vai su `/login`
2. Prova a loggarti con un utente esistente
3. Verifica redirect a dashboard

### **Test 3: Funzionalità Core**

- ✅ Upload documenti
- ✅ Chat RAG
- ✅ Generazione SOP
- ✅ Dashboard Super Admin (se applicabile)

### **Test 4: Email**

1. Prova invio inviti
2. Verifica ricezione email
3. Controlla funzionamento link

---

## 🎨 FASE 6: CUSTOM DOMAIN (Opzionale)

### **Step 1: Aggiungi Dominio**

1. Vercel Dashboard → **Settings** → **Domains**
2. Clicca **"Add"**
3. Inserisci il tuo dominio (es. `aiknowledgehub.com`)

### **Step 2: Configura DNS**

Vercel ti darà dei record DNS da aggiungere:

**Opzione A - Nameservers Vercel (Raccomandato):**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Opzione B - Record A/CNAME:**
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### **Step 3: Attendi Propagazione**

- Tempo: 5 minuti - 48 ore (di solito 1-2 ore)
- Vercel genererà automaticamente certificato SSL

### **Step 4: Redirect WWW (Opzionale)**

In Vercel Settings → Domains, configura:
- `www.aiknowledgehub.com` → redirect a `aiknowledgehub.com`

---

## 🔔 FASE 7: WEBHOOK STRIPE (Se usi pagamenti)

### **Step 1: Crea Webhook Produzione**

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Clicca **"Add endpoint"**
3. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Eventi da ascoltare:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia il **Webhook Secret** (whsec_...)

### **Step 2: Aggiorna Env Var**

1. Vercel → Settings → Environment Variables
2. Trova `STRIPE_WEBHOOK_SECRET`
3. Aggiorna con il nuovo secret
4. **IMPORTANTE:** Seleziona solo "Production"
5. **Redeploy** il progetto

---

## 🔧 FASE 8: SUPER ADMIN & DEMO USERS

### **Opzione 1: Creazione Automatica**

Se hai configurato le env vars, al primo accesso:
1. Vai su `/login`
2. Logga con `SUPERADMIN_EMAIL` e `SUPERADMIN_PASSWORD`
3. Super Admin e Demo Users saranno creati automaticamente

### **Opzione 2: Creazione Manuale**

Se preferisci creare manualmente:
1. Registra un utente normale
2. In Supabase SQL Editor:
```sql
-- Promuovi a Super Admin
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role":"SUPER_ADMIN"}'::jsonb
WHERE email = 'your-admin@email.com';
```

---

## 📊 FASE 9: MONITORING & ANALYTICS

### **Vercel Analytics (Gratis)**

1. Vercel Dashboard → **Analytics**
2. Abilita **"Vercel Analytics"**
3. Vedrai: page views, users, performance

### **Sentry (Opzionale)**

Se hai configurato `SENTRY_DSN`:
1. Vai su sentry.io
2. Verifica che gli errori vengano tracciati
3. Configura alerting

### **Uptime Monitoring**

Raccomandato: UptimeRobot (gratis)
1. Vai su uptimerobot.com
2. Aggiungi monitor HTTP(S)
3. URL: `https://your-app.vercel.app`
4. Intervallo: 5 minuti

---

## 🔄 FASE 10: WORKFLOW GIT → VERCEL

### **Deploy Automatici**

Vercel è ora configurato per deploy automatici:

**Branch `main`:**
- Push → Deploy automatico in **Production**
- URL: `your-app.vercel.app`

**Branch `develop`/altri:**
- Push → Deploy automatico in **Preview**
- URL: `your-app-git-branch-name.vercel.app`

**Pull Requests:**
- Ogni PR → Preview deployment
- Commento automatico con URL preview

### **Comando Vercel CLI (Opzionale)**

Installa CLI:
```bash
npm i -g vercel
vercel login
vercel --prod  # Deploy manuale
```

---

## 🐛 TROUBLESHOOTING

### **Build Errors**

**Errore: "Invalid environment variables"**
- Controlla che tutte le env vars obbligatorie siano configurate
- Verifica non ci siano typo

**Errore: "Module not found"**
- Verifica `package.json` sia committato
- Controlla che tutte le dipendenze siano in `dependencies` (non solo `devDependencies`)

### **Runtime Errors**

**Errore 500 / Internal Server Error**
1. Vercel Dashboard → Deployments → [Latest] → **"Functions"** → View logs
2. Cerca stack trace
3. Verifica env vars

**Autenticazione non funziona**
- Verifica URL callbacks in Supabase
- Controlla `NEXT_PUBLIC_SUPABASE_URL` sia corretto
- Verifica CORS

**Email non partono**
- Controlla env vars SMTP/Gmail
- Verifica in Vercel Logs → Functions

---

## ✅ CHECKLIST FINALE

Prima di considerare il deploy completo:

- [ ] Build su Vercel completato con successo
- [ ] Homepage carica correttamente
- [ ] Login funziona
- [ ] Upload documenti funziona
- [ ] Chat RAG risponde correttamente
- [ ] Generazione SOP funziona
- [ ] Email vengono inviate
- [ ] Super Admin dashboard accessibile
- [ ] Stripe webhook configurato (se applicabile)
- [ ] Custom domain configurato (opzionale)
- [ ] SSL attivo (verifica lucchetto nel browser)
- [ ] Monitoring configurato

---

## 📞 SUPPORT

**Vercel Support:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions

**Supabase Support:**
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

**Problemi Specifici:**
Consulta i log in:
- Vercel → Functions (errori server-side)
- Browser Console (errori client-side)
- Supabase → Logs (errori database/auth)

---

## 🎯 PERFORMANCE BEST PRACTICES

1. **Edge Functions:** Già configurato (Next.js 15 + Vercel)
2. **CDN:** Automatico su Vercel
3. **Image Optimization:** `next/image` già usato
4. **Caching:** Headers già configurati in `next.config.ts`

---

## 🔒 SECURITY CHECKLIST

- [x] HTTPS forzato (automatico su Vercel)
- [x] CSP headers configurati
- [x] Supabase RLS abilitato
- [x] Environment variables sicure (non in repository)
- [x] Stripe webhook secret validation
- [ ] Rate limiting (considera Vercel Edge Config o Upstash)
- [ ] DDoS protection (Vercel Pro/Enterprise)

---

**Buon deployment! 🚀**

Se incontri problemi, rivedi questa guida passo-passo o consulta i log in Vercel Dashboard.

