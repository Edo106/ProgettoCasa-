# Research: Sezione Contatti

**Status**: Complete

## Context

The approved feature is a public page reachable from the shared footer. It displays only an email address, configurable outside source code. It does not collect messages, send email, or persist contact data.

## Decisions

### Decision: Use a server-only `CONTACT_EMAIL` setting

- **Decision**: Provide the optional public address through `CONTACT_EMAIL`, read by the server-rendered contact page. Document it in `.env.example` and the setup guidance without supplying a real address.
- **Rationale**: The repository already uses environment variables for deployment-specific configuration. The contact value must be configurable without editing page content, and it should not be included in client configuration.
- **Alternatives considered**:
  - Hard-code the email in the page: rejected because changing contact details would require a source edit and could publish a placeholder.
  - Add the address to the database: rejected because there is no need for user-managed contact settings or persistence.
  - Use `NEXT_PUBLIC_CONTACT_EMAIL`: rejected because the address is only needed to render the public server response and does not need to be bundled into browser code.

### Decision: Render the route dynamically and degrade safely

- **Decision**: Read the setting at request/runtime, trim it, and treat missing or malformed values as unavailable. In that state, show informative text and no `mailto:` link.
- **Rationale**: The public address can change independently of the page source. Runtime rendering avoids relying on a build-time snapshot; safe fallback avoids broken or misleading links.
- **Alternatives considered**:
  - Static generation with a build-time value: rejected because address updates could remain stale until a new build.
  - Display an example or silently omit the contact section: rejected because examples risk accidental publication and omission hides the configuration problem from visitors.

### Decision: Keep contact initiation in the visitor's email application

- **Decision**: Use a readable email address and a `mailto:` link; do not add a message form or server-side mail sending.
- **Rationale**: This matches the explicitly selected scope, minimizes collection of personal information, and avoids adding an email-delivery dependency.
- **Alternatives considered**:
  - Contact form with server-side delivery: rejected as out of scope and would require data handling, delivery configuration, abuse controls, and privacy decisions.
  - Display-only email without a link: rejected because the user requested a clickable contact channel.

## Repository Evidence

- `components/footer.tsx` is the shared site footer used by `app/layout.tsx`.
- `.env.example` and `README.md` already document environment-specific setup.
- `.gitignore` ignores `.env*` while explicitly allowing `.env.example`.
- No existing contact route or public contact address was found.
- `package.json` provides `npm run lint` and `npm run build`; no automated test command is configured.

## Unresolved Questions

None. The administrator must supply the actual public email address through deployment configuration before it can be displayed.
