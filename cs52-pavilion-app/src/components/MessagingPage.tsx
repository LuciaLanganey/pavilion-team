/**
 * src/components/MessagingPage.tsx
 * ─────────────────────────────────
 * Example messaging page that demonstrates how to use the Convex hooks.
 * This is a REFERENCE COMPONENT — wire it into your real UI as needed.
 *
 * It shows:
 *   - useConversations() for the sidebar list
 *   - useMessages() for the live chat thread
 *   - useSendMessage() for the composer
 *   - useMarkRead() called when opening a conversation
 *
 * 📌 FRONTEND DEV NOTE:
 *   The PLACEHOLDER_USER_ID below must be replaced with your real current
 *   user ID once auth is implemented. At that point, the backend hooks
 *   will no longer need userId passed explicitly.
 */

import React, { useState, useEffect, useRef } from "react";
import { Id } from "../../cs52-pavilion-app/_generated/dataModel";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkRead,
} from "../convex/hooks";

// ⚠️  PLACEHOLDER: Replace with real current user ID from your auth context.
// Example with Clerk: const { user } = useUser(); // then look up Convex user by tokenIdentifier
const PLACEHOLDER_USER_ID = "your_user_id_here" as Id<"users">;

// ─── Sidebar: Conversation List ───────────────────────────────────────────────

function ConversationSidebar({
  activeConversationId,
  onSelect,
}: {
  activeConversationId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
}) {
  // `conversations` is undefined while loading, an array when ready.
  // Convex keeps it live — any new message or conversation update
  // will cause this component to re-render automatically.
  const conversations = useConversations(PLACEHOLDER_USER_ID);

  if (conversations === undefined) {
    return <div className="sidebar">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <div className="sidebar">No conversations yet.</div>;
  }

  return (
    <div className="sidebar">
      {conversations.map((conv) => (
        <button
          key={conv._id}
          className={`conv-item ${activeConversationId === conv._id ? "active" : ""}`}
          onClick={() => onSelect(conv._id)}
        >
          <span className="conv-name">{conv.displayName}</span>
          {conv.lastMessagePreview && (
            <span className="conv-preview">{conv.lastMessagePreview}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────

function ChatThread({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark conversation as read when it's opened and messages are loaded
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    markRead({
      conversationId,
      userId: PLACEHOLDER_USER_ID,
      lastReadMessageId: lastMessage._id,
    }).catch(console.error);
  }, [conversationId, messages?.length]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue(""); // optimistic clear

    try {
      await sendMessage({
        conversationId,
        senderId: PLACEHOLDER_USER_ID, // ⚠️  PLACEHOLDER: derive from auth
        content,
        contentType: "text",
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputValue(content); // restore input on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (messages === undefined) {
    return <div className="chat-thread">Loading messages...</div>;
  }

  return (
    <div className="chat-thread">
      <div className="messages-list">
        {messages.length === 0 && (
          <p className="empty-state">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-bubble ${
              msg.senderId === PLACEHOLDER_USER_ID ? "sent" : "received"
            } ${msg.isDeleted ? "deleted" : ""}`}
          >
            {msg.isDeleted ? (
              <em>This message was deleted.</em>
            ) : (
              <span>{msg.content}</span>
            )}
            {msg.editedAt && <small> (edited)</small>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="composer">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Enter to send)"
          rows={2}
        />
        <button onClick={handleSend} disabled={!inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Root MessagingPage ───────────────────────────────────────────────────────

export default function MessagingPage() {
  const [activeConversationId, setActiveConversationId] =
    useState<Id<"conversations"> | null>(null);

  return (
    <div className="messaging-layout">
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
      />

      <main className="chat-area">
        {activeConversationId ? (
          <ChatThread conversationId={activeConversationId} />
        ) : (
          <div className="empty-state">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
