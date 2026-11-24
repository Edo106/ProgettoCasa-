---
description: Implementation tasks for the property auction dashboard
---

# Tasks: Property Auction Dashboard

**Input**: [Plan](./plan.md), [specification](./spec.md),
[research](./research.md), [data model](./data-model.md),
[contracts](./contracts/dashboard.md), and [quickstart](./quickstart.md)

**Testing**: Use the existing Node.js test runner and `tsx` dependency for the
specified refresh-state tests. Do not introduce a new test framework. Use the
quickstart scenarios for additional focused validation.

**Organization**: Implement and validate each user story independently after
its actual prerequisites are complete.

## Format

* `[P]` marks tasks that can run in parallel without shared-file conflicts or
  unfinished dependencies.
* `[US1]`, `[US2]`, and `[US3]` identify the corresponding user stories.
* Every task identifies the files it creates, changes, or validates.

## Phase 1: Setup

No new project initialization or dependencies are required. Use the existing
application, PostgreSQL, Prisma, and `tsx` configuration.

## Phase 2: Foundational

**Purpose**: Establish shared snapshot persistence and safe publication.

- [X] T001 Define auction snapshot fields in `prisma/schema.prisma`: `id` is "Unique internal identifier"; `createdAt` is "Start time of the collection"; `completedAt` is "Completion time; absent until traversal succeeds"; `sourceRecordCount` is "Total upstream records observed for the traversal"; `propertyRecordCount` is "Number of normalized property announcements"; `state` is "`collecting`, `complete`, or `failed`".
- [X] T002 Define announcement fields in `prisma/schema.prisma`: `snapshotId` is "Owning snapshot"; `sourceId` is "Source announcement identifier, unique within a snapshot"; `sourceUrl` is "Verified corresponding original announcement URL"; `description` is "Property description, nullable"; `city`, `province`, and `address` are "Location fields, nullable"; `startingPrice` is "Nonnegative decimal amount in euros, nullable"; `auctionAt` is "Sale date and time as an instant when supplied and interpretable, nullable"; `status` is "Source status or outcome, nullable"; and `propertyCategory` is "Source classification used to identify a property". Add the `(snapshotId, sourceId)` uniqueness constraint and snapshot-scoped query indexes.
- [X] T003 Define run and singleton collection state in `prisma/schema.prisma`: run `id` and `snapshotId` are "Run identity and target snapshot"; `startedAt` and `finishedAt` are "Attempt timestamps"; run `state` is "`running`, `succeeded`, or `failed`"; `errorSummary` is "Sanitized failure reason, nullable"; `leaseOwner`, `leaseExpiresAt`, and `fencingToken` are "Exclusive-run control"; `pagesProcessed` and `recordsProcessed` are "Progress for operational diagnosis"; `activeSnapshotId` is "Nullable pointer to a completed snapshot"; `lastSuccessfulAt` is "Nullable completion time"; and `latestRunId` and `latestRunState` are "Latest attempt and outcome".
- [X] T004 Create and apply the migration for `prisma/schema.prisma` under `prisma/migrations/` using `npm run prisma:migrate -- --name add_auction_dashboard`, then run `npm run prisma:generate` against the configured development database.
- [X] T005 Implement database-backed lease acquisition, renewal, expiry recovery, fencing-token checks, failed-run recording, and atomic completed-snapshot publication in `lib/auction-snapshot-store.ts`; never publish a partial snapshot or let an expired worker publish.
- [X] T006 Implement snapshot retention and cleanup in `lib/auction-snapshot-store.ts`, keeping replaced complete snapshots for at least 24 hours and never deleting an active or unexpired browsable snapshot.

**Checkpoint**: A completed snapshot can be published atomically; failed,
concurrent, and expired workers cannot replace the last published snapshot.

## Phase 3: User Story 1 - Browse auction announcements (Priority: P1)

**Goal**: Browse the selected portal's property auction announcements with
pagination and explicit collection status.

