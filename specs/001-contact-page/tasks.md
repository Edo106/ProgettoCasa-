---

description: "Task list for the ProgettoCasa contact page"

---

# Tasks: Sezione Contatti

**Input**: Design documents from `specs/001-contact-page/`

**Prerequisites**: `plan.md` and `spec.md`; also see `research.md`, `data-model.md`, `contracts/contact-page.md`, and `quickstart.md`.

**Testing**: No automated test framework or test script is configured. Use the manual scenarios in `specs/001-contact-page/quickstart.md` and run the existing lint/build commands.

**Organization**: Tasks are grouped by user story and priority. The two stories are dependent: the email composition flow requires the contact page and configured contact address from US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with another task only when they use different files and do not depend on unfinished work.
- **[Story]**: User-story identifier from `specs/001-contact-page/spec.md`.
- Every task includes the concrete file path to create, update, or use for verification.

## Phase 1: Setup

**Purpose**: No project initialization is needed; the application and configuration files already exist.

No setup tasks.

---

## Phase 2: Foundational

**Purpose**: No shared blocking infrastructure, persistence, API, or email-delivery service is needed.

No foundational tasks.

---

## Phase 3: User Story 1 - Trovare i recapiti del sito (Priority: P1) 🎯 MVP

**Goal**: A visitor can reach a dedicated contact page from the footer and read the public email address, or a clear unavailable message when no valid address is configured.

**Independent Test**: Follow “Validate With an Email Address” and “Validate Without a Contact Address” in `specs/001-contact-page/quickstart.md`; verify footer navigation, readable address, unavailable state, keyboard access, and narrow-screen usability.

### Implementation

- [X] T001 [P] [US1] Create the public server-rendered contact page in `app/contatti/page.tsx`; read `CONTACT_EMAIL`, trim and validate a single email address, display it readably as a `mailto:` link when valid, and show an unavailable message with no email link when absent or invalid.
- [X] T002 [P] [US1] Add a native, keyboard-operable “Contatti” link to `/contatti` in the shared footer at `components/footer.tsx`.
- [X] T003 [P] [US1] Document the optional `CONTACT_EMAIL` setting with an empty value and no example address in `.env.example`.
- [X] T004 [P] [US1] Document how to configure `CONTACT_EMAIL` locally and in deployment, without publishing an address, in `README.md`.
- [X] T005 [US1] Run the configured and unconfigured contact-page checks in `specs/001-contact-page/quickstart.md` and confirm the footer link, accessible reading/copying, and responsive layout.

**Checkpoint**: A visitor can find the page from the footer and read the configured address or a safe unavailable state without requiring an email application.

---

## Phase 4: User Story 2 - Contattare il gestore via email (Priority: P2)

**Goal**: A visitor can select the displayed email address to start composing a message to exactly that address.

**Independent Test**: With US1 complete and a valid `CONTACT_EMAIL` configured, activate the email link and verify the email application addresses the draft to the displayed value. Confirm the address remains readable and copyable when no email application is registered.

### Implementation and Verification

- [X] T006 [US2] Verify and, if needed, correct the email-link behavior in `app/contatti/page.tsx` so activating the native `mailto:` link addresses a draft to the same value shown as text, without claiming that a message was sent.
- [X] T007 [US2] Run the configured, missing, and invalid address scenarios in `specs/001-contact-page/quickstart.md`; verify the `mailto:` recipient matches the displayed address and no malformed or placeholder link appears.

**Checkpoint**: Email activation opens the visitor's message composer for the configured recipient; the site does not collect or send the message.

---

## Final Phase: Polish and Cross-Cutting Verification

**Purpose**: Verify the completed contact experience against repository quality gates and configuration guidance.

- [X] T008 [P] Confirm the `CONTACT_EMAIL` setup instructions in `README.md` match the empty optional setting in `.env.example`.
- [X] T009 Run `npm run lint` using the lint script in `package.json`.
- [X] T010 Run `npm run build` using the build script in `package.json`.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks; no project initialization is needed.
- **Foundational (Phase 2)**: No tasks; there is no shared blocking infrastructure.
- **US1 (Phase 3)**: Can start immediately. T001–T004 touch separate files and can be parallelized; T005 follows those changes.
- **US2 (Phase 4)**: Depends on US1's contact route and configured/unconfigured states. T006 updates the page created by T001; T007 follows T006.
- **Polish**: Run after both user stories; T008–T010 can run independently after implementation.

### User Story Dependencies

- **US1 (P1)**: Independent MVP; provides the contact page, footer navigation, and address configuration.
- **US2 (P2)**: Depends on US1's route and configured address; adds and verifies email-composer activation.

### Parallel Opportunities

- **US1**: T001 (`app/contatti/page.tsx`), T002 (`components/footer.tsx`), T003 (`.env.example`), and T004 (`README.md`) can be done in parallel because each targets a distinct file.
- **US2**: T006 and T007 are sequential because verification depends on the `mailto:` behavior.
- **Final phase**: T008, T009, and T010 can run independently after implementation.

## Parallel Example: User Story 1

```text
Task: Implement the server-rendered contact page in app/contatti/page.tsx
Task: Add the footer link in components/footer.tsx
Task: Document CONTACT_EMAIL in .env.example
Task: Document local and deployment configuration in README.md
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T004 to provide the page, navigation, and configuration documentation.
2. Complete T005 to verify the configured and unavailable states and responsive/keyboard access.
3. This delivers the MVP: visitors can find and read the public contact address.

### Incremental Delivery

1. Complete US1 and verify the address display and missing/invalid configuration state.
2. Complete US2 and verify the `mailto:` recipient matches the displayed address.
3. Run `npm run lint` and `npm run build`.

Automated test tasks are omitted because no test framework is configured and the feature specification did not request adding one.

## Phase 5: Convergence

- [ ] T011 Remove the populated contact address from `.env.example`, keep `CONTACT_EMAIL` empty, and verify a fresh local setup shows the unavailable state per FR-005 and the plan's configuration decision (contradicts, CRITICAL).
