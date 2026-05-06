import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { sendEmail } from "../../lib/email/sendEmail";
import {
  renderNewMessageNotificationHtml,
  renderNewMessageNotificationText,
} from "../../lib/email/templates/newMessageNotification";
import { generateThreadId } from "../../lib/helpers";

/**
 * Sends email notifications to every conversation member except the sender.
 * Scheduled from the sendMessage mutation via ctx.scheduler.runAfter.
 *
 * TODO: Set in Convex dashboard — Project Settings → Environment Variables:
 *   EMAIL_FROM          noreply@procurement.example.com
 *   EMAIL_FROM_NAME     Procurement System
 *   EMAIL_REPLY_DOMAIN  procurement.example.com
 *   APP_BASE_URL        https://app.procurement.example.com
 *   EMAIL_PROVIDER      sendgrid | mailgun | postmark | mock
 */
export const notifyRecipients = internalAction({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    messageContent: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, { conversationId, senderId, messageContent, contentType }) => {
    // Skip notifications for system messages or non-text types
    if (contentType === "system") return;

    const [conversation, members, sender] = await Promise.all([
      ctx.runQuery(api.functions.conversations.queries.getConversation, {
        conversationId,
      }),
      ctx.runQuery(api.functions.conversations.queries.getConversationMembers, {
        conversationId,
      }),
      ctx.runQuery(api.functions.users.queries.getUser, { userId: senderId }),
    ]);

    if (!sender) return;

    const threadId = generateThreadId(conversationId);
    const replyDomain = process.env.EMAIL_REPLY_DOMAIN ?? "example.com";
    const appBaseUrl = process.env.APP_BASE_URL ?? "";
    const emailFrom = process.env.EMAIL_FROM ?? "noreply@example.com";
    const emailFromName = process.env.EMAIL_FROM_NAME ?? "Procurement System";

    const conversationTitle =
      conversation?.title ?? "Procurement Conversation";
    const conversationUrl = appBaseUrl
      ? `${appBaseUrl}/chat#${conversationId}`
      : "";

    const preview =
      messageContent.length > 300
        ? `${messageContent.slice(0, 297)}…`
        : messageContent;

    const recipients = members.filter(
      (m) => m.userId !== senderId && m.user?.email,
    );

    await Promise.all(
      recipients.map(async (member) => {
        const recipientEmail = member.user!.email;
        const recipientName = member.user!.name;

        const subject = `New message from ${sender.name}: ${conversationTitle} [thread:${threadId}]`;
        const replyTo = `replies+${threadId}@${replyDomain}`;

        const notifData = {
          senderName: sender.name,
          recipientName,
          conversationTitle,
          messagePreview: preview,
          conversationUrl,
          threadId,
          replyDomain,
        };

        try {
          await sendEmail({
            from: { email: emailFrom, name: emailFromName },
            to: { email: recipientEmail, name: recipientName },
            subject,
            htmlBody: renderNewMessageNotificationHtml(notifData),
            textBody: renderNewMessageNotificationText(notifData),
            replyTo,
            headers: {
              "X-Thread-ID": threadId,
              "X-Conversation-ID": conversationId,
              // Standard threading headers so email clients group replies correctly
              "X-Procurement-Thread": threadId,
            },
          });
        } catch (err) {
          // Log but don't throw — a notification failure must never break message send
          console.error(
            `[EMAIL] Failed to notify ${recipientEmail} for conversation ${conversationId}:`,
            err,
          );
        }
      }),
    );
  },
});
