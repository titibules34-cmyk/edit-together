import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};
type WorkerEnv = { RESEND_API_KEY?: string };

const jsonResponse = (body: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function handleContactSubmission(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);
  const origin = request.headers.get("origin");
  if (origin && !["https://cyberjustice.uk", "https://www.cyberjustice.uk"].includes(origin)) {
    return jsonResponse({ error: "Request origin not allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Expected JSON request." }, 415);
  }
  const rawBody = await request.text();
  if (rawBody.length > 12_000) return jsonResponse({ error: "Message is too large." }, 413);

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody) as Record<string, unknown>; }
  catch { return jsonResponse({ error: "Invalid request." }, 400); }

  // Quietly discard submissions caught by the hidden honeypot field.
  if (typeof payload.website === "string" && payload.website.trim()) {
    return jsonResponse({ ok: "Message received." });
  }
  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 120) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 254) : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim().slice(0, 80) : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim().slice(0, 160) : "";
  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 6000) : "";
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Please provide your name, a valid email address and a message." }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: "The contact service is not configured yet. Please email info@cyberjustice.uk directly." }, 503);
  }

  const textBody = [
    "New website enquiry for Cyber Justice", "",
    `Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`,
    `Subject: ${subject || "Confidential consultation"}`, "", "Message:", message,
  ].join("\n");
  try {
    const upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Cyber Justice Website <info@cyberjustice.uk>",
        to: ["info@cyberjustice.uk"],
        reply_to: email,
        subject: `Website enquiry: ${subject || "Confidential consultation"}`,
        text: textBody,
      }),
    });
    if (!upstream.ok) {
      // Log only the provider's error code/name and HTTP status; never log enquiry contents.
      const providerError = await upstream.json().catch(() => ({})) as { name?: unknown; message?: unknown; statusCode?: unknown };
      console.error("Resend email send failed", {
        httpStatus: upstream.status,
        errorName: typeof providerError.name === "string" ? providerError.name : undefined,
        errorMessage: typeof providerError.message === "string" ? providerError.message.slice(0, 300) : undefined,
        providerStatus: typeof providerError.statusCode === "number" ? providerError.statusCode : undefined,
      });
      return jsonResponse({ error: "We couldn't send your enquiry just now. Please email info@cyberjustice.uk directly." }, 502);
    }
    return jsonResponse({ ok: "Message sent." });
  } catch {
    return jsonResponse({ error: "We couldn't send your enquiry just now. Please email info@cyberjustice.uk directly." }, 502);
  }
}

let serverEntryPromise: Promise<ServerEntry> | undefined;
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch { return false; }
}

// Hosting compresses responses at the edge. Do not compress or set content-encoding here.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/api/contact") {
        return await handleContactSubmission(request, (env ?? {}) as WorkerEnv);
      }
      const handler = await getServerEntry();
      return await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
