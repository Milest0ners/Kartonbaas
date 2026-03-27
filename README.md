# Kartonbaas

Levensgrote kartonnen cut-outs bestellen via een moderne one-page website.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Mollie iDEAL
- Cloudinary (foto upload)
- Resend of Nodemailer (e-mail)

---

## Setup

### 1. Installeer dependencies

```bash
npm install
```

### 2. Maak een lokaal env-bestand aan

```bash
cp .env.example .env.local
```

### 3. Vul de environment variables in

Open `.env.local` en vul de volgende waarden in:

| Variabele | Beschrijving |
|---|---|
| `MOLLIE_API_KEY` | Test API key van je Mollie dashboard |
| `MOLLIE_WEBHOOK_URL` | Publieke URL van je webhook endpoint |
| `MOLLIE_REDIRECT_URL` | URL na betaling, bijv. `http://localhost:3000/bedankt` |
| `CLOUDINARY_CLOUD_NAME` | Cloud naam van je Cloudinary account |
| `CLOUDINARY_API_KEY` | API key van Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret van Cloudinary |
| `RESEND_API_KEY` | API key van Resend (of gebruik SMTP vars) |
| `RESEND_DOMAIN` | Domein waarvandaan je mailt, bijv. `kartonbaas.nl` |
| `ADMIN_EMAIL` | E-mailadres voor ordernotificaties |
| `NEXT_PUBLIC_SITE_URL` | Publieke URL van de site, bijv. `http://localhost:3000` |
| `SUPABASE_URL` | URL van je Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key voor server-side orderopslag |
| `ADMIN_DASHBOARD_TOKEN` | Optionele beveiligingstoken voor `/admin/orders` |

### 4. Start de dev server

```bash
npm run dev
```

De site is bereikbaar op [http://localhost:3000](http://localhost:3000).

---

## Mollie webhook testen

Mollie stuurt een POST naar `/api/webhook` zodra een betaling is verwerkt. Lokaal is dit endpoint niet bereikbaar voor Mollie, tenzij je een tunnel opzet.

### Optie 1: ngrok

1. Installeer ngrok via [ngrok.com](https://ngrok.com)
2. Start een tunnel: `ngrok http 3000`
3. Kopieer de publieke URL (bijv. `https://abc123.ngrok-free.app`)
4. Zet in `.env.local`:
   ```
   MOLLIE_WEBHOOK_URL=https://abc123.ngrok-free.app/api/webhook
   MOLLIE_REDIRECT_URL=https://abc123.ngrok-free.app/bedankt
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
   ```
5. Herstart de dev server

### Optie 2: cloudflared

1. Installeer cloudflared via [developers.cloudflare.com/cloudflare-one/connections/connect-networks](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
2. Start een tunnel: `cloudflared tunnel --url http://localhost:3000`
3. Gebruik de verkregen URL op dezelfde manier als bij ngrok

### Handmatig testen

Je kunt de webhook ook handmatig aanroepen met een Mollie payment ID:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id=tr_testpaymentid"
```

---

## Betalingsflow

1. Klant vult het formulier in en klikt op "Afrekenen"
2. Front-end POST naar `/api/create-payment`
3. Server maakt een Mollie payment aan en geeft de `checkoutUrl` terug
4. Klant wordt doorgestuurd naar de Mollie betaalpagina
5. Na betaling stuurt Mollie de klant terug naar `MOLLIE_REDIRECT_URL`
6. Mollie stuurt ook een webhook POST naar `MOLLIE_WEBHOOK_URL`
7. De webhook haalt de betalingsstatus op, maakt een ordernummer aan, slaat de order op (Supabase) en verstuurt de e-mails

---

## Orders beheren (Supabase + admin pagina)

Voor betrouwbaar orderbeheer raden we aan om elke betaalde order op te slaan in Supabase.

### 1. Maak de database tabel aan

1. Open je Supabase SQL editor
2. Voer het SQL-script uit uit `supabase/orders_schema.sql`

### 2. Stel env vars in

Zet deze variabelen in `.env.local` en in je deploy omgeving:

```bash
SUPABASE_URL=https://jouw-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_DASHBOARD_TOKEN=een_lang_geheim_token
```

### 3. Open het dashboard

Gebruik:

```text
/admin/orders?t=JE_TOKEN
```

In deze pagina kun je:
- betaalde orders bekijken
- mailstatus per order zien
- fulfillment status aanpassen (`nieuw`, `in_behandeling`, `in_productie`, `verzonden`, `afgerond`)

## Prijzen aanpassen

Alle prijzen staan centraal in `lib/pricing.ts`. Pas de waarden daar aan en de hele UI past zich automatisch aan.

---

## Deploy op Vercel

1. Push je project naar GitHub
2. Importeer het project in [vercel.com](https://vercel.com)
3. Stel alle environment variables in via het Vercel dashboard
4. Zorg dat `MOLLIE_WEBHOOK_URL` wijst naar je live domein (`https://jouwdomein.nl/api/webhook`)
5. Zorg dat `MOLLIE_REDIRECT_URL` en `NEXT_PUBLIC_SITE_URL` overeenkomen met je live domein
6. Schakel in Mollie van test mode naar live mode en vervang de API key

> **Let op:** de webhook URL moet altijd publiek bereikbaar zijn. Mollie kan geen webhook sturen naar een localhost URL.

---

## Projectstructuur

```
app/
  layout.tsx          # Root layout met metadata en JSON-LD
  page.tsx            # One-page samenstelling
  globals.css         # Tailwind base styles
  api/
    upload/           # POST /api/upload
    create-payment/   # POST /api/create-payment
    webhook/          # POST /api/webhook
    payment-status/   # GET /api/payment-status?id=...
    admin/orders/status # POST /api/admin/orders/status

lib/
  pricing.ts          # Alle prijzen en berekeningslogica
  mollie.ts           # Mollie client en payment helpers
  email.ts            # E-mail templates en verzending
  orders-store.ts     # Supabase orderopslag en statusbeheer
  upload.ts           # Cloudinary upload helper
  validation.ts       # Server-side validatie

components/
  Header.tsx
  Footer.tsx
  Configurator.tsx    # Formulier met prijsberekening
  UploadField.tsx     # Drag-and-drop upload component
  GsapProvider.tsx    # GSAP initialisatie
  SuccessBanner.tsx   # Banner na succesvolle betaling
  sections/
    Hero.tsx
    HowItWorks.tsx
    Pricing.tsx
    Examples.tsx
    Reviews.tsx
    About.tsx
    FAQ.tsx
    Order.tsx
```
