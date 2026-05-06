# Email Notifications, Inbound Email Sync, and PDF Export Implementation

This document describes the implementation of three related features for the procurement app:

1. **Email Notifications**: Send email when users receive messages
2. **Inbound Email Sync**: Allow users to reply via email and sync responses back
3. **PDF Export**: Export full conversation threads as PDF documents

## Architecture Overview

### Email Service Abstraction

The email system uses a provider-agnostic abstraction in `convex/lib/email/`:

- **types.ts**: Type definitions for email interfaces
- **sendEmail.ts**: Provider implementations (SendGrid, Mailgun, Postmark, AWS SES, Mock)
- **templates/newMessageNotification.ts**: Email template generation
- **ENV.ts**: Environment configuration guide

### Backend Integration

- **Message Schema** (convex/schema.ts): Extended with email fields
  - `source`: "app" | "email"
  - `senderEmail`: Email address of sender (for email-sourced messages)
  - `emailMessageId`: Provider's unique message ID
  - `emailThreadId`: Thread identifier for reply routing

- **Message Mutations** (convex/functions/messages/mutations.ts):
  - `sendMessage`: Updated to trigger email notifications
  - `insertEmailMessage`: New mutation to insert email-sourced messages

- **Webhook Handlers**:
  - `convex/functions/system/emailWebhook.ts`: Inbound email webhook
  - `convex/functions/system/exportPdf.ts`: PDF export endpoint

- **PDF Generation** (convex/lib/pdf/pdfGenerator.ts):
  - Generates professional PDF transcripts
  - Uses PDFKit library

### Frontend Integration

- **Export Button** (src/chat/ExportButton.tsx):
  - React component with loading/error states
  - Downloads PDF to user's machine
  - Integrated into MessagingPage.tsx

## Implementation Status

### ✅ Completed

- [x] Message schema extensions for email metadata
- [x] Email service abstraction with multi-provider support
- [x] Email template generation (HTML and plain text)
- [x] Email notification trigger in sendMessage mutation
- [x] Inbound email webhook handler
- [x] PDF generation template and styling
- [x] Frontend export button with error handling
- [x] Thread ID generation and extraction logic
- [x] Environment variable documentation

### 🚧 TODO: Provider Implementation

All providers currently have placeholder implementations that log to console.

#### For SendGrid

1. **File**: `convex/lib/email/sendEmail.ts` (SendGridProvider class)

2. **Implementation needed**:
   ```typescript
   // In SendGridProvider.send():
   const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${this.apiKey}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(body),
   });
   ```

3. **Inbound setup**:
   - Settings → Inbound Parse
   - Add `EMAIL_REPLY_DOMAIN`
   - Set webhook to `https://yourapp.com/api/email/inbound`
   - Verify DNS records

4. **Testing**:
   ```bash
   export SENDGRID_API_KEY="SG.your_key_here"
   export EMAIL_PROVIDER="sendgrid"
   ```

#### For Mailgun

1. **File**: `convex/lib/email/sendEmail.ts` (MailgunProvider class)

