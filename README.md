# ProgettoCasa

Aggregatore di annunci di case in vendita, ottimizzato mobile-first e responsive da smartphone a desktop.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Configurazione base PWA (manifest, icone, meta)

## Avvio in locale

1. Installa le dipendenze:

```bash
npm install
```

2. Configura l'ambiente:

```bash
cp .env.example .env
```

3. Configura `DATABASE_URL` nel file `.env` con un database PostgreSQL.

4. Applica la migration:

```bash
npx prisma migrate dev --name init
```

5. Popola il database con annunci di esempio:

```bash
npm run prisma:seed
```

6. Avvia il server di sviluppo:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Script utili

- `npm run dev` – sviluppo
- `npm run build` – build produzione
- `npm run start` – avvio produzione
- `npm run lint` – linting
- `npm run prisma:generate` – genera Prisma Client
- `npm run prisma:migrate` – esegue migration in sviluppo
- `npm run prisma:seed` – esegue seed database

## Setup database da Vercel (senza locale)

Se non hai un ambiente locale puoi inizializzare lo schema Prisma dal deploy Vercel con un endpoint temporaneo protetto.

### 1) Variabili ambiente richieste su Vercel

In `Project > Settings > Environment Variables` imposta:

- `DATABASE_URL` (obbligatoria): stringa di connessione reale del database PostgreSQL
- `DB_SETUP_TOKEN` (obbligatoria): token segreto forte usato per autorizzare la chiamata
- `ENABLE_DB_SETUP_ENDPOINT=true` (obbligatoria per abilitare temporaneamente l'endpoint)

Dopo aver salvato le variabili, fai redeploy.

### 2) Esegui setup una sola volta

```bash
curl -X POST "https://<tuo-dominio>/api/db-setup" \
  -H "x-setup-token: <DB_SETUP_TOKEN>"
```

Se va a buon fine l'endpoint esegue `prisma db push --skip-generate` sul database configurato.

### 3) Disattivazione / rollback sicurezza

Subito dopo la prima inizializzazione:

- imposta `ENABLE_DB_SETUP_ENDPOINT=false` (o rimuovila)
- opzionale: ruota o rimuovi `DB_SETUP_TOKEN`

Con endpoint disabilitato la route risponde `404`.
