// Contact form delivery through FormSubmit (https://formsubmit.co).
// Works from the browser on any host (Lovable, Cloudflare, etc.) with no secret keys.
// The first submission sends an activation email to the inbox; after it is confirmed,
// every enquiry is forwarded there.
export const CONTACT_INBOX = "info@cyberjustice.uk";
export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_INBOX}`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFields = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string; // hidden honeypot
};

export function readContactFields(form: FormData): ContactFields {
  const get = (key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
  return {
    name: get("name", 120),
    email: get("email", 254),
    phone: get("phone", 80),
    subject: get("subject", 160),
    message: get("message", 6000),
    website: get("website", 200),
  };
}

export function isSpam(fields: ContactFields) {
  return fields.website.length > 0;
}

export function validateContact(fields: ContactFields): string | null {
  if (!fields.name || !fields.message || !EMAIL_RE.test(fields.email)) {
    return "Please provide your name, a valid email address and a message.";
  }
  return null;
}

export function buildFormSubmitPayload(fields: ContactFields) {
  const subject = fields.subject || "Confidential consultation";
  return {
    name: fields.name,
    email: fields.email,
    phone: fields.phone || "Not provided",
    "case subject": subject,
    message: fields.message,
    _subject: `Website enquiry: ${subject}`,
    _replyto: fields.email,
    _template: "table",
    _captcha: "false",
  };
}

export async function sendContactEnquiry(fields: ContactFields): Promise<void> {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(buildFormSubmitPayload(fields)),
  });
  const result = (await response.json().catch(() => ({}))) as { success?: unknown };
  if (!response.ok || String(result.success) !== "true") {
    throw new Error("Submission failed");
  }
}
