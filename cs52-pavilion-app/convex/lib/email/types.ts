// TODO: Set these environment variables in your Convex dashboard:
//   EMAIL_PROVIDER     - "sendgrid" | "mailgun" | "postmark" | "mock" (default: "mock")
//   EMAIL_FROM         - sender address, e.g. "noreply@procurement.example.com"
//   EMAIL_FROM_NAME    - sender display name, e.g. "Procurement System"
//   EMAIL_REPLY_DOMAIN - domain for reply-to routing, e.g. "procurement.example.com"
//   APP_BASE_URL       - public app URL, e.g. "https://app.procurement.example.com"
//
// Provider-specific keys:
//   SENDGRID_API_KEY   - SendGrid API key
//   MAILGUN_API_KEY    - Mailgun API key
//   MAILGUN_DOMAIN     - Mailgun sending domain
//   POSTMARK_API_KEY   - Postmark server API token

export type EmailAddress = {
  email: string;
  name?: string;
};

export type SendEmailOptions = {
  from: EmailAddress;
  to: EmailAddress | EmailAddress[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export type InboundEmail = {
  messageId: string;
  from: EmailAddress;
  to: string[];
  subject: string;
  textBody: string;
  htmlBody?: string;
  headers: Record<string, string>;
  timestamp: number;
};

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ messageId: string }>;
  parseInboundWebhook(body: unknown): Promise<InboundEmail>;
}
