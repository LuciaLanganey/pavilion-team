export type NewMessageNotificationData = {
  senderName: string;
  recipientName: string;
  conversationTitle: string;
  messagePreview: string;
  conversationUrl: string;
  threadId: string;
  replyDomain: string;
};

/** Returns the text-only version of the notification email. */
export function renderNewMessageNotificationText(
  data: NewMessageNotificationData,
): string {
  const replyAddress = `replies+${data.threadId}@${data.replyDomain}`;
  return [
    `New message from ${data.senderName}`,
    `Re: ${data.conversationTitle}`,
    "",
    data.messagePreview,
    "",
    `─────────────────────────────────────────`,
    `Reply to this email to respond in the conversation, or open it in the app:`,
    data.conversationUrl,
    "",
    `Reply address: ${replyAddress}`,
    `─────────────────────────────────────────`,
    `This is a procurement communication notification. Do not forward this email to`,
    `parties who are not part of this conversation.`,
  ].join("\n");
}

/** Returns an HTML email for a new in-app message notification. */
export function renderNewMessageNotificationHtml(
  data: NewMessageNotificationData,
): string {
  const replyAddress = `replies+${data.threadId}@${data.replyDomain}`;
  const escapedPreview = escapeHtml(data.messagePreview);
  const escapedSender = escapeHtml(data.senderName);
  const escapedTitle = escapeHtml(data.conversationTitle);
  const escapedRecipient = escapeHtml(data.recipientName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New message from ${escapedSender}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #4f46e5; padding: 24px 32px; }
    .header-title { color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
    .header-sub { color: #c7d2fe; font-size: 12px; margin: 4px 0 0; }
    .body { padding: 28px 32px; }
    .greeting { font-size: 15px; color: #3f3f46; margin: 0 0 20px; }
    .message-card { background: #f8fafc; border-left: 3px solid #4f46e5; border-radius: 4px; padding: 16px 20px; margin: 0 0 20px; }
    .message-sender { font-size: 13px; font-weight: 600; color: #18181b; margin: 0 0 6px; }
    .message-preview { font-size: 14px; color: #52525b; margin: 0; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    .cta { text-align: center; margin: 24px 0; }
    .cta-button { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 6px; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    .reply-info { font-size: 13px; color: #71717a; line-height: 1.6; }
    .reply-info strong { color: #3f3f46; }
    .reply-address { font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace; font-size: 12px; background: #f4f4f5; padding: 4px 8px; border-radius: 4px; word-break: break-all; }
    .footer { background: #fafafa; border-top: 1px solid #e4e4e7; padding: 16px 32px; font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="header-title">Procurement Communication</p>
      <p class="header-sub">${escapedTitle}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi ${escapedRecipient},</p>
      <p class="greeting">You have a new message from <strong>${escapedSender}</strong>:</p>

      <div class="message-card">
        <p class="message-sender">${escapedSender}</p>
        <p class="message-preview">${escapedPreview}</p>
      </div>

      <div class="cta">
        <a href="${data.conversationUrl}" class="cta-button">Open Conversation</a>
      </div>

      <hr class="divider" />

      <div class="reply-info">
        <strong>Reply by email:</strong> You can reply directly to this email
        to send a message in the conversation — no need to open the app.<br /><br />
        Your reply will be sent from: <span class="reply-address">${replyAddress}</span>
      </div>
    </div>

    <div class="footer">
      This is a procurement communication notification sent by the Pavilion system.<br />
      Do not forward this email to parties not participating in this conversation.
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
