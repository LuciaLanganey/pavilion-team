// TODO: Set these environment variables in the Convex dashboard
// (Project Settings → Environment Variables):
//
//   EMAIL_PROVIDER     "sendgrid" | "mailgun" | "postmark" | "mock"
//   EMAIL_FROM         sender address  e.g. noreply@procurement.example.com
//   EMAIL_FROM_NAME    sender name     e.g. "Procurement System"
//   EMAIL_REPLY_DOMAIN reply domain    e.g. procurement.example.com
//   APP_BASE_URL       public app URL  e.g. https://app.procurement.example.com
//
// Provider keys (only the one matching EMAIL_PROVIDER is required):
//   SENDGRID_API_KEY
//   MAILGUN_API_KEY + MAILGUN_DOMAIN
//   POSTMARK_API_KEY

import { SendEmailOptions, InboundEmail, EmailProvider } from "./types";

// ── SendGrid ─────────────────────────────────────────────────────────────────

class SendGridProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("SENDGRID_API_KEY not configured");
    this.apiKey = apiKey;
  }

  async send(options: SendEmailOptions): Promise<{ messageId: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    const body = {
      personalizations: [
        {
          to: toArray.map((t) => ({ email: t.email, name: t.name })),
          headers: options.headers ?? {},
        },
      ],
      from: { email: options.from.email, name: options.from.name },
      subject: options.subject,
      content: [{ type: "text/html", value: options.htmlBody }],
      ...(options.textBody && {
        content: [
          { type: "text/plain", value: options.textBody },
          { type: "text/html", value: options.htmlBody },
        ],
      }),
      ...(options.replyTo && { reply_to: { email: options.replyTo } }),
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SendGrid error ${response.status}: ${text}`);
    }

    // SendGrid returns 202 with no body; message-id is in the X-Message-Id header
    return {
      messageId: response.headers.get("X-Message-Id") ?? `sg_${Date.now()}`,
    };
  }

  async parseInboundWebhook(body: unknown): Promise<InboundEmail> {
    // SendGrid Inbound Parse sends multipart/form-data; by the time it reaches
    // the httpAction the body has been decoded into a plain object by the caller.
    const data = body as Record<string, unknown>;
    return {
      messageId: (data["MessageID"] ?? data["message-id"] ?? "") as string,
      from: parseEmailAddress((data["from"] as string) ?? ""),
      to: [data["to"] as string],
      subject: (data["subject"] as string) ?? "",
      textBody: (data["text"] as string) ?? "",
      htmlBody: (data["html"] as string) ?? undefined,
      headers: parseRawHeaders((data["headers"] as string) ?? ""),
      timestamp: Date.now(),
    };
  }
}

// ── Mailgun ───────────────────────────────────────────────────────────────────

class MailgunProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;

  constructor(apiKey: string, domain: string) {
    if (!apiKey) throw new Error("MAILGUN_API_KEY not configured");
    if (!domain) throw new Error("MAILGUN_DOMAIN not configured");
    this.apiKey = apiKey;
    this.domain = domain;
  }

  async send(options: SendEmailOptions): Promise<{ messageId: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    const form = new FormData();
    form.append("from", `${options.from.name ?? ""} <${options.from.email}>`);
    toArray.forEach((t) => form.append("to", t.name ? `${t.name} <${t.email}>` : t.email));
    form.append("subject", options.subject);
    form.append("html", options.htmlBody);
    if (options.textBody) form.append("text", options.textBody);
    if (options.replyTo) form.append("h:Reply-To", options.replyTo);
    Object.entries(options.headers ?? {}).forEach(([k, v]) =>
      form.append(`h:${k}`, v),
    );

    const auth = btoa(`api:${this.apiKey}`);
    const response = await fetch(
      `https://api.mailgun.net/v3/${this.domain}/messages`,
      { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: form },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Mailgun error ${response.status}: ${text}`);
    }

    const json = (await response.json()) as { id?: string };
    return { messageId: json.id ?? `mg_${Date.now()}` };
  }

  async parseInboundWebhook(body: unknown): Promise<InboundEmail> {
    // Mailgun posts form-encoded or multipart; caller supplies plain object
    const data = body as Record<string, unknown>;
    return {
      messageId: (data["Message-Id"] as string) ?? "",
      from: parseEmailAddress((data["from"] as string) ?? ""),
      to: [(data["recipient"] as string) ?? ""],
      subject: (data["subject"] as string) ?? "",
      textBody: (data["body-plain"] as string) ?? "",
      htmlBody: (data["body-html"] as string) ?? undefined,
      headers: parseRawHeaders((data["message-headers"] as string) ?? ""),
      timestamp: Date.now(),
    };
  }
}

// ── Postmark ──────────────────────────────────────────────────────────────────

class PostmarkProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("POSTMARK_API_KEY not configured");
    this.apiKey = apiKey;
  }

  async send(options: SendEmailOptions): Promise<{ messageId: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    const body = {
      From: `${options.from.name ?? "Notification"} <${options.from.email}>`,
      To: toArray.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)).join(","),
      Subject: options.subject,
      HtmlBody: options.htmlBody,
      ...(options.textBody && { TextBody: options.textBody }),
      ...(options.replyTo && { ReplyTo: options.replyTo }),
      Headers: Object.entries(options.headers ?? {}).map(([Name, Value]) => ({
        Name,
        Value,
      })),
    };

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Postmark error ${response.status}: ${text}`);
    }

    const json = (await response.json()) as { MessageID?: string };
    return { messageId: json.MessageID ?? `pm_${Date.now()}` };
  }

  async parseInboundWebhook(body: unknown): Promise<InboundEmail> {
    const data = body as Record<string, unknown>;
    const rawHeaders = data.Headers as Array<{ Name: string; Value: string }> | undefined;
    return {
      messageId: (data.MessageID as string) ?? "",
      from: {
        email: (data.FromFull as { Email?: string })?.Email ?? parseEmailAddress(data.From as string).email,
        name: (data.FromName as string) ?? undefined,
      },
      to: [(data.OriginalRecipient as string) ?? (data.To as string) ?? ""],
      subject: (data.Subject as string) ?? "",
      textBody: (data.TextBody as string) ?? "",
      htmlBody: (data.HtmlBody as string) ?? undefined,
      headers: rawHeaders
        ? Object.fromEntries(rawHeaders.map((h) => [h.Name, h.Value]))
        : {},
      timestamp: data.Date
        ? new Date(data.Date as string).getTime()
        : Date.now(),
    };
  }
}

