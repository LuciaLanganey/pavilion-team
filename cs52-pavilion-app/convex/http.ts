import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { parseInboundEmail } from "./lib/email/sendEmail";
import {
  extractThreadIdFromEmail,
  extractThreadIdFromSubject,
  decodeThreadId,
} from "./lib/helpers";

const http = httpRouter();

/**
 * Inbound email webhook endpoint.
 *
 * Configure your email provider to POST inbound emails here:
 *   https://<your-convex-deployment>.convex.site/api/inbound-email
 *
 * TODO: Provider-specific setup
 *   SendGrid  — Inbound Parse webhook URL in SendGrid dashboard
 *   Mailgun   — Routes → Create Route → Forward to URL
 *   Postmark  — Inbound webhook URL in server settings
 *
 * TODO: Add webhook signature verification for your chosen provider so that
 * only your provider's requests are accepted. Each provider has a different
 * signing mechanism:
 *   SendGrid  — X-Twilio-Email-Event-Webhook-Signature header
 *   Mailgun   — X-Mailgun-Signature header + timestamp + token
 *   Postmark  — X-Postmark-Signature header
 *
 * The endpoint always returns 200 OK to avoid the provider retrying.
 * Rejected/invalid emails are logged to the rejectedEmails table instead.
 */
http.route({
  path: "/api/inbound-email",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    let body: unknown;

    try {
      const contentType = req.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        body = await req.json();
      } else if (
        contentType.includes("application/x-www-form-urlencoded") ||
        contentType.includes("multipart/form-data")
      ) {
        // Parse form-encoded body into a plain object for provider parsers
        const text = await req.text();
        body = parseFormEncoded(text);
      } else {
        // Fall through: attempt JSON, ignore parse errors
        try {
          body = await req.json();
        } catch {
          body = {};
        }
      }
    } catch (err) {
      console.error("[INBOUND EMAIL] Failed to parse request body:", err);
      return new Response("OK", { status: 200 });
    }

    let inbound: Awaited<ReturnType<typeof parseInboundEmail>>;
    try {
      inbound = await parseInboundEmail(body);
    } catch (err) {
      console.error("[INBOUND EMAIL] Failed to parse inbound email:", err);
      return new Response("OK", { status: 200 });
    }

    const toAddress = inbound.to[0] ?? "";
    const fromEmail = inbound.from.email?.toLowerCase().trim() ?? "";

    // ── 1. Extract thread ID from To address or Subject ──────────────────────
    const threadId =
      extractThreadIdFromEmail(toAddress) ??
      extractThreadIdFromSubject(inbound.subject) ??
      extractThreadIdFromHeader(inbound.headers);

    if (!threadId) {
      console.warn("[INBOUND EMAIL] No thread ID found — rejecting", {
        from: fromEmail,
        to: toAddress,
        subject: inbound.subject,
      });
      await ctx.runMutation(
        internal.functions.messages.mutations.logRejectedEmail,
        {
          fromEmail,
          toAddress,
          subject: inbound.subject,
          reason: "no_thread_id",
        },
      );
      return new Response("OK", { status: 200 });
    }

    // ── 2. Decode conversation ID ─────────────────────────────────────────────
    let conversationId: string;
    try {
      conversationId = decodeThreadId(threadId);
    } catch {
      await ctx.runMutation(
        internal.functions.messages.mutations.logRejectedEmail,
        {
          fromEmail,
          toAddress,
          subject: inbound.subject,
          reason: "invalid_thread_id",
          rawThreadId: threadId,
        },
      );
      return new Response("OK", { status: 200 });
    }

    // ── 3. Find sender by email address ──────────────────────────────────────
    const sender = await ctx.runQuery(
      api.functions.users.queries.getUserByEmail,
      { email: fromEmail },
    );

    if (!sender) {
      console.warn("[INBOUND EMAIL] Unknown sender — rejecting", { fromEmail });
      await ctx.runMutation(
        internal.functions.messages.mutations.logRejectedEmail,
        {
          fromEmail,
          toAddress,
          subject: inbound.subject,
          reason: "unknown_sender",
          rawThreadId: threadId,
        },
      );
      return new Response("OK", { status: 200 });
    }

    // ── 4. Clean the email body ───────────────────────────────────────────────
    const cleanedBody = cleanEmailBody(inbound.textBody ?? "");

    if (!cleanedBody.trim()) {
      // Empty after stripping — likely a forwarded-only email with no new content
      await ctx.runMutation(
        internal.functions.messages.mutations.logRejectedEmail,
        {
          fromEmail,
          toAddress,
          subject: inbound.subject,
          reason: "empty_body_after_cleaning",
          rawThreadId: threadId,
        },
      );
      return new Response("OK", { status: 200 });
    }

    // ── 5. Insert the message (internalMutation handles membership + dedup) ──
    try {
      await ctx.runMutation(
        internal.functions.messages.mutations.receiveEmailMessage,
        {
          // Convex validates this as Id<"conversations"> server-side
          conversationId: conversationId as never,
          senderUserId: sender._id,
          emailFrom: fromEmail,
          content: cleanedBody,
          emailMessageId: inbound.messageId || `${fromEmail}_${Date.now()}`,
          receivedAt: inbound.timestamp,
        },
      );
    } catch (err) {
      // Likely an invalid conversationId format
      console.error("[INBOUND EMAIL] Failed to insert message:", err);
      await ctx.runMutation(
        internal.functions.messages.mutations.logRejectedEmail,
        {
          fromEmail,
          toAddress,
          subject: inbound.subject,
          reason: "insert_failed",
          rawThreadId: threadId,
        },
      );
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse application/x-www-form-urlencoded body into a plain object. */
function parseFormEncoded(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of text.split("&")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, idx).replace(/\+/g, " "));
    const val = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " "));
    result[key] = val;
  }
  return result;
}

/** Try extracting thread ID from email headers (X-Thread-ID or X-Procurement-Thread). */
function extractThreadIdFromHeader(
  headers: Record<string, string>,
): string | null {
  return (
    headers["X-Thread-ID"] ??
    headers["X-Procurement-Thread"] ??
    headers["x-thread-id"] ??
    null
  );
}

/**
 * Strip quoted reply text and common email signatures from a plain-text body.
 * This is a best-effort cleanup — not perfect, but good enough for most clients.
 */
export function cleanEmailBody(text: string): string {
  const lines = text.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Stop at "On ... wrote:" style reply headers (Gmail, Outlook, Apple Mail)
    if (/^On .+wrote:$/i.test(trimmed)) break;
    if (/^-{3,}\s*(Original Message|Forwarded Message)\s*-{3,}/i.test(trimmed)) break;
    if (/^From:\s+.+@/i.test(trimmed) && cleaned.length > 0) break;

    // Skip quoted lines (start with ">")
    if (trimmed.startsWith(">")) continue;

    cleaned.push(line);
  }

  // Trim trailing blank lines
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === "") {
    cleaned.pop();
  }

  return cleaned.join("\n").trim();
}
