import { describe, expect, it } from "vitest";
import { buildChatPayload, buildFormSubmitPayload, FORMSUBMIT_ENDPOINT, isSpam, readContactFields, validateChatLead, validateContact } from "@/lib/contact-form";

const fd = (entries: Record<string, string>) => {
  const f = new FormData();
  Object.entries(entries).forEach(([k, v]) => f.set(k, v));
  return f;
};

describe("contact form", () => {
  it("delivers enquiries to info@cyberjustice.uk", () => {
    expect(FORMSUBMIT_ENDPOINT).toBe("https://formsubmit.co/ajax/info@cyberjustice.uk");
  });

  it("sets the visitor's email as reply-to", () => {
    const fields = readContactFields(fd({ name: "Jo", email: "jo@example.com", message: "Help" }));
    expect(buildFormSubmitPayload(fields)._replyto).toBe("jo@example.com");
  });

  it("rejects a missing name, bad email or empty message", () => {
    expect(validateContact(readContactFields(fd({ name: "", email: "jo@example.com", message: "x" })))).not.toBeNull();
    expect(validateContact(readContactFields(fd({ name: "Jo", email: "nope", message: "x" })))).not.toBeNull();
    expect(validateContact(readContactFields(fd({ name: "Jo", email: "jo@example.com", message: " " })))).not.toBeNull();
    expect(validateContact(readContactFields(fd({ name: "Jo", email: "jo@example.com", message: "x" })))).toBeNull();
  });

  it("treats a filled hidden field as spam", () => {
    expect(isSpam(readContactFields(fd({ website: "bot.com" })))).toBe(true);
    expect(isSpam(readContactFields(fd({})))).toBe(false);
  });
});

describe("CJ Bot enquiries", () => {
  const lead = {
    service: "Cryptocurrency scam", issue: "Fake exchange", platform: "Not sure", amount: "Prefer not to say",
    timeframe: "Within the last week", evidence: "No, not yet", name: "Jo Bloggs", email: "jo@example.com", phone: "", summary: "Help",
  };

  it("sends chat enquiries with the visitor's email as reply-to and the service in the subject", () => {
    const payload = buildChatPayload(lead);
    expect(payload._replyto).toBe("jo@example.com");
    expect(payload._subject).toBe("CJ Bot enquiry: Cryptocurrency scam");
    expect(payload.phone).toBe("Not provided");
  });

  it("requires a name, valid email and summary before sending", () => {
    expect(validateChatLead(lead)).toBeNull();
    expect(validateChatLead({ ...lead, email: "nope" })).not.toBeNull();
    expect(validateChatLead({ ...lead, summary: " " })).not.toBeNull();
    expect(validateChatLead({ ...lead, name: "" })).not.toBeNull();
  });
});
