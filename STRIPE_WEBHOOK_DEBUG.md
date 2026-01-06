# 🔧 Guida Debug Webhook Stripe

Guida per diagnosticare e risolvere problemi con il webhook Stripe su Vercel.

---

## 🔍 **Problema Comune**

**Sintomi:**
- Pagamento Stripe completato con successo
- Utente reindirizzato a `/plans?checkout=success`
- Piano non aggiornato nel profilo utente
- "Next renewal" mostra "Not available"

**Causa probabile:**
Il webhook Stripe non viene ricevuto o processato correttamente.

---

## ✅ **STEP 1: Verifica Configurazione Webhook su Stripe**

### **A) Dashboard Stripe → Developers → Webhooks**

1. Vai su https://dashboard.stripe.com/test/webhooks (test mode)
2. Verifica se esiste un endpoint con URL:
   ```
   https://ai-knowledge-hub-eosin.vercel.app/api/stripe/webhook
   ```

3. Se NON esiste, **crealo**:
   - Clicca **"Add endpoint"**
   - Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Eventi da ascoltare:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Salva e copia il **Webhook Secret** (`whsec_...`)

4. Aggiorna la variabile d'ambiente su Vercel:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Trova `STRIPE_WEBHOOK_SECRET`
   - Aggiorna con il nuovo valore
   - **IMPORTANTE:** Seleziona solo "Production"
   - **Redeploy** il progetto

---

## 🧪 **STEP 2: Test Webhook in Modalità Test**

### **Opzione A: Trigger Manuale (Raccomandato)**

Stripe in **test mode** NON invia webhook automaticamente. Devi triggerarli manualmente.

1. **Completa un checkout test** (con carta `4242 4242 4242 4242`)
2. Vai su Stripe Dashboard → **Developers** → **Events**
3. Trova l'evento `checkout.session.completed` (ultimo)
4. Clicca sull'evento
5. In alto a destra, clicca **"Send test webhook"**
6. Seleziona il tuo endpoint
7. Clicca **"Send test webhook"**

**Verifica:**
- Lo status deve essere **200 OK** (verde)
- Se è **400/500** (rosso), vai a STEP 3

### **Opzione B: Stripe CLI (Per sviluppo locale)**

