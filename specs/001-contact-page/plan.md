# Implementation Plan: Sezione Contatti

**Branch**: `001-contact-page` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: [Feature specification](./spec.md)

## Summary

Add a public contact page at `/contatti`, linked from the site-wide footer, that displays one configurable public email address. Render the address as readable text and a `mailto:` link when valid configuration is available; otherwise show a clear unavailable message. Keep the address server-side and do not add a contact form, message delivery, external email integration, or persisted data.

## Technical Context

**Language/Version**: TypeScript 5, strict mode

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4

**Storage**: None; no database or Prisma changes

**Testing**: No test framework or test script is configured. Validate the configured and unconfigured contact states manually and run the existing lint and build commands.

**Target Platform**: Existing Next.js web application

**Project Type**: Single web application with server-rendered pages

**Performance Goals**: No feature-specific performance target; contact details should be immediately available when the page loads.

**Constraints**: Preserve existing App Router and shared footer patterns. Do not expose the email through a `NEXT_PUBLIC_` variable. No contact form, server-side email sending, or database model is in scope.

**Scale/Scope**: One new page, one shared footer link, one server-side configuration value, and documentation of that configuration.

## Constitution Check

| Principle | Result | Evidence |
|---|---|---|
| Follow application boundaries | PASS | New route belongs in `app/`; site-wide navigation belongs in existing `components/footer.tsx`. |
| Keep persistence aligned | PASS | The feature stores no contact messages or contact records and requires no Prisma schema or migration change. |
| Use existing conventions | PASS | Use TypeScript, kebab-case component/service names if any are added, and the existing `@/*` alias where appropriate. |
| Verify with available quality gates | PASS | Run `npm run lint` and `npm run build`; no test command is configured. |
| Avoid unobserved standards | PASS | No branch, formatter, test-framework, or CI policy is introduced. |

**Gate result**: PASS. No constitution violations or exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-contact-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── contact-page.md
```

### Source Code (repository root)

```text
app/
└── contatti/
    └── page.tsx             # Public contact details page
components/
└── footer.tsx               # Site-wide link to /contatti
.env.example                 # Document CONTACT_EMAIL without a real value
README.md                    # Document configuration and local verification
```

**Structure Decision**: Keep the route in the existing Next.js App Router and add the navigation link to the current shared footer. Read `CONTACT_EMAIL` in the server-rendered route. No additional application service is necessary unless the implementation can demonstrate a need for reuse.

## Data and Configuration Impact

- **Persisted data**: None. No Prisma entities, migrations, or seed changes.
- **Configuration**: Add optional `CONTACT_EMAIL` to `.env.example` with an empty value and describe setting it in local and deployment environments.
- **Privacy**: Do not prefix the setting with `NEXT_PUBLIC_`; do not render its value into client-side code or use it for server-side message transmission.
- **Validation**: Trim the configured value and accept it only if it represents a single valid email address suitable for display and a `mailto:` destination. Treat absent or invalid configuration as unavailable and omit the email link. Do not log the value.
- **Deployment behavior**: Ensure the server-rendered contact route reads the setting at request/runtime rather than freezing it into a statically generated page. Updating the address should require configuration update and application restart/redeployment as applicable to the host.

## Phase 0: Research

See [research.md](./research.md). The repository already uses server-side environment configuration for external services, and the contact feature needs no new provider or unknown technology. The principal design choice is keeping this public address on the server while serving the contact route dynamically.

## Phase 1: Design

- [Data model](./data-model.md): no persisted entity; records the single optional deployment configuration value and its validation behavior.
- [UI contract](./contracts/contact-page.md): specifies the public route, footer navigation, display states, and mailto behavior.
- [Quickstart](./quickstart.md): describes manual configured/unconfigured checks and the repository quality gates.
- No OpenAPI or API contract is needed because the feature exposes no programmatic endpoint.

## Verification

- Run `npm run lint`.
- Run `npm run build`.
- Follow [quickstart.md](./quickstart.md) for configured and unconfigured contact behavior.
- Confirm generated HTML does not reveal the address in a client-side JavaScript bundle beyond the intentionally public rendered page; do not expose it through client configuration.

## Complexity Tracking

No constitution exceptions or additional architectural complexity are proposed.
