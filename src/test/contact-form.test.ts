import { describe, expect, it } from "vitest";
import { buildFormSubmitPayload, FORMSUBMIT_ENDPOINT, isSpam, readContactFields, validateContact } from "@/lib/contact-form";

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