**Independent Test**: Populate a controlled multi-page source collection, run
one sync, and browse all resulting property announcements without duplicates;
check empty, unavailable, stale, and failed-refresh states.

### Implementation

- [X] T007 [P] [US1] Create a responsive auction summary card in `components/auction-card.tsx` showing available description, location, price, date, and status, with explicit Italian unavailable labels for null values.
- [X] T008 [P] [US1] Add an `/aste` navigation link to desktop and mobile menus in `components/header.tsx` without changing the existing listing link.
- [X] T009 [P] [US1] Implement the selected PVP POST client in `lib/pvp-auction-client.ts` using the endpoint and observed request described in `specs/002-property-auction-dashboard/contracts/dashboard.md`, with bounded retries, timeouts, and explicit access and rate-limit errors.
- [X] T010 [US1] Add typed response validation, source page traversal, actual page-number handling, property classification, field normalization, and original-notice URL mapping in `lib/pvp-auction-client.ts`; reject unknown classifications, unresolvable links, malformed pages, duplicates, and inconsistent totals instead of guessing or publishing partial results.
- [X] T011 [US1] Implement collection into an isolated snapshot in `lib/auction-sync.ts`, including progress, lease renewal, pagination checks, zero-result handling, atomic publication, and failure recording while preserving the previous snapshot.
- [X] T012 [US1] Create the single-run command in `scripts/sync-auctions.ts`, using `lib/auction-sync.ts`, with exit `0` only after publication, nonzero on errors or lease contention, sanitized diagnostics, and no secret or full-record logging.
- [X] T013 [US1] Implement snapshot-scoped auction queries in `lib/auction-queries.ts`, including deterministic date/source-ID order, null dates last, one-based pagination, stable snapshot selection, and explicit expired-snapshot handling.
- [X] T014 [US1] Create the server-rendered `/aste` dashboard in `app/aste/page.tsx` using `lib/auction-queries.ts` and `components/auction-card.tsx`; distinguish unavailable, empty, expired, failed/incomplete, and older-than-24-hours stale states and show the last successful update.
- [X] T015 [US1] Add controlled refresh-state tests in `tests/auction-sync.test.ts` using the existing Node.js test runner and `tsx`, covering successful publication, failed and incomplete refreshes retaining the prior snapshot, and fencing against expired workers; run `node --env-file=.env --import tsx --test tests/auction-sync.test.ts`.
- [X] T016 [US1] Exercise the multi-page browsing, empty collection, first failure, stale results, responsive layouts, and concurrent publication scenarios in `specs/002-property-auction-dashboard/quickstart.md`; record outcomes without claiming upstream completeness from page counts.

**Checkpoint**: The MVP provides a usable browse experience from the selected
source; full upstream coverage remains an unverified limitation.

## Phase 4: User Story 2 - Find relevant announcements (Priority: P2)

**Goal**: Combine and clear city, price, and auction-date filters.

**Independent Test**: Apply individual and combined filters against known
records, including missing values and invalid ranges, then clear the filters.

### Implementation

- [X] T017 [P] [US2] Create the responsive filter form in `components/auction-filters-form.tsx` for city, minimum and maximum price, start and end dates, applying and clearing filters with accessible Italian labels.
- [X] T018 [US2] Extend `lib/auction-queries.ts` with case-insensitive trimmed city matching, inclusive decimal price bounds, inclusive Europe/Rome calendar-date bounds, AND composition, and exclusion of nulls required by active filters.
- [X] T019 [US2] Integrate the form and validated query parameters in `app/aste/page.tsx`; reject malformed or reversed ranges with inline errors, distinguish no matches, and reset page and snapshot selection when filters clear.
- [X] T020 [US2] Validate individual and combined filters, inclusive boundaries, missing values, invalid ranges, pagination, no matches, and reset behavior using the scenarios in `specs/002-property-auction-dashboard/quickstart.md`.

**Checkpoint**: Filtering works without changing unfiltered browsing or snapshot
consistency.

## Phase 5: User Story 3 - Verify an announcement at its source (Priority: P3)

