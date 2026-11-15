# UI Contract: Contact Page

## Route

- **Path**: `/contatti`
- **Access**: Public, no sign-in required
- **Navigation**: A visible, keyboard-operable “Contatti” link in the shared footer on all site pages.

## Contact Information

### Configured state

- Display the configured `CONTACT_EMAIL` as readable, selectable text.
- Make the address a standard `mailto:` link whose recipient matches the displayed address.
- Do not claim that a message has been sent or promise a response time.

### Unavailable state

- If the setting is empty, absent, or invalid, display a concise message that the contact address is temporarily unavailable.
- Do not show a placeholder address or render an empty/invalid email link.

## Accessibility and Responsive Behavior

- Footer navigation and email link use native links and support keyboard activation.
- Keep page content readable and usable on narrow screens.
- Preserve visible focus indication using existing site styling conventions.

## Exclusions

- No contact form, API endpoint, server-side email delivery, database storage, or additional contact channels.
