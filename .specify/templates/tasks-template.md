---

description: "Task list template for ProgettoCasa feature implementation"

---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: `plan.md` and `spec.md`; include `research.md`, `data-model.md`, and `contracts/` only when produced and relevant.

**Testing**: No test framework or test script is currently configured. Add test tasks only when a test runner is already available or its setup is explicitly in scope. Always include applicable lint/build verification.

**Organization**: Group implementation tasks by user story so each story can be delivered independently where dependencies permit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the phase without file or dependency conflicts.
- **[Story]**: User-story identifier such as `US1` or `US2`; omit for shared setup and polish tasks.
- Include concrete paths within `app/`, `components/`, `lib/`, or `prisma/` where applicable.

<!--
  The /speckit-tasks command MUST replace the sample tasks below with tasks
  derived from this feature's specification and plan. Keep tasks grouped by
  user story and use only paths and verification commands relevant to the feature.
-->

## Phase 1: Setup

**Purpose**: Required project or feature setup only. Do not duplicate existing repository configuration.

- [ ] T001 [P] [US1] [Feature-specific setup task with exact path, if needed]

---

## Phase 2: Foundational

**Purpose**: Shared work that must be completed before dependent user stories. Omit this phase if there are no shared prerequisites.

- [ ] T002 [P] [Update `prisma/schema.prisma` and create a migration under `prisma/migrations/` if the feature changes persisted data]
- [ ] T003 [P] [Configure only required environment or integration changes; never include secret values]

When a schema migration is required, specify the appropriate command: `npm run prisma:migrate -- --name <migration>` for local development or `npx prisma migrate deploy` for deployment. Include `npm run prisma:generate` if the generated client must be refreshed.

**Checkpoint**: Complete only the prerequisites that block the planned user stories.

---

## Phase 3: User Story 1 - [Title] (Priority: P1)

**Goal**: [Brief user outcome]

**Independent Test**: [Observable way to verify this story; use an automated test only if test infrastructure is available or in scope]

### Implementation

- [ ] T004 [P] [US1] [Add or update the relevant page or Route Handler under `app/`]
- [ ] T005 [P] [US1] [Add or update reusable UI under `components/`, if needed]
- [ ] T006 [US1] [Add or update shared application behavior under `lib/`, if needed]
- [ ] T007 [US1] [Connect UI, service, and persistence behavior; reference exact files]

**Checkpoint**: Verify the user outcome before proceeding to dependent stories.

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief user outcome]

**Independent Test**: [Observable way to verify this story]

### Implementation

- [ ] T008 [P] [US2] [Add or update the relevant file under `app/`, `components/`, `lib/`, or `prisma/`]
- [ ] T009 [US2] [Integrate with shared behavior only where required by the plan]

**Checkpoint**: Verify this story and ensure previously completed stories still work.

---

[Add or remove user-story phases to match the specification's priorities and dependencies.]

## Final Phase: Polish and Verification

**Purpose**: Cross-story work required to complete the feature.

- [ ] TXXX [P] Update `README.md` if user-facing setup or configuration instructions change
- [ ] TXXX Run `npm run lint`
- [ ] TXXX Run `npm run build`
- [ ] TXXX [Run feature tests only if a test runner exists or its setup is in scope]

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup**: No prerequisites unless specified by the plan.
- **Foundational**: Complete only before stories that depend on the shared work.
- **User stories**: Follow actual dependencies identified in the plan; do not assume all stories can run in parallel.
- **Polish and verification**: Run after implementation tasks are complete.

### Within Each User Story

- Respect data and service dependencies in `plan.md`.
- Implement and verify the user-visible outcome before marking the story complete.
- Keep independent tasks parallel only when they do not conflict on files or depend on one another.

## Parallel Example

```text
Task: Update an independent page under app/
Task: Update an independent reusable component under components/
```

Only parallelize tasks when the plan confirms there are no shared-file edits or ordering dependencies.

## Implementation Strategy

### Incremental Delivery

1. Complete required setup and shared prerequisites.
2. Implement the highest-priority independently deliverable user story.
3. Verify that story, then proceed according to the documented dependencies.
4. Run `npm run lint` and `npm run build` after implementation.
5. Run feature tests only when test infrastructure is available or included in scope.