**Goal**: Open the corresponding original announcement and understand that the
portal is authoritative.

**Independent Test**: Open a known dashboard result's source link and confirm
it leads to the matching announcement; check that absent fields remain marked
unavailable.

### Implementation

- [X] T021 [P] [US3] Add an accessible link to the corresponding stored source URL and retain explicit missing-value labels in `components/auction-card.tsx`; never synthesize an unestablished identifier.
- [X] T022 [P] [US3] Add an Italian informational notice in `app/aste/page.tsx` explaining that the source portal is authoritative for details and participation.
- [X] T023 [US3] Check source-link identity and unavailable-value presentation against controlled records using `specs/002-property-auction-dashboard/quickstart.md`.

**Checkpoint**: Each displayed notice directs visitors to its corresponding
source without inventing missing information.

## Final Phase: Polish and Verification

**Purpose**: Complete operational documentation and cross-story quality checks.

- [X] T024 [P] Update `README.md` with the auction dashboard, local migration, `npx tsx scripts/sync-auctions.ts`, failure behavior, source limitations, and the requirement for an external daily scheduler without committing secrets.
- [ ] T025 Configure the chosen production scheduler to run `scripts/sync-auctions.ts` at least once every 24 hours and record the deployment-specific setup in `README.md`; blocked because hosting and scheduler are undecided.
- [X] T026 Run `npm run lint` and `npm run build` for changes in `app/aste/page.tsx`, `components/`, `lib/`, `scripts/`, and `prisma/`; report and fix feature-caused failures.
- [X] T027 Execute the cross-story scenarios in `specs/002-property-auction-dashboard/quickstart.md`, including update additions, changes, removals, lease expiry, stable pagination, keyboard access, and 320/1440-pixel layouts; measure the usability and response-time targets where feasible.
- [X] T028 Record the limits of page-count checks and the evidence available for FR-001 and SC-001 in `README.md`; do not assert complete upstream coverage without a known complete reference collection.

## Dependencies and Execution Order

### Phase Dependencies

* Setup requires no work.
* Foundational tasks T001-T006 precede all stories. T001-T003 edit the same
  schema and are sequential; T004 requires their completed schema.
* US1 requires the foundation. T007-T009 can run in parallel; T010 follows T009;
  T011 follows T005-T006 and T010; T012 follows T011; T014 follows T007 and
  T013; T015-T016 follow the relevant implementation tasks.
* US2 requires the US1 dashboard and queries. T017 can run in parallel with
  T018; T019 follows both, and T020 follows T019.
* US3 requires the US1 dashboard and source mapping. T021 and T022 touch
  different files and can run in parallel after US1, but T022 must not overlap
  with T019 because both edit `app/aste/page.tsx`. T023 follows T021-T022.
* Polish follows relevant story work. T024 may run alongside independent
  verification after the implementation stabilizes; T025 and T028 both edit
  `README.md` and must not overlap with T024 or each other.
* Production daily refresh remains blocked until hosting and a scheduler are
  selected. This does not prevent local development.

### User Story Completion Order

US1 provides the shared browsing increment. US2 and US3 both depend on US1;
their independent file changes can be parallelized with the shared-page
exception above.

## Parallel Examples

### User Story 1

```text
T007: Build components/auction-card.tsx
T008: Add navigation in components/header.tsx
T009: Build lib/pvp-auction-client.ts
```

### User Story 2

```text
T017: Build components/auction-filters-form.tsx
T018: Add filters to lib/auction-queries.ts
```

### User Story 3

```text
T021: Add source links to components/auction-card.tsx
T022: Add the source notice to app/aste/page.tsx
```

## Implementation Strategy

1. Complete the snapshot foundation and US1 as the MVP.
2. Verify US1 with controlled data, including refresh failures and stale states.
3. Add US2 filtering and US3 source links in independent increments.
4. Configure daily scheduling once hosting is selected, then run all quality
   gates and document any unverified completeness limitations.
