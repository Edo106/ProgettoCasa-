# Quickstart: Sezione Contatti

This guide describes manual validation scenarios for implementation. No automated test runner is currently configured.

## Prerequisites

- Node.js and npm installed; project dependencies restored.
- Local environment configured as described in [README.md](../../README.md).
- No database setup is required specifically for this feature.

## Validate With an Email Address

1. Add a real public address to the local, git-ignored `.env` file:

   ```dotenv
   CONTACT_EMAIL=contatti@example.test
   ```

   Replace the example with the approved real address for meaningful testing; do not commit it.
2. Start the development server:

   ```powershell
   npm.cmd run dev
   ```
3. Open `http://localhost:3000/contatti`.
4. Confirm the configured address is readable and selectable.
5. Confirm activating it starts an email addressed to exactly the displayed value.
6. Confirm the footer contains a keyboard-accessible “Contatti” link that reaches the page.
7. Check the layout at a narrow viewport and verify keyboard focus remains visible.

## Validate Without a Contact Address

1. Remove or clear `CONTACT_EMAIL` in the local environment and restart the server.
2. Open `/contatti`.
3. Confirm an unavailable-contact message is shown and no `mailto:` link or example address appears.

## Validate Invalid Configuration

1. Set `CONTACT_EMAIL` to an invalid value and restart the server.
2. Confirm the page uses the same unavailable state and does not create a malformed link.

## Quality Gates

Run from the repository root:

```powershell
npm.cmd run lint
npm.cmd run build
```

Both commands must complete successfully. The repository has no configured automated test command.
