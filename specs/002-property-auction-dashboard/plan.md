---
description: Implementation plan for the property auction dashboard
---

# Implementation Plan: Property Auction Dashboard

**Branch**: `feat/Aste` | **Date**: 2026-11-23 |
**Spec**: [Property auction dashboard](./spec.md)

**Status**: Design complete. The user selected the supplied PVP search endpoint
and requested no further source verification during planning. Coverage,
snapshot consistency, reuse conditions, and production scheduling remain
unverified risks, not established guarantees.

## Summary

Add a public dashboard at `/aste` using the supplied PVP search endpoint.
A scheduled server-side job collects results into a new snapshot, normalizes
property announcements, and publishes the snapshot atomically after all pages
pass consistency checks. The page reads the last published snapshot, supports
filters and pagination, shows freshness or failure status, and links to the
original notice.

The endpoint exposes offset pagination, not a verified stable snapshot. Page
checks can detect some inconsistencies but cannot prove national completeness.
Do not claim FR-001 or SC-001 has been met without evidence of complete coverage
and consistent enumeration.

## Technical Context

**Language/Version**: TypeScript 5 in strict mode

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4,
Prisma 6, and the existing `tsx` development dependency

**Storage**: PostgreSQL through the existing Prisma client

**Testing**: No test framework or test script is configured. Use focused
automated checks within the project's existing tools where practical, plus the
scenarios in [quickstart](./quickstart.md). Do not assume `npm test` exists.

**Target Platform**: Existing Next.js application and an external scheduler
capable of running the sync command daily. Production hosting is undecided.

**Project Type**: Single web application with server-rendered pages

**Performance Goals**: Meet the specification's three-second 95th-percentile
view and filter target, two-minute user task target, and 24-hour refresh attempt
interval.

**Constraints**: Preserve application boundaries, strict TypeScript, and Prisma.
Respect source access restrictions and handle rate limiting without bypassing
access controls.

**Scale/Scope**: Property auction notices across Italy currently available from
the selected endpoint. The observed unfiltered response reported hundreds of
thousands of records; page counts and source coverage can change.

## Constitution Check

* Application boundaries: Pass. Add the page in `app/`, shared UI in
  `components/`, collection and query services in `lib/`, and models and
  migrations in `prisma/`. The command entry point belongs in `scripts/`, not a
  separate application.
* Persistence alignment: Pass. Use the existing Prisma client and PostgreSQL;
  include a migration for the new snapshot and update models.
* Project conventions: Pass. Use strict TypeScript, existing aliases, and
  kebab-case component and service names.
* Quality gates: Pass. Run `npm run lint`, `npm run build`, and the applicable
  Prisma generation and migration commands during implementation.
* Post-design check: Pass. No second database or separate service is proposed.
  The external scheduler is an operational trigger for the existing application.

## Project Structure

### Documentation

* [Specification](./spec.md)
* [Research and decisions](./research.md)
* [Data model](./data-model.md)
* [Dashboard and synchronization contracts](./contracts/dashboard.md)
* [Quickstart and validation](./quickstart.md)
* Tasks: Created separately by `/speckit-tasks`

### Source Code

* `app/aste/page.tsx`: Server-rendered auction dashboard and query parameters
* `components/header.tsx`: Navigation link for desktop and mobile
* `components/`: Auction-specific filters and cards, reusing existing patterns
  where their data contracts match
* `lib/`: Source client, synchronization service, and dashboard queries
* `scripts/`: Scheduled synchronization command entry point
* `prisma/schema.prisma` and `prisma/migrations/`: Snapshot, announcement, and
  synchronization state with indexes and migration

**Structure Decision**: Retain the existing single-application structure and
leave ordinary property listings unchanged.

## Data and Migration Impact

* Schema changes: Add announcement snapshots, source-identified snapshot rows,
  synchronization runs, and a single published-snapshot pointer. Existing
  `Listing` requires fields that may be absent from auction notices, so keep
  these records separate.
* Migration: Add the corresponding Prisma migration. For development, run
  `npm run prisma:migrate -- --name add_auction_dashboard`; for deployment,
  run `npx prisma migrate deploy` and generate the client as needed.
* External configuration: `DATABASE_URL` remains required. Deployment must
  configure a scheduler to invoke the sync command at least daily. No new
  authentication credential has been established for the selected endpoint.

## Design and Delivery Sequence

1. Implement the snapshot schema and publication rules in
   [data-model.md](./data-model.md).
2. Implement the source adapter and command in
   [dashboard.md](./contracts/dashboard.md), preserving null fields and
   rejecting malformed pages or unknown property classification instead of
   inventing values.
3. Implement dashboard queries, filters, stable snapshot pagination, source
   links, and Italian-language states without changing the existing listings.
4. Configure a daily external scheduler for the chosen deployment. A local
   command alone does not satisfy the operational refresh requirement.
5. Run the quality gates and validation scenarios in
   [quickstart.md](./quickstart.md). Record the remaining upstream limitations
   rather than presenting unchecked source coverage as verified.

## Verification

* Run `npm run prisma:generate`, the relevant migration command, `npm run lint`,
  and `npm run build` during implementation.
* Exercise page, filter, pagination, missing-data, refresh-failure, stale-data,
  concurrency, and responsive states using controlled data.
* Measure SC-002 and SC-003 against the implemented UI. SC-001 cannot be
  certified from one unfiltered page or offset-page counts alone.
* Confirm that scheduled production runs occur at least daily once deployment
  and scheduling have been chosen.

## Complexity Tracking

No constitution violations are proposed.