// ── Mock (development) ────────────────────────────────────────────────────────

class MockProvider implements EmailProvider {
  async send(options: SendEmailOptions): Promise<{ messageId: string }> {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    console.log("[EMAIL:mock] Would send:", {
      to: options.to,
      from: options.from,
      subject: options.subject,
      replyTo: options.replyTo,
      messageId,
    });
    return { messageId };
  }

  async parseInboundWebhook(_body: unknown): Promise<InboundEmail> {
    throw new Error("Mock provider does not support inbound webhook parsing");
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseEmailAddress(raw: string): { email: string; name?: string } {
  // Handles "Name <email@x.com>" or "email@x.com"
  const match = raw.match(/^(.*?)\s*<([^>]+)>/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: raw.trim() };
}

function parseRawHeaders(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx !== -1) {
      result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return result;
}

// ── Provider singleton ────────────────────────────────────────────────────────

let cachedProvider: EmailProvider | null = null;

export function initializeEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  const name = (process.env.EMAIL_PROVIDER ?? "mock").toLowerCase();

  switch (name) {
    case "sendgrid":
      cachedProvider = new SendGridProvider(process.env.SENDGRID_API_KEY ?? "");
      break;
    case "mailgun":
      cachedProvider = new MailgunProvider(
        process.env.MAILGUN_API_KEY ?? "",
        process.env.MAILGUN_DOMAIN ?? "",
      );
      break;
    case "postmark":
      cachedProvider = new PostmarkProvider(process.env.POSTMARK_API_KEY ?? "");
      break;
    case "mock":
    default:
      console.warn(
        "[EMAIL] Using mock provider. Set EMAIL_PROVIDER in Convex env vars for production.",
      );
      cachedProvider = new MockProvider();
  }

  return cachedProvider;
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ messageId: string }> {
  if (!process.env.EMAIL_FROM) console.warn("[EMAIL] EMAIL_FROM not set");
  if (!process.env.APP_BASE_URL) console.warn("[EMAIL] APP_BASE_URL not set");
  if (!process.env.EMAIL_REPLY_DOMAIN) console.warn("[EMAIL] EMAIL_REPLY_DOMAIN not set");

  return initializeEmailProvider().send(options);
}

export async function parseInboundEmail(body: unknown): Promise<InboundEmail> {
  return initializeEmailProvider().parseInboundWebhook(body);
}
