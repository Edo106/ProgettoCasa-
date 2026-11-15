# Data Model: Sezione Contatti

## Persistence

This feature introduces no persisted entities and does not change the Prisma schema.

## Runtime Configuration

| Name | Type | Required | Purpose |
|---|---|---:|---|
| `CONTACT_EMAIL` | Single email address string | No | Public email displayed on the contact page and used as the `mailto:` recipient. |

### Validation and Display Rules

- Trim surrounding whitespace.
- Accept only a single syntactically valid email address.
- Treat an unset, empty, or invalid value as unavailable.
- Never display a placeholder address.
- When valid, show the configured address as readable text and as the recipient in the link.
- When unavailable, show an explanatory message and do not render an email link.
- Keep the setting server-side; do not expose it using a `NEXT_PUBLIC_` name.
- Do not log the configured value.

## Relationships and State Transitions

There are no relationships, persisted state transitions, or data migrations.
