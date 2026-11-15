# Tasks: Real-Estate Listing Browse, Filter, and Detail

**Input**: Migrated design documents in `specs/listing-browse/`

**Status**: migrated — tasks below describe implemented work and are marked complete.

**Testing**: No automated test framework or test files were found for this feature.

## Phase 1: Listing Data

- [x] T001 Define the `Listing` entity and its required and optional fields in `prisma/schema.prisma`.
- [x] T002 Create the initial PostgreSQL `Listing` table in `prisma/migrations/20260821164242_init/migration.sql`.
- [x] T003 Provide sample listing records through `prisma/seed.ts`.
- [x] T004 Provide the shared Prisma client in `lib/prisma.ts`.

## Phase 2: Catalog and Filtering

- [x] T005 Query and render catalog results from `app/page.tsx`, ordered newest first.
- [x] T006 Parse city, minimum/maximum price, minimum area, and minimum rooms from URL query parameters in `app/page.tsx`.
- [x] T007 Implement the GET filter form and reset navigation in `components/filters-form.tsx`.
- [x] T008 Render listing cards with formatted prices, property summaries, and detail links in `components/listing-card.tsx`.
- [x] T009 Handle catalog query failure and no-results states in `app/page.tsx`.

## Phase 3: Listing Details and Images

- [x] T010 Load a listing by ID and resolve invalid, missing, or database-error cases in `app/annunci/[id]/page.tsx`.
- [x] T011 Render available property fields and the original source link in `app/annunci/[id]/page.tsx`.
- [x] T012 Configure the remote listing-image host in `next.config.ts`.
- [x] T013 Provide a fallback listing image at `public/placeholder-house.png`.

## Verification and Known Gaps

- [x] T014 Confirmed that the project defines `npm run lint` and `npm run build`; lint passed during repository validation.
- [x] T015 Confirmed that no automated tests or test runner are present for this feature.
- [x] T016 Document the observed behavior that unparseable numeric filters are ignored (while parseable integer prefixes are accepted) and detail-query database failures resolve to not-found.

## Migration Notes

The completed-task checklist reflects implementation detected in the source tree, not an independent end-to-end test. No test cases were inferred as existing. Known limitations are recorded in [spec.md](./spec.md).
