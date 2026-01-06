# 📝 Template Variabili d'Ambiente per Vercel

Usa questo template per configurare le variabili d'ambiente su Vercel.

## 🔐 SUPABASE (Obbligatorio)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dove trovarle:** Supabase Dashboard → Settings → API

---

## 🤖 OPENAI (Obbligatorio)

```
OPENAI_API_KEY=sk-proj-...
```

**Dove trovarla:** https://platform.openai.com/api-keys

---

## 💳 STRIPE (Obbligatorio)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SMB_MONTHLY=price_...
STRIPE_PRICE_SMB_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_...
```

**Dove trovarle:** 
- API Keys: https://dashboard.stripe.com/apikeys
- Prices: https://dashboard.stripe.com/products

⚠️ **IMPORTANTE:** `STRIPE_WEBHOOK_SECRET` va ricreato dopo il deploy (vedi guida)

---

## 📧 EMAIL (Scegli UNA opzione)

### Opzione 1: Gmail (Raccomandato)

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Setup:** 
1. Vai su https://myaccount.google.com/apppasswords
2. Genera "App Password"
3. Usa quella password (non la tua password Gmail)

### Opzione 2: SMTP Generico

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

---

## 👤 ADMIN (Opzionale ma Raccomandato)

```
ADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PASSWORD=YourSecurePassword123!
SUPERADMIN_NAME=Super Admin
```

**Nota:** Il Super Admin verrà creato automaticamente al primo deploy.

---

## 🎭 DEMO USERS (Opzionale)

```
DEMO_USER_EMAIL=demo@yourdomain.com
DEMO_USER_PASSWORD=DemoPassword123!
DEMO_USER_NAME=Demo User
```

---

## ⏰ CRON JOBS (Opzionale)

```
CRON_SECRET=your-random-secret-key-here
```

**Genera:** `openssl rand -hex 32`

---

## 📊 MONITORING (Opzionale)

```
SENTRY_DSN=https://...@sentry.io/...
```

**Dove trovarla:** Sentry Dashboard → Project Settings

---

## 📌 COME USARE QUESTO TEMPLATE

### Su Vercel:

1. Vai su **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Per ogni variabile:
   - Clicca "Add New"
   - **Key**: Nome della variabile
   - **Value**: Il tuo valore
   - **Environment**: Seleziona tutti (Production, Preview, Development)
   - Clicca "Save"

### Ordine Consigliato:

1. ✅ Supabase (3 variabili)
2. ✅ OpenAI (1 variabile)
3. ✅ Email Gmail/SMTP (2-5 variabili)
4. ✅ Stripe (7 variabili)
5. ✅ Admin (3-4 variabili)
6. ✅ Opzionali (demo, cron, sentry)

### Verifica:

Dopo aver aggiunto tutte le variabili, dovresti avere:
- **Minimo 16-18 variabili** (con solo le obbligatorie)
- **Circa 25-28 variabili** (con tutto configurato)

---

## ⚠️ ERRORI COMUNI

### "Invalid environment variables"
- Controlla che tutte le obbligatorie siano configurate
- Verifica non ci siano typo nei nomi
- Assicurati che i valori non abbiano spazi extra

### "NEXT_PUBLIC_* undefined"
- Le variabili `NEXT_PUBLIC_*` DEVONO avere questo prefisso esatto
- Vercel rebuilda automaticamente quando cambi queste variabili

### "Supabase Auth error"
- Dopo deploy, ricorda di aggiungere l'URL Vercel ai callback URLs in Supabase

### "Stripe webhook not working"
- Dopo primo deploy, crea webhook su Stripe
- Endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
- Aggiorna `STRIPE_WEBHOOK_SECRET` con il nuovo valore
- Redeploy

---

## 🔄 WORKFLOW DEPLOYMENT

1. **Prima del deploy:**
   ```bash
   # Controlla env vars locali
   npm run build  # Verifica che funzioni tutto
   ```

2. **Durante il deploy:**
   - Aggiungi env vars su Vercel (usa questo template)
   - Deploy

3. **Dopo il deploy:**
   - Aggiorna Supabase callback URLs
   - Crea Stripe webhook (se applicabile)
   - Testa funzionalità core

---

## 📚 RIFERIMENTI

- **Guida completa:** Vedi `DEPLOYMENT_GUIDE.md`
- **Script verifica:** Esegui `bash scripts/check-env.sh` (locale)
- **Vercel Docs:** https://vercel.com/docs/environment-variables

---

**Buon deployment! 🚀**


