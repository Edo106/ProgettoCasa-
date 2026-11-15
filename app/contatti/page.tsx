import { connection } from "next/server";

const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

function isValidEmail(email: string): boolean {
  const separator = email.indexOf("@");
  if (separator <= 0 || separator !== email.lastIndexOf("@")) {
    return false;
  }

  const localPart = email.slice(0, separator);
  const domain = email.slice(separator + 1);

  return (
    email.length <= 254 &&
    localPart.length <= 64 &&
    domain.length <= 253 &&
    EMAIL_PATTERN.test(email)
  );
}

export default async function ContactPage() {
  await connection();

  const configuredEmail = process.env.CONTACT_EMAIL?.trim();
  const contactEmail =
    configuredEmail && isValidEmail(configuredEmail) ? configuredEmail : null;

  const mailtoAddress = contactEmail
    ? `mailto:${encodeURIComponent(contactEmail.slice(0, contactEmail.lastIndexOf("@")))}@${contactEmail.slice(contactEmail.lastIndexOf("@") + 1)}`
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">Contatti</h1>
        {contactEmail && mailtoAddress ? (
          <p className="text-zinc-700">
            Per contattare il gestore del sito, scrivi a{" "}
            <a
              href={mailtoAddress}
              className="rounded-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {contactEmail}
            </a>
            .
          </p>
        ) : (
          <p className="text-zinc-700">
            L&apos;indirizzo email di contatto non è al momento disponibile.
          </p>
        )}
      </section>
    </div>
  );
}
