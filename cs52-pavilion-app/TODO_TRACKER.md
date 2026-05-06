# TODO Tracker - Email & PDF Export Features

This file lists all TODO comments in the codebase so you can systematically complete the implementation.

## Priority 1: Email Provider Implementation 🔴

### convex/lib/email/sendEmail.ts

**TODO: SendGridProvider.send() - Implement SendGrid API**
- Location: Line ~30
- Task: Replace console.warn with actual API call to SendGrid
- Code template:
  ```typescript
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  const result = await response.json();
  return { messageId: result.id };
  ```
- Reference: SendGrid API docs in comments

**TODO: MailgunProvider.send() - Implement Mailgun API**
- Location: Line ~65
- Task: Replace console.warn with Mailgun API call
- Reference: Mailgun API docs in comments

**TODO: PostmarkProvider.send() - Implement Postmark API**
- Location: Line ~95
- Task: Replace console.warn with Postmark API call
- Reference: Postmark API docs in comments

**TODO: MockProvider and other providers - Implement AWS SES**
- Location: Line ~110+
- Task: Add AwsSesProvider class implementation
- Reference: AWS SES docs

---

## Priority 2: Webhook Handler Implementation 🟡

### convex/functions/system/emailWebhook.ts

**TODO: Add sendEmail mutation call**
- Location: Line ~85
- Task: Replace mock console.log with actual mutation call:
  ```typescript
  const result = await ctx.runMutation(
    api.messages.mutations.insertEmailMessage,
    {
      conversationId,
      senderEmail: inboundEmail.from.email,
      senderName: inboundEmail.from.name,
      content: cleanedBody,
      emailMessageId: inboundEmail.messageId,
      threadId,
    }
  );
  ```
- Depends on: `insertEmailMessage` mutation completion

**TODO: Implement user lookup by email**
- Location: Line ~85 (before calling mutation)
- Task: Look up user by email and verify conversation membership
  ```typescript
  const sender = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", inboundEmail.from.email))
    .unique();
  
  if (!sender) {
    return new Response(
      JSON.stringify({ error: "Sender not found" }),
      { status: 403 }
    );
  }
  
  await requireConversationMember(ctx, conversationId, sender._id);
  ```

**TODO: Implement duplicate detection**
- Location: Line ~75 (after thread ID extraction)
- Task: Check if email was already processed
  ```typescript
  const existing = await ctx.db
    .query("messages")
    .withIndex("by_emailMessageId", (q) =>
      q.eq("emailMessageId", inboundEmail.messageId)
    )
    .unique();
  
  if (existing) {
    return new Response(
      JSON.stringify({ ok: true, note: "Duplicate detected" }),
      { status: 200 }
    );
  }
  ```

**TODO: Implement webhook signature verification**
- Location: Line ~55 (after body parsing)
- Task: Verify signature for each provider
  ```typescript
  // Example for SendGrid
  if (process.env.EMAIL_PROVIDER === "sendgrid") {
    const signature = req.headers["x-twilio-email-event-webhook-signature"];
    // Implement SMTPAPI header verification
  }
  ```

**TODO: Configure email provider to send inbound emails to this endpoint**
- Task: After deploying, set webhook URL in provider dashboard
- URL: https://yourdomain.com/api/email/inbound

---

## Priority 3: PDF Export Implementation 🟡

### convex/functions/system/exportPdf.ts

**TODO: Implement context access for HTTP handlers**
- Location: Line ~40
- Task: Call getConversationForExport query
  ```typescript
  // HTTP handlers don't have ctx directly - may need API wrapper
  // Option 1: Create API endpoint that calls Convex action
  // Option 2: Pass data from frontend
  const data = await getConversationForExport(ctx, conversationId);
  ```

