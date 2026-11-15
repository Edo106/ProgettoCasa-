# ProgettoCasa Constitution

## Project Identity

ProgettoCasa is a mobile-first real-estate listing aggregator implemented as a
single Next.js App Router application. TypeScript is the primary language;
PostgreSQL data access uses Prisma.

## Core Principles

### I. Follow the Application Boundaries

- Route handlers, layouts, and pages belong in `app/`.
- Reusable UI belongs in `components/`; shared application services belong in
  `lib/`.
- Database schema, migrations, and seed data belong in `prisma/`.
- Keep changes within these existing boundaries unless the feature needs a
  different structure and its plan explains why.

### II. Keep Persistence Aligned

- Use the existing Prisma client in `lib/prisma.ts` for database access.
- When changing persisted data, update `prisma/schema.prisma` and provide the
  corresponding Prisma migration. Keep seed data in `prisma/seed.ts`.
- Do not add a separate persistence layer or database without a documented
  feature need.

### III. Use Existing Project Conventions

- Use TypeScript and preserve the strict compiler settings in `tsconfig.json`.
- Follow the existing kebab-case file naming in `components/` and `lib/`.
- Use the configured `@/*` import alias for repository-root imports where
  appropriate.
- No mandatory branch naming or variable naming convention was detected;
  feature work must not present one as an existing project rule.

### IV. Verify Changes with Available Quality Gates

- Run `npm run lint` and `npm run build` for implementation changes.
- No test framework or test script is currently configured. Do not assume a
  test command exists; specify suitable verification in the feature plan and
  introduce testing infrastructure only when it is part of approved scope.
- No CI workflow or formatter configuration was detected.

## Feature Design

- Specs describe independently understandable user outcomes and measurable
  acceptance criteria.
- Plans identify affected paths in `app/`, `components/`, `lib/`, and/or
  `prisma/`, as applicable, and describe data and migration impacts.
- Tasks reference real repository paths and runnable project scripts. Do not
  add setup tasks for tooling the project does not use.

## Governance

This constitution records conventions detected in the existing repository. It
does not establish an unobserved branch policy, test framework, deployment
platform, or formatting standard. Amend it only when project practice changes
or maintainers approve a new standard.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15
