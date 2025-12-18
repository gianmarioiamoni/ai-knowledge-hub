# Guida Completa all'Internazionalizzazione con next-intl

Questa guida documenta come è implementata l'internazionalizzazione nel progetto AI Knowledge Companion usando **next-intl** e come replicare la stessa implementazione in altri progetti.

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Installazione e Setup](#installazione-e-setup)
3. [Configurazione Base](#configurazione-base)
4. [Struttura File](#struttura-file)
5. [Middleware e Routing](#middleware-e-routing)
6. [Language Switcher](#language-switcher)
7. [Persistenza della Lingua](#persistenza-della-lingua)
8. [Uso delle Traduzioni](#uso-delle-traduzioni)
9. [Navigazione Localizzata](#navigazione-localizzata)
10. [Best Practices](#best-practices)

---

## 🎯 Panoramica

Il progetto utilizza **next-intl v4.3.12** con Next.js 15 App Router per gestire:
- **2 lingue**: Inglese (en) come default, Italiano (it) come traduzione
- **Routing localizzato**: Tutte le route includono il prefisso locale (`/en/...`, `/it/...`)
- **Persistenza automatica**: La preferenza lingua viene salvata in un cookie e persiste tra sessioni
- **Language switcher**: Componente dropdown per cambiare lingua mantenendo la pagina corrente

---

## 📦 Installazione e Setup

### 1. Installare le dipendenze

```bash
pnpm add next-intl
# oppure
npm install next-intl
# oppure
yarn add next-intl
```

### 2. Versione utilizzata nel progetto

```json
{
  "dependencies": {
    "next-intl": "^4.3.12"
  }
}
```

---

## ⚙️ Configurazione Base

### 1. File di Configurazione Routing (`src/i18n/routing.ts`)

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Lista di tutte le lingue supportate
  locales: ["en", "it"],

  // Lingua di default quando nessuna locale corrisponde
  defaultLocale: "en",
  
  // Assicura che il locale sia sempre nell'URL
  // Opzioni: "always" | "as-needed" | "never"
  localePrefix: "always"
});

// Export del tipo per TypeScript
export type Locale = (typeof routing.locales)[number];
```

**Spiegazione**:
- `locales`: Array delle lingue supportate
- `defaultLocale`: Lingua predefinita se non specificata
- `localePrefix: "always"`: Forza il prefisso locale nell'URL (es. `/en/dashboard`, `/it/dashboard`)

### 2. File di Configurazione Request (`src/i18n/request.ts`)

```typescript
import { getRequestConfig } from "next-intl/server";

// Configurazione statica per compatibilità con Vercel serverless
export default getRequestConfig(async ({ locale }) => {
  // Usa il parametro locale se fornito, altrimenti default a 'en'
  const actualLocale = locale || "en";

  // Importa i messaggi staticamente (verranno inclusi nel bundle da webpack)
  // Funziona sia in development che in produzione su Vercel
  const messages = (await import(`../../messages/${actualLocale}.json`)).default;

  return {
    locale: actualLocale,
    messages,
  };
});
```

**Spiegazione**:
- Carica dinamicamente i file di traduzione in base al locale
- I messaggi vengono importati staticamente per ottimizzazione del bundle

### 3. File di Navigazione Localizzata (`src/i18n/navigation.ts`)

```typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Crea componenti e hook di navigazione localizzati
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// Re-export di tipi e costanti dal routing
export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
```

**Spiegazione**:
- `createNavigation` crea versioni localizzate di `Link`, `useRouter`, `usePathname`
- Questi componenti gestiscono automaticamente il prefisso locale nell'URL

### 4. Configurazione Next.js (`next.config.ts`)

```typescript
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

// Plugin per integrare next-intl con Next.js
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // ... altre configurazioni
};

export default withNextIntl(nextConfig);
```

**Spiegazione**:
- Il plugin `next-intl/plugin` integra next-intl nel processo di build
- Punto al file di configurazione request (`./src/i18n/request.ts`)

---

## 📁 Struttura File

```
project-root/
├── messages/                    # File di traduzione
│   ├── en.json                 # Traduzioni inglese
│   └── it.json                 # Traduzioni italiano
├── src/
│   ├── i18n/
│   │   ├── routing.ts          # Configurazione routing
│   │   ├── request.ts          # Configurazione request
│   │   └── navigation.ts       # Navigazione localizzata
│   ├── app/
│   │   └── [locale]/           # Route localizzate
│   │       ├── layout.tsx      # Layout con NextIntlClientProvider
│   │       ├── page.tsx        # Home page
│   │       ├── dashboard/
│   │       └── ...
│   └── components/
│       └── language-switcher.tsx
├── middleware.ts               # Middleware per i18n e auth
└── next.config.ts              # Configurazione Next.js
```

### Struttura File di Traduzione

**`messages/en.json`**:
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "profile": "Profile"
  }
}
```

**`messages/it.json`**:
```json
{
  "common": {
    "loading": "Caricamento...",
    "error": "Errore",
    "save": "Salva"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "profile": "Profilo"
  }
}
```

---

## 🔄 Middleware e Routing

### Middleware (`middleware.ts`)

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware"; // Opzionale: per auth

/**
 * Middleware combinato per i18n e gestione sessioni
 * 
 * Ordine di esecuzione:
 * 1. next-intl i18n routing (gestisce i redirect di locale per primo)
 * 2. Supabase session refresh e auth guards (solo dopo che il locale è determinato)
 * 
 * Questo ordine è critico:
 * - i18n deve processare i redirect di locale PRIMA dei controlli auth
 * - Altrimenti, / -> /en redirect avviene DOPO auth redirect, causando loop
 */
async function middleware(request: NextRequest) {
  // Step 1: Applica middleware i18n per gestire i redirect di locale
  const intlMiddleware = createMiddleware(routing);
  const intlResponse = intlMiddleware(request);
  
  // Se i18n ha restituito un redirect (es. / -> /en), restituiscilo immediatamente
  // Il controllo auth avverrà nella prossima richiesta con il locale corretto
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }
  
  // Step 2: Applica middleware Supabase per controlli auth (opzionale)
  // A questo punto, la richiesta ha il locale corretto
  const supabaseResponse = await updateSession(request);
  
  // Se Supabase ha restituito un redirect (auth guard), restituiscilo
  if (supabaseResponse && supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }
  
  // Step 3: Unisci i cookie da entrambi i middleware
  // Copia i cookie di sessione Supabase nella risposta i18n
  if (supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
  }
  
  return intlResponse;
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match tutte le richieste tranne quelle che iniziano con:
     * - api (API routes)
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione immagini)
     * - favicon.ico (file favicon)
     * - manifest.webmanifest (manifest PWA)
     * - robots.txt, sitemap.xml (file SEO)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|messages/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
```

**Funzionalità del Middleware**:
1. **Redirect automatico**: `/` → `/en` (o `/it` se preferito)
2. **Gestione cookie**: Salva automaticamente la preferenza lingua in un cookie `NEXT_LOCALE`
3. **Rilevamento lingua**: Usa il cookie o l'header `Accept-Language` del browser
4. **Integrazione auth**: Se usi autenticazione, integra il middleware i18n con quello auth

---

## 🌐 Language Switcher

### Componente Language Switcher (`src/components/language-switcher.tsx`)

```typescript
'use client'

import { JSX } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
]

export function LanguageSwitcher(): JSX.Element {
  const locale = useLocale() // Hook per ottenere il locale corrente
  const pathname = usePathname() // Hook per ottenere il pathname senza locale
  const router = useRouter() // Router localizzato

  const currentLanguage = languages.find(lang => lang.code === locale)

  const handleLanguageChange = (newLocale: string) => {
    // Usa router.push con opzione locale per cambiare lingua
    // Mantiene la stessa pagina, cambia solo la lingua
    router.push(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Change language"
        >
          <Languages className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-base">{currentLanguage?.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={language.code === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2 text-base">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Funzionalità**:
- Mostra la lingua corrente con bandiera
- Dropdown per selezionare una nuova lingua
- Mantiene la pagina corrente quando si cambia lingua
- Usa `useRouter` e `usePathname` da `@/i18n/navigation` (non da `next/navigation`)

---

## 💾 Persistenza della Lingua

### Come Funziona la Persistenza

**next-intl gestisce automaticamente la persistenza della lingua** tramite:

1. **Cookie `NEXT_LOCALE`**: 
   - Viene creato automaticamente dal middleware quando l'utente visita una pagina
   - Contiene il codice della lingua (es. `"en"`, `"it"`)
   - Persiste tra sessioni (anche dopo logout/login)
   - Scadenza: di default non ha scadenza (persiste finché non viene eliminato)

2. **Priorità di Rilevamento**:
   ```
   1. Cookie NEXT_LOCALE (se presente)
   2. Header Accept-Language del browser
   3. defaultLocale dalla configurazione
   ```

3. **Comportamento**:
   - Quando l'utente cambia lingua tramite il language switcher, il cookie viene aggiornato
   - Il cookie persiste anche dopo logout
   - Alla prossima visita, il middleware legge il cookie e reindirizza alla lingua salvata

### Verifica del Cookie

Puoi verificare il cookie nel browser:
- **Chrome DevTools**: Application → Cookies → `NEXT_LOCALE`
- **Valore**: `"en"` o `"it"`

### Personalizzazione Cookie (Opzionale)

Se vuoi personalizzare il cookie (scadenza, dominio, etc.), puoi configurare il middleware:

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
  // Personalizza il nome del cookie (default: 'NEXT_LOCALE')
  localeCookie: 'MY_LOCALE',
  // Personalizza altre opzioni se necessario
});

export default intlMiddleware;
```

---

## 📝 Uso delle Traduzioni

### 1. Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('navigation');
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('profile')}</p>
    </div>
  );
}
```

### 2. Client Components

```typescript
'use client'

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('navigation');
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('profile')}</p>
    </div>
  );
}
```

### 3. Traduzioni con Namespace

```typescript
// File: messages/en.json
{
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password"
    }
  }
}

// Uso
const t = useTranslations('auth.login');
t('title') // "Login"
t('email') // "Email"
```

### 4. Traduzioni con Parametri

```typescript
// File: messages/en.json
{
  "common": {
    "welcome": "Welcome, {name}!"
  }
}

// Uso
const t = useTranslations('common');
t('welcome', { name: 'John' }) // "Welcome, John!"
```

---

## 🔗 Navigazione Localizzata

### 1. Usare Link Localizzato

```typescript
import { Link } from '@/i18n/navigation';

export function MyComponent() {
  return (
    <Link href="/dashboard">
      Go to Dashboard
    </Link>
  );
}
```

**Comportamento**:
- Se sei su `/en/dashboard`, il link punta a `/en/dashboard`
- Se sei su `/it/dashboard`, il link punta a `/it/dashboard`
- Il prefisso locale viene aggiunto automaticamente

### 2. Usare Router Localizzato

```typescript
'use client'

import { useRouter } from '@/i18n/navigation';

export function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/dashboard'); // Naviga mantenendo il locale corrente
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### 3. Cambiare Lingua Mantenendo la Pagina

```typescript
'use client'

import { useRouter, usePathname } from '@/i18n/navigation';

export function ChangeLanguage() {
  const router = useRouter();
  const pathname = usePathname(); // Pathname senza locale
  
  const switchToItalian = () => {
    router.push(pathname, { locale: 'it' });
  };
  
  return <button onClick={switchToItalian}>Switch to Italian</button>;
}
```

### 4. Redirect Localizzato

```typescript
import { redirect } from '@/i18n/navigation';

export async function MyAction() {
  redirect('/dashboard'); // Redirect mantiene il locale corrente
}
```

---

## 🏗️ Layout con NextIntlClientProvider

### Layout Root (`src/app/[locale]/layout.tsx`)

```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Valida che il parametro locale sia valido
  if (!routing.locales.includes(locale as 'en' | 'it')) {
    notFound()
  }

  // Carica i messaggi per il locale corrente
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Punti Chiave**:
- `generateStaticParams`: Genera le route statiche per ogni locale
- Validazione locale: Verifica che il locale sia valido
- `NextIntlClientProvider`: Fornisce i messaggi ai client components
- Attributo `lang`: Imposta la lingua dell'HTML

---

## ✅ Best Practices

### 1. Struttura File di Traduzione

Organizza le traduzioni per namespace logici:

```json
{
  "common": { ... },
  "navigation": { ... },
  "auth": {
    "login": { ... },
    "signup": { ... }
  },
  "dashboard": { ... }
}
```

### 2. Usa TypeScript per Type Safety

```typescript
// Crea un tipo per le chiavi di traduzione
type TranslationKeys = 
  | 'common.loading'
  | 'navigation.dashboard'
  | 'auth.login.title';

// Usa in componenti
const t = useTranslations<TranslationKeys>('common');
```

### 3. Evita Hardcoded Stringhe

❌ **Sbagliato**:
```typescript
<h1>Dashboard</h1>
```

✅ **Corretto**:
```typescript
const t = useTranslations('navigation');
<h1>{t('dashboard')}</h1>
```

### 4. Gestisci Pluralizzazione

```json
{
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

```typescript
t('items', { count: 0 }) // "No items"
t('items', { count: 1 }) // "1 item"
t('items', { count: 5 }) // "5 items"
```

### 5. Test delle Traduzioni

Assicurati che tutte le chiavi esistano in tutte le lingue:

```typescript
// Script di validazione (es. scripts/validate-translations.ts)
const enKeys = Object.keys(enTranslations);
const itKeys = Object.keys(itTranslations);

const missing = enKeys.filter(key => !itKeys.includes(key));
if (missing.length > 0) {
  console.error('Missing translations:', missing);
}
```

---

## 🔍 Troubleshooting

### Problema: Il locale non viene salvato

**Soluzione**: Verifica che il middleware sia configurato correttamente e che il cookie `NEXT_LOCALE` venga creato.

### Problema: Redirect loop

**Soluzione**: Assicurati che il middleware i18n venga eseguito prima di altri middleware (auth, etc.).

### Problema: Le traduzioni non si aggiornano

**Soluzione**: 
1. Riavvia il server di sviluppo
2. Verifica che i file JSON siano validi
3. Controlla che il namespace sia corretto

### Problema: Link non mantiene il locale

**Soluzione**: Usa sempre `Link` da `@/i18n/navigation`, non da `next/link`.

---

## 📚 Risorse Aggiuntive

- [Documentazione next-intl](https://next-intl-docs.vercel.app/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📋 Checklist Implementazione

- [ ] Installare `next-intl`
- [ ] Creare `src/i18n/routing.ts`
- [ ] Creare `src/i18n/request.ts`
- [ ] Creare `src/i18n/navigation.ts`
- [ ] Configurare `next.config.ts` con plugin
- [ ] Creare `middleware.ts`
- [ ] Creare cartella `messages/` con file JSON
- [ ] Creare layout `src/app/[locale]/layout.tsx`
- [ ] Creare componente `LanguageSwitcher`
- [ ] Sostituire tutti i `Link` con versioni localizzate
- [ ] Sostituire tutti i `useRouter` con versioni localizzate
- [ ] Aggiungere traduzioni a tutti i componenti
- [ ] Testare cambio lingua e persistenza

---

**Ultimo aggiornamento**: Basato su implementazione in AI Knowledge Companion (Next.js 15, next-intl 4.3.12)

