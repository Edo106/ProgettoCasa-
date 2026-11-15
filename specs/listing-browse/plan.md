# Implementation Plan: Real-Estate Listing Browse, Filter, and Detail

**Branch**: `feature/login` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Status**: migrated

**Input**: Reverse-engineered from the existing listing pages, components, and Prisma listing model.

## Summary

The existing application provides a public property catalog at `/`, filters results using URL query parameters and Prisma, renders reusable listing cards, and presents full listing details at `/annunci/[id]`. Listing data is stored in PostgreSQL through Prisma and sample records are defined in the seed script.

## Technical Context

**Language/Version**: TypeScript 5, strict mode

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4, Prisma 6

**Storage**: PostgreSQL via Prisma

**Testing**: No test framework or test script is configured; no automated tests were found for this feature.

**Target Platform**: Next.js application runtime

**Project Type**: Single web application with server-rendered listing pages

**Performance Goals**: No feature-specific performance targets detected.

**Constraints**: Preserve public access, the existing App Router paths, Prisma persistence, and configured lint/build checks.

**Scale/Scope**: 3 user-facing journeys; 9 code/data files (676 lines) plus 1 placeholder image asset in the detected feature scope.

## Existing Implementation

- `app/page.tsx` reads URL search parameters, parses non-negative numeric filters with `Number.parseInt` (so parseable integer prefixes are accepted), constructs a Prisma `ListingWhereInput`, queries in descending creation order, and renders error, empty, or result states.
- `components/filters-form.tsx` submits city, price, area, and room filters using a GET request and provides a reset link.
- `components/listing-card.tsx` formats the price and links to the detail route; it uses the local placeholder when the image URL is absent.
- `app/annunci/[id]/page.tsx` loads a listing by ID and renders its full details and external source link. Invalid/missing IDs and database errors resolve to not-found behavior; database errors are logged.
- `lib/prisma.ts` supplies the shared Prisma client.
- `prisma/schema.prisma`, `prisma/migrations/20260821164242_init/migration.sql`, and `prisma/seed.ts` define and populate listing data.
- `next.config.ts` permits listing images from `images.unsplash.com`; `public/placeholder-house.png` supplies the fallback image.

## Project Structure

```text
app/
├── page.tsx                 # Public listing catalog and filtering
└── annunci/[id]/page.tsx    # Listing detail
components/
├── filters-form.tsx         # Query-parameter filter form
└── listing-card.tsx         # Catalog result card
lib/
└── prisma.ts                # Shared Prisma client
prisma/
├── schema.prisma            # Listing data model
├── migrations/
│   └── 20260821164242_init/migration.sql
└── seed.ts                  # Sample listing records
next.config.ts               # Remote listing-image host
public/
└── placeholder-house.png    # Listing image fallback
```

## Data and Migration Impact

- **Schema changes**: None are required for the currently implemented listing browse/filter/detail behavior.
- **Existing schema**: The `Listing` model contains property fields, source information, optional address/image/bathroom values, and timestamps.
- **Existing migration**: The initial migration creates the `Listing` table.
- **Seed data**: `prisma/seed.ts` defines representative listing records.
- **External configuration**: PostgreSQL `DATABASE_URL` is needed for listing queries; remote image rendering is configured for Unsplash.

## Verification

- `npm run lint` passed during the repository validation performed on 2026-11-15.
- `npm run build` is configured but was not run during migration.
- No automated feature tests exist; verify the user journeys against a populated PostgreSQL database.
- No listing-specific performance or accessibility test result was found.

## Complexity Assessment

The feature spans a server-rendered catalog, query-driven filtering, a detail route, shared UI components, a data model, seed data, and image configuration. The scope is contained within one Next.js application and a single Prisma entity; the main cross-cutting dependency is the PostgreSQL-backed Prisma client.
