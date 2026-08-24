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
