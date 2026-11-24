---
description: Planned local setup and validation for the auction dashboard
---

# Quickstart: Property Auction Dashboard

The auction route, models, migration, and sync command are implemented.

## Prerequisites

* Existing project dependencies and a local PostgreSQL database
* `DATABASE_URL` in the local environment, following the repository README
* A database suitable for development migrations and test data
* A daily scheduler for production; the deployment environment is undecided

## Setup After Implementation

From the repository root, apply the migrations and generate Prisma Client:

```powershell
npx prisma migrate deploy
npm run prisma:generate
```

Start the application:

```powershell
npm run dev
```

For a manual refresh, run the command below. It contacts the selected PVP
endpoint and can take several minutes:

```powershell
npx tsx scripts/sync-auctions.ts
```

Open <http://localhost:3000/aste>. Configure the production scheduler separately
to run the same command at least daily. Use `npx prisma migrate deploy` for
deployment rather than the development migration command.

## Validation Scenarios

Use controlled source responses and a test database to avoid depending on live
portal data for repeatable scenarios.

1. Provide multiple pages with known property and non-property records. Confirm
   that the published snapshot contains each mapped property record once and
   that every dashboard page can be reached.
2. Filter by city, inclusive price bounds, and inclusive date bounds separately
   and together. Check missing values, invalid ranges, no matches, and clearing
   filters.
3. Simulate an empty successful result, a first-run source failure, and a failed
   or incomplete update after success. Confirm distinct empty, unavailable,
   and warning states, with the old snapshot retained on failure.
4. Simulate additions, changed fields, and removals in a subsequent successful
   collection. Confirm that only the newly published snapshot is active.
5. Simulate duplicate IDs, missing pages, changing totals, malformed data,
   unknown categories, and rate limiting. Confirm that the run fails without
   replacing the last published snapshot.
6. Run two workers concurrently and simulate lease expiry. Confirm that only
   the current lease holder can publish and a superseded worker cannot.
7. Browse while a new snapshot publishes. Confirm stable pagination for the
   selected snapshot and an explicit reload message after it expires.
8. Check missing fields, source links, keyboard access, and layouts at 320 and
   1440 pixels. Confirm source links identify the corresponding announcement.
9. With a last complete update older than 24 hours, confirm the stale warning.
   Confirm the production scheduler's daily attempts through its run history.

Use a known complete reference collection to assess the completeness target.
Controlled tests and page counts alone cannot prove full upstream coverage or
snapshot consistency.

## Quality Gates

```powershell
npm run lint
npm run build
```

Run the focused automated tests against the configured development database:

```powershell
node --env-file=.env --import tsx --test tests/auction-card.test.tsx tests/auction-sync.test.ts tests/pvp-auction-client.test.ts tests/auction-queries.test.ts
```

The tests use uniquely named collections and remove only their own records.

## Validation Results

On 2026-11-23, the focused tests passed for source mapping, missing fields,
filters, pagination, stale and failed states, snapshot replacement, retention,
lease expiry, and nonnegative prices. The initial import completed with 324,545
source records and 270,580 property records.

Browser checks covered the unavailable and populated states, invalid filters,
no matches, source links, snapshot pagination, keyboard access, and layouts at
320 and 1440 pixels without horizontal overflow. A local sample of 20 dashboard
requests had a 95th percentile of 1,561 ms. This sample is not a production
performance study. No participant-based usability study was performed.

The production scheduler remains unconfigured. A completed source traversal
does not establish complete upstream coverage.
