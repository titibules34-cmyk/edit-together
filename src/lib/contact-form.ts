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

async function postToFormSubmit(payload: Record<string, string>): Promise<void> {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({}))) as { success?: unknown };
  if (!response.ok || String(result.success) !== "true") {
    throw new Error("Submission failed");
  }
}

export async function sendContactEnquiry(fields: ContactFields): Promise<void> {
  await postToFormSubmit(buildFormSubmitPayload(fields));
}

// Enquiries collected by the CJ Bot chat assistant.
export type ChatLead = {
  service: string;
  issue: string;
  platform: string;
  amount: string;
  timeframe: string;
  evidence: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
};

export function validateChatLead(lead: ChatLead): string | null {
  if (!lead.name.trim() || !lead.summary.trim() || !EMAIL_RE.test(lead.email.trim())) {
    return "Please provide your name, a valid email address and a short summary.";
  }
  return null;
}

export function buildChatPayload(lead: ChatLead) {
  const clip = (value: string, max: number, fallback: string) => value.trim().slice(0, max) || fallback;
  const service = clip(lead.service, 160, "General enquiry");
  const email = lead.email.trim().slice(0, 254);
  return {
    name: clip(lead.name, 120, ""),
    email,
    phone: clip(lead.phone, 80, "Not provided"),
    service,
    situation: clip(lead.issue, 200, "Not specified"),
    "platform / organisation": clip(lead.platform, 200, "Not specified"),
    "approximate value": clip(lead.amount, 80, "Not specified"),
    timeframe: clip(lead.timeframe, 80, "Not specified"),
    "supporting records": clip(lead.evidence, 120, "Not specified"),
    message: clip(lead.summary, 6000, ""),
    source: "CJ Bot website assistant",
    _subject: `CJ Bot enquiry: ${service}`,
    _replyto: email,
    _template: "table",
    _captcha: "false",
  };
}

export async function sendChatEnquiry(lead: ChatLead): Promise<void> {
  await postToFormSubmit(buildChatPayload(lead));
}