```bash
# Installa Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook a localhost (sostituisci il webhook secret nell'output)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 📊 **STEP 3: Verifica Log Webhook su Vercel**

### **A) Vercel Dashboard → Functions**

1. Vai su Vercel Dashboard → Your Project → **"Deployments"**
2. Clicca sull'ultimo deployment (verde, "Ready")
3. Clicca **"Functions"** nel tab
4. Cerca `/api/stripe/webhook`
5. Clicca per vedere i **log in tempo reale**

### **B) Log da Cercare**

Se il webhook funziona correttamente, dovresti vedere:

```
[Stripe Webhook] Event received: checkout.session.completed
[Stripe Webhook] checkout.session.completed: { supabaseUserId: '...', subscriptionId: '...', customerId: '...' }
[Stripe Webhook] Plan built: { id: 'enterprise', billingCycle: 'monthly', ... }
[Stripe Webhook] Plan updated for user: user@example.com
```

### **C) Errori Comuni**

**Errore 1: Missing signature**
```
[Stripe Webhook] Missing signature
```
**Soluzione:** Verifica che il webhook sia configurato correttamente su Stripe.

---

**Errore 2: Signature verification failed**
```
[Stripe Webhook] Signature verification failed: ...
```
**Soluzione:** 
- Il `STRIPE_WEBHOOK_SECRET` è sbagliato o non corrisponde
- Aggiorna la variabile d'ambiente su Vercel con il secret corretto
- Redeploy

---

**Errore 3: Missing required metadata**
```
[Stripe Webhook] Missing required metadata
```
**Soluzione:**
- Il checkout non ha passato correttamente i metadata
- Verifica che `supabaseUserId` sia presente nella sessione
- Questo dovrebbe essere automatico (vedi `app/[locale]/plans/actions.ts`)

---

**Errore 4: Unhandled event type**
```
[Stripe Webhook] Unhandled event type: invoice.payment_succeeded
```
**Nota:** Questo è normale, vengono loggati tutti gli eventi ricevuti.
Solo `checkout.session.completed`, `customer.subscription.updated`, e `customer.subscription.deleted` vengono processati.

---

## 🔄 **STEP 4: Ri-triggerare Webhook per Checkout Esistente**

Se hai già completato un checkout e il piano non è stato aggiornato:

1. Vai su Stripe Dashboard → **Developers** → **Events**
2. Filtra per `checkout.session.completed`
3. Trova l'evento relativo al tuo checkout (cerca per email utente o timestamp)
4. Clicca sull'evento
5. Clicca **"Send test webhook"** → Seleziona endpoint → **Send**

Questo riprocesserà l'evento e aggiornerà il piano.

---

## 🧪 **STEP 5: Test End-to-End**

### **Test Completo:**

1. **Logout** dal sito
2. **Login** come Company Admin
3. Vai su `/plans`
4. Seleziona un piano (SMB o Enterprise)
5. Clicca **"Select Plan"**
6. Completa checkout con carta test: `4242 4242 4242 4242`
7. Verrai reindirizzato a `/plans?checkout=success`

### **Verifica Immediata (dopo redirect):**

1. Vai su **Stripe Dashboard → Developers → Events**
2. Filtra per `checkout.session.completed`
3. L'ultimo evento dovrebbe essere il tuo checkout (< 1 minuto fa)
4. Clicca sull'evento
5. In alto: **"Send test webhook"** → Send

### **Verifica Profilo:**

1. Vai su `/profile`
2. Verifica che:
   - **Plan:** mostra il piano corretto (SMB/Enterprise)
   - **Next renewal:** mostra una data (es. "Renews on 06 Feb, 2026")
   - (Non più "Not available")

---

## 🐛 **STEP 6: Debug Avanzato**

### **A) Verifica Metadata Subscription su Stripe**

1. Stripe Dashboard → **Customers**
2. Cerca il customer per email
3. Clicca sul customer
4. Vai su **Subscriptions**
5. Clicca sulla subscription attiva
6. Scorri fino a **"Metadata"**
7. Verifica che contenga:
   ```
   supabaseUserId: [il tuo user ID]
   planId: smb (o enterprise)
   billingCycle: monthly (o annual)
   ```

Se manca `supabaseUserId`, il webhook non può aggiornare il piano!

### **B) Verifica User Metadata su Supabase**

1. Supabase Dashboard → **Authentication** → **Users**
2. Trova il tuo utente (email)
3. Clicca per espandere
4. Guarda **"User Metadata"** (JSON)
5. Verifica che contenga:
   ```json
   {
     "plan": {
       "id": "smb",
       "billingCycle": "monthly",
       "renewalAt": "2026-02-06T12:00:00Z",
       "subscriptionId": "sub_...",
       "customerId": "cus_...",
       ...
     }
   }
   ```

Se il campo `plan` è assente o ha dati vecchi, il webhook non è stato processato.

---

## 🚨 **TROUBLESHOOTING: Webhook Ancora Non Funziona**

### **Problema: Webhook ricevuto ma piano non aggiornato**

**Check 1: Verifica che il webhook riceva 200 OK**
- Stripe Dashboard → Webhooks → Your Endpoint → Recent Deliveries
- Status deve essere **200** (verde)
- Se è **400/500**, leggi il messaggio di errore

**Check 2: Verifica signature secret**
```bash
# In Vercel env vars
STRIPE_WEBHOOK_SECRET=whsec_...

# Deve matchare il secret mostrato su Stripe Dashboard
```

**Check 3: Verifica che Supabase Service Role Key sia corretto**
```bash
# In Vercel env vars
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Deve matchare la chiave su Supabase Dashboard → Settings → API
```

**Check 4: Forza refresh user metadata**

Se tutto sembra corretto ma il piano non si aggiorna nel profilo:
1. Logout
2. Login di nuovo
3. Ricarica la pagina profilo (Ctrl+R)

---

## 📞 **SUPPORT**

Se dopo tutti questi step il problema persiste:

1. **Copia i log** da Vercel Functions (STEP 3)
2. **Copia i metadata** della subscription da Stripe (STEP 6A)
3. **Copia i user metadata** da Supabase (STEP 6B)
4. Contatta il supporto con questi dati

---

## ✅ **CHECKLIST FINALE**

Prima di considerare il webhook funzionante:

- [ ] Endpoint webhook creato su Stripe
- [ ] Eventi selezionati (checkout.session.completed, ecc.)
- [ ] `STRIPE_WEBHOOK_SECRET` aggiornato su Vercel
- [ ] Redeploy completato dopo aggiornamento env var
- [ ] Test checkout completato
- [ ] Webhook triggerato manualmente (test mode)
- [ ] Log Vercel mostrano elaborazione corretta
- [ ] Piano aggiornato nel profilo utente
- [ ] "Next renewal" mostra data corretta

---

**Ultimo aggiornamento:** 6 Gennaio 2026  
**Webhook logging:** Attivo (vedi `app/api/stripe/webhook/route.ts`)