2. **Implementation needed**:
   ```typescript
   // In MailgunProvider.send():
   const auth = btoa(`api:${this.apiKey}`);
   const response = await fetch(
     `https://api.mailgun.net/v3/${this.domain}/messages`,
     {
       method: "POST",
       headers: { Authorization: `Basic ${auth}` },
       body: formData,
     }
   );
   ```

3. **Inbound setup**:
   - Receiving → Routes
   - Add route for `.*@your-reply-domain.com`
   - Forward to webhook URL

#### For Postmark

1. **File**: `convex/lib/email/sendEmail.ts` (PostmarkProvider class)

2. **Implementation needed**:
   ```typescript
   // In PostmarkProvider.send():
   const response = await fetch("https://api.postmarkapp.com/email", {
     method: "POST",
     headers: {
       "X-Postmark-Server-Token": this.apiKey,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(body),
   });
   ```

#### For AWS SES

- Requires CloudFormation setup for SNS notifications
- See AWS documentation for receipt rule sets

### 🚧 TODO: Inbound Email Processing

**File**: `convex/functions/system/emailWebhook.ts`

Tasks:
1. Implement `insertEmailMessage` mutation call
2. Add user lookup by email (or create temporary user)
3. Verify sender is conversation member (access control)
4. Implement duplicate detection (store processed email IDs)
5. Add webhook signature verification for provider
6. Add rate limiting to prevent abuse

```typescript
// After parseInboundEmail:
// 1. Look up sender user by email
const sender = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", inboundEmail.from.email))
  .unique();

// 2. Verify sender is member of conversation
await requireConversationMember(ctx, conversationId, sender._id);

// 3. Check for duplicates
const existing = await ctx.db
  .query("messages")
  .withIndex("by_emailMessageId", (q) =>
    q.eq("emailMessageId", inboundEmail.messageId)
  )
  .unique();

// 4. Call mutation
return await ctx.runMutation(api.messages.mutations.insertEmailMessage, {
  conversationId,
  senderEmail: inboundEmail.from.email,
  senderName: inboundEmail.from.name,
  content: cleanedBody,
  emailMessageId: inboundEmail.messageId,
  threadId,
});
```

### 🚧 TODO: PDF Export HTTP Handler

**File**: `convex/functions/system/exportPdf.ts`

Tasks:
1. Implement context/database access for HTTP handlers
2. Call `getConversationForExport` query
3. Generate PDF using `generateConversationPdf`
4. Stream PDF to client
5. Add user access verification

```typescript
// In handler:
// 1. Get conversation data
const data = await getConversationForExport(ctx, conversationId);

// 2. Transform to PDF format
const pdfData: ConversationThreadData = {
  conversationId,
  title: data.conversation.title,
  messages: data.messages.map(msg => ({
    timestamp: msg.createdAt,
    senderName: msg.senderName,
    senderEmail: msg.senderEmail,
    source: msg.source || "app",
    body: msg.content,
  })),
  participants: data.members,
  startDate: Math.min(...data.messages.map(m => m.createdAt)),
  endDate: Math.max(...data.messages.map(m => m.createdAt)),
  generatedDate: Date.now(),
};

// 3. Generate and return PDF
const doc = generateConversationPdf(pdfData);
const pdfBuffer = await pdfDocToBuffer(doc);

return new Response(pdfBuffer, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="conversation-${conversationId}.pdf"`,
  },
});
```

### 🚧 TODO: Frontend PDF Export

**File**: `src/chat/ExportButton.tsx`

Tasks:
1. Implement fetch call to `/api/export/conversation/:id`
2. Handle response blob
3. Trigger browser download

```typescript
// In handleExport():
const response = await fetch(
  `/api/export/conversation/${conversationId}?userId=${userId}`,
  { method: "GET" }
);

if (!response.ok) {
  throw new Error(`Export failed: ${response.statusText}`);
}

const blob = await response.blob();
downloadBlob(blob, `conversation-${conversationTitle || conversationId}.pdf`);
```

### 🚧 TODO: User Email Lookup

The system needs to create or update users when emails arrive from unknown senders.

**File**: `convex/functions/users/mutations.ts`

Add/modify:
- `getOrCreateUserByEmail`: Look up user by email, create stub if not found
- `updateUserEmail`: For users who sign up but don't have email yet

### 🚧 TODO: Signature Verification

Each provider has different webhook signature schemes. Add verification:

- **SendGrid**: SMTPAPI header verification
- **Mailgun**: HMAC-SHA256 of token + timestamp + body
- **Postmark**: SHA256 of JSON body with secret
- **AWS SES**: SNS message validation

See provider docs for implementation details.

## Environment Variables

### Mandatory

```bash
EMAIL_FROM=noreply@procurement.example.com
EMAIL_FROM_NAME="Procurement System"
EMAIL_REPLY_DOMAIN=procurement.example.com
APP_BASE_URL=https://procurement.example.com
EMAIL_PROVIDER=sendgrid  # or mailgun, postmark, aws-ses, mock
```

### Provider-Specific

**SendGrid**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
```

**Mailgun**:
```bash
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.procurement.example.com
```

**Postmark**:
```bash
POSTMARK_API_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

**AWS SES**:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Development

For local development, use the mock provider:

```bash
EMAIL_FROM=noreply@localhost.local
EMAIL_FROM_NAME="Dev Procurement"
EMAIL_REPLY_DOMAIN=localhost.local
APP_BASE_URL=http://localhost:5173
EMAIL_PROVIDER=mock
```

Emails will be logged to console instead of being sent.

## Testing

### Local Testing Without Email Provider

1. **Set up environment**:
   ```bash
   export EMAIL_PROVIDER=mock
   export EMAIL_FROM=noreply@localhost.local
   export APP_BASE_URL=http://localhost:5173
   export EMAIL_REPLY_DOMAIN=localhost.local
   ```

2. **Start development server**:
   ```bash
   npm run convex:dev
   ```

3. **Send message in app**:
   - Check console logs for "[EMAIL]" prefix
   - Should see mock email being "sent"

### Local Testing With SendGrid/Mailgun (Webhook)

1. **Get public webhook URL** (use ngrok for local):
   ```bash
   ngrok http 3000
   # Get: https://abcd-12-345-678-90.ngrok.io
   ```

2. **Configure provider webhook**:
   - Set to: `https://abcd-12-345-678-90.ngrok.io/api/email/inbound`

3. **Send test email** to `replies+THREADID@yourdomain`

4. **Check server logs** for webhook receipt

### PDF Export Testing

1. Open conversation with messages
2. Click "📄 Export as PDF" button
3. File should download as PDF
4. Open and verify formatting

## Security Considerations

### Access Control

- ✅ Verify user is conversation member before allowing export
- 🚧 TODO: Verify user is conversation member before inserting email

### Data Integrity

- 🚧 TODO: Implement duplicate detection (deduplicate on `emailMessageId`)
- 🚧 TODO: Log rejected emails (unknown senders, malformed)
- ✅ Never silently accept emails from unknown senders

### Webhook Security

- 🚧 TODO: Implement signature verification for all providers
- 🚧 TODO: Rate limiting on inbound webhook
- 🚧 TODO: Validate webhook IP ranges if provider supports

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `convex/schema.ts` | Extended message schema | ✅ |
| `convex/lib/email/types.ts` | Type definitions | ✅ |
| `convex/lib/email/sendEmail.ts` | Provider implementations | 🚧 |
| `convex/lib/email/templates/newMessageNotification.ts` | Email templates | ✅ |
| `convex/lib/email/index.ts` | Export barrel | ✅ |
| `convex/lib/email/ENV.ts` | Configuration guide | ✅ |
| `convex/lib/pdf/pdfGenerator.ts` | PDF generation | ✅ |
| `convex/lib/helpers.ts` | Thread ID utilities | ✅ |
| `convex/functions/messages/mutations.ts` | Updated sendMessage | ✅ |
| `convex/functions/messages/mutations.ts` | insertEmailMessage | 🚧 |
| `convex/functions/conversations/queries.ts` | getConversationForExport | ✅ |
| `convex/functions/system/emailWebhook.ts` | Inbound webhook | 🚧 |
| `convex/functions/system/exportPdf.ts` | PDF export endpoint | 🚧 |
| `src/chat/ExportButton.tsx` | Export UI component | 🚧 |
| `src/chat/MessagingPage.tsx` | Updated with button | ✅ |
| `src/chat/chat.css` | Export button styles | ✅ |

## Next Steps

1. Choose email provider (SendGrid recommended for ease)
2. Implement provider in `sendEmail.ts`
3. Complete HTTP handler implementations
4. Set up inbound email forwarding in provider console
5. Test with sample conversations
6. Deploy to production
7. Monitor webhook logs for errors

## References

- [SendGrid API Docs](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [SendGrid Inbound Parse](https://sendgrid.com/docs/for-developers/parsing/inbound-email/)
- [Mailgun API Docs](https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/)
- [Postmark API Docs](https://postmarkapp.com/developer)
- [AWS SES API Docs](https://docs.aws.amazon.com/ses/)
- [PDFKit Documentation](http://pdfkit.org/)
- [Convex HTTP Routing](https://docs.convex.dev/functions/http-handlers)
