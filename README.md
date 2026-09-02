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
- `postinstall` (automatico dopo `npm install`, anche su Vercel) – esegue `prisma generate`

## Setup database da Vercel (senza locale)

Se non hai un ambiente locale puoi collegare un database Postgres gestito da Vercel e inizializzare lo schema Prisma direttamente dal deploy, con un endpoint temporaneo protetto.

### 0) Crea il database Postgres su Vercel

1. Apri il progetto su [vercel.com](https://vercel.com) e vai nella scheda **Storage**.
2. Clicca **Create Database** → scegli **Postgres** (Neon/Vercel Postgres) → segui il wizard e collega il database al progetto.
3. Vercel aggiunge automaticamente delle environment variable al progetto (es. `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`). Questo progetto usa Prisma con la variabile `DATABASE_URL`, quindi:
   - vai in `Project > Settings > Environment Variables`;
   - aggiungi `DATABASE_URL` e come valore usa quello di `POSTGRES_PRISMA_URL` (connessione pooled, consigliata per Prisma su serverless). In alternativa puoi copiare direttamente la connection string dalla scheda Storage del database.

### 1) Variabili ambiente richieste su Vercel

In `Project > Settings > Environment Variables` imposta:

- `DATABASE_URL` (obbligatoria): stringa di connessione reale del database PostgreSQL (vedi punto 0)
- `DB_SETUP_TOKEN` (obbligatoria): token segreto forte usato per autorizzare la chiamata
- `ENABLE_DB_SETUP_ENDPOINT=true` (obbligatoria per abilitare temporaneamente l'endpoint)

Dopo aver salvato le variabili, fai redeploy.

> Nota: Vercel non legge i file `.env`/`.env.production` in produzione: usa sempre il pannello **Environment Variables**. Il file `.env.example` in questo repo elenca solo i nomi delle variabili richieste, da usare come riferimento.

### 2) Build e migration su Vercel

- Lo script `postinstall` (`prisma generate`) è già configurato in `package.json` e viene eseguito automaticamente da Vercel dopo `npm install`, così il Prisma Client è sempre aggiornato allo schema prima della `build`.
- Le migration vanno applicate al database di produzione con `prisma db push` (schema-first, usato da questo progetto) tramite l'endpoint `/api/db-setup` descritto sotto. Se in futuro si passa a `prisma migrate`, aggiungere `prisma migrate deploy` come step di build o eseguirlo manualmente dopo il deploy.

### 3) Esegui setup una sola volta

```bash
curl -X POST "https://<tuo-dominio>/api/db-setup" \
  -H "x-setup-token: <DB_SETUP_TOKEN>"
```

Se va a buon fine l'endpoint esegue `prisma db push --skip-generate` sul database configurato, creando le tabelle definite in `prisma/schema.prisma` (es. `Listing`).

### 4) Disattivazione / rollback sicurezza

Subito dopo la prima inizializzazione:

- imposta `ENABLE_DB_SETUP_ENDPOINT=false` (o rimuovila)
- opzionale: ruota o rimuovi `DB_SETUP_TOKEN`

Con endpoint disabilitato la route risponde `404`.
