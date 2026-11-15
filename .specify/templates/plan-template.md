# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict mode, TypeScript 5)

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4, Prisma 6

**Storage**: PostgreSQL via Prisma; N/A if the feature does not use persistence

**Testing**: No test framework or test script is currently configured. Describe feature-specific verification; do not assume `npm test` exists.

**Target Platform**: Next.js application runtime; deployment target is feature-dependent

**Project Type**: Single web application with server-rendered pages and API Route Handlers

**Performance Goals**: [User-visible measurable goals from the feature specification, or none specified]

**Constraints**: Preserve the existing App Router, Prisma/PostgreSQL integration, and project quality gates

**Scale/Scope**: [Feature-specific scope from the specification]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/                    # App Router pages, layouts, and API Route Handlers
components/             # Reusable UI
lib/                    # Shared application services and clients
prisma/
├── schema.prisma       # PostgreSQL data model
├── migrations/         # Database migrations
└── seed.ts             # Seed data
```

**Structure Decision**: This repository is a single Next.js application, not a
separate frontend/backend or monorepo. List only the existing paths affected by
the feature. For persisted-data changes, include `prisma/schema.prisma` and a
Prisma migration; include `prisma/seed.ts` only when seed data must change.

## Data and Migration Impact

- **Schema changes**: [Prisma models/fields affected, or none]
- **Migration**: [Required migration and compatibility considerations, or none; for local development use `npm run prisma:migrate -- --name <migration>`, and for deployment use `npx prisma migrate deploy`]
- **External configuration**: [Environment variables or integrations affected; never include secret values]

## Verification

- Run `npm run lint` and `npm run build`.
- For schema changes, document and run the applicable Prisma migration command; run `npm run prisma:generate` when the generated client must be refreshed.
- No test runner is configured by default. If tests are added or already available for the feature, document their exact command and scope; do not invent a test command.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
