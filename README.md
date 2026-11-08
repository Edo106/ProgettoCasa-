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

## Autenticazione

Gli annunci restano pubblici. I visitatori possono registrarsi con email e
password (almeno 12 caratteri) oppure accedere con Google. Per gli account con
password è richiesta la verifica dell'email; è disponibile anche il recupero
della password.

1. Configura PostgreSQL e `DATABASE_URL`, quindi applica tutte le migration:

   ```bash
   npx prisma migrate deploy
   npm run prisma:generate
   ```

2. Nel file `.env` imposta:
   - `BETTER_AUTH_URL`: l'URL pubblico del sito, per esempio `http://localhost:3000` in locale.
   - `BETTER_AUTH_SECRET`: un segreto casuale di almeno 32 caratteri. Puoi generarlo con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
   - `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: credenziali OAuth di un'applicazione web configurata in Google Cloud.
   - `RESEND_API_KEY`: chiave API di Resend.
   - `AUTH_EMAIL_FROM`: mittente di un dominio verificato su Resend, per esempio `ProgettoCasa <accesso@tuo-dominio.it>`.

3. In Google Cloud autorizza l'URI di callback
   `http://localhost:3000/api/auth/callback/google` per lo sviluppo e
   `https://<tuo-dominio>/api/auth/callback/google` per la produzione.
   Configura anche la schermata di consenso OAuth e gli eventuali utenti di test.
4. Su Vercel imposta le stesse variabili con URL e credenziali di produzione,
   applica le migration al database e ridistribuisci l'applicazione. Non
   inserire segreti nei file tracciati da Git.

Le email vengono inviate in background: controlla i log del server se la
consegna fallisce. Il limite di richieste per l'autenticazione è memorizzato
nel database. Su Vercel usa l'indirizzo IP fornito dal proxy Vercel; negli altri
ambienti tutte le richieste condividono il limite, salvo un'integrazione con un
proxy attendibile. Non esporre un'istanza di produzione dietro un proxy non
configurato.

Se PowerShell blocca `npm.ps1`, sostituisci `npm` con `npm.cmd` e `npx` con
`npx.cmd` nei comandi sopra.

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