**TODO: Generate PDF and stream to client**
- Location: Line ~45
- Task: Transform data and generate PDF
  ```typescript
  const pdfData: ConversationThreadData = {
    conversationId,
    title: data.conversation.title,
    messages: data.messages.map(msg => ({
      timestamp: msg.createdAt,
      senderName: msg.senderName,
      senderEmail: msg.senderEmail,
      senderOrganization: undefined, // TODO: Add org fields
      source: msg.source || "app",
      body: msg.content,
    })),
    participants: data.members.map(m => ({
      name: m.name,
      email: m.email,
    })),
    startDate: Math.min(...data.messages.map(m => m.createdAt)),
    endDate: Math.max(...data.messages.map(m => m.createdAt)),
    generatedDate: Date.now(),
    generatedBy: userId, // TODO: Add user name
  };
  
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

**TODO: Add user access verification**
- Location: Line ~30
- Task: Verify user is conversation member
  ```typescript
  const userId = req.query.userId;
  const membership = await ctx.db
    .query("conversationMembers")
    .withIndex("by_userId_and_conversationId", (q) =>
      q.eq("userId", userId).eq("conversationId", conversationId)
    )
    .unique();
  
  if (!membership) {
    return new Response(
      JSON.stringify({ error: "Access denied" }),
      { status: 403 }
    );
  }
  ```

---

## Priority 4: Frontend Implementation 🟡

### src/chat/ExportButton.tsx

**TODO: Implement fetch call to PDF export endpoint**
- Location: Line ~45 (in handleExport)
- Task: Call backend API and download PDF
  ```typescript
  const response = await fetch(
    `/api/export/conversation/${conversationId}?userId=${userId}`,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  const filename = `conversation-${conversationTitle || conversationId}.pdf`;
  downloadBlob(blob, filename);
  ```

---

## Priority 5: Message Mutations 🟠

### convex/functions/messages/mutations.ts

**TODO: Complete insertEmailMessage mutation**
- Location: Line ~120+
- Current issues:
  - `senderId` set to `null as any` - needs real user ID
  - Need user lookup by email
  - Need duplicate detection
- Task: 
  ```typescript
  // Replace null with actual user ID
  const sender = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", args.senderEmail))
    .unique();
  
  if (!sender) {
    throw new Error("Sender not found");
  }
  
  // Check duplicate
  const existing = await ctx.db
    .query("messages")
    .withIndex("by_emailMessageId", (q) =>
      q.eq("emailMessageId", args.emailMessageId)
    )
    .unique();
  
  if (existing) return existing._id;
  
  // Insert with real senderId
  const messageId = await ctx.db.insert("messages", {
    // ...
    senderId: sender._id,
    // ...
  });
  ```

---

## Priority 6: User Management 🟢

### convex/functions/users/mutations.ts (or queries.ts)

**TODO: Create getOrCreateUserByEmail function**
- Task: Look up user by email, create stub if not found
- Use case: Email replies from users not yet in system
- Implementation:
  ```typescript
  export const getOrCreateUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      
      if (existing) return existing;
      
      // Create temporary user
      return await ctx.db.insert("users", {
        email,
        name: email.split("@")[0], // Use email prefix as name
        createdAt: Date.now(),
      });
    },
  });
  ```

---

## Priority 7: Security & Polish 🟢

### General TODOs (lower priority but important)

**TODO: Implement signature verification for all email providers**
- SendGrid: SMTPAPI header verification
- Mailgun: HMAC-SHA256 of token + timestamp + body
- Postmark: SHA256 of JSON body with secret
- Reference: Provider docs in sendEmail.ts comments

**TODO: Add rate limiting to webhook endpoint**
- Prevent abuse of inbound email endpoint
- Use sliding window or token bucket approach

**TODO: Implement audit logging**
- Log all email notifications sent
- Log rejected inbound emails with reason
- Store in separate audit table if needed

**TODO: Add email domain verification**
- Only allow email replies from known domains
- Configuration per conversation or globally

---

## Testing TODOs 🧪

**TODO: Test email notification sending**
- Set EMAIL_PROVIDER=mock
- Send message
- Verify console logs show email details

**TODO: Test with SendGrid**
- Get API key
- Set SENDGRID_API_KEY and EMAIL_PROVIDER=sendgrid
- Send message
- Check SendGrid dashboard

**TODO: Test inbound webhook locally**
- Use ngrok: `ngrok http 3000`
- Configure email provider with ngrok URL
- Reply to email
- Check server logs

**TODO: Test PDF export**
- Click "Export as PDF" button
- Verify PDF downloads
- Open and check formatting

---

## Configuration TODOs 📋

**TODO: Set up email provider account**
- [ ] Choose: SendGrid, Mailgun, Postmark, or AWS SES
- [ ] Create account
- [ ] Generate API key
- [ ] Set EMAIL_PROVIDER environment variable
- [ ] Set provider-specific keys

**TODO: Configure inbound email routing**
- [ ] Set up domain with email provider
- [ ] Configure webhook URL
- [ ] Verify domain DNS records
- [ ] Test inbound route

**TODO: Deploy HTTP endpoints**
- [ ] Deploy Convex functions with HTTP routes
- [ ] Verify /api/email/inbound is accessible
- [ ] Verify /api/export/conversation/:id is accessible
- [ ] Configure webhook URLs in production

---

## Completion Checklist

When all TODOs are complete, verify:

- [ ] Email provider API calls working
- [ ] Emails sending when messages are received
- [ ] Inbound emails routing to webhook
- [ ] Email replies syncing back to conversations
- [ ] PDF export working
- [ ] PDF downloads with correct formatting
- [ ] Access control working
- [ ] Duplicate detection preventing email duplicates
- [ ] No emails sent in test/staging unless intended
- [ ] All environment variables documented
- [ ] Error cases handled gracefully

---

## Quick Reference: Environment Variables

```bash
# Required for all environments
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME="System Name"
EMAIL_REPLY_DOMAIN=example.com
APP_BASE_URL=https://example.com
EMAIL_PROVIDER=sendgrid  # or mailgun, postmark, aws-ses, mock

# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Mailgun  
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mg.example.com

# Postmark
POSTMARK_API_KEY=xxxxx

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## Files with TODOs

Run this to find all TODOs:
```bash
grep -r "TODO:" convex/ src/ --include="*.ts" --include="*.tsx"
```

Main files:
- convex/lib/email/sendEmail.ts (5+ TODOs)
- convex/functions/system/emailWebhook.ts (4+ TODOs)
- convex/functions/system/exportPdf.ts (3+ TODOs)
- src/chat/ExportButton.tsx (1 TODO)
- convex/functions/messages/mutations.ts (2 TODOs)
