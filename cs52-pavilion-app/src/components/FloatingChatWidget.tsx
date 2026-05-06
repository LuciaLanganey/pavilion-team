import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  useConversations,
  useConversationMembers,
  useMessages,
  useSendMessage,
  useMarkRead,
} from "../chat/hooks";
import "../chat/chat.css";

const DEMO_USER_EMAIL = "alice@example.com";

// ── Types ──────────────────────────────────────────────────────────────────────

type ConversationItem = {
  _id: Id<"conversations">;
  displayName: string;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  isGroup: boolean;
  title?: string;
};

type MessageItem = {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  contentType: "text" | "image" | "file" | "system";
  createdAt: number;
  editedAt?: number;
  isDeleted: boolean;
  source?: "app" | "email";
};

type MemberUser = {
  _id: Id<"users">;
  name: string;
  email: string;
  avatarUrl?: string;
};

type Member = {
  userId: Id<"users">;
  role: "admin" | "member";
  user: MemberUser | null;
};

// ── Avatar helpers ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#0891b2", "#059669", "#d97706", "#dc2626",
];

function avatarColor(name: string | undefined): string {
  if (!name) return "#6b7280";
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name: string | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({
  user,
  size = 32,
}: {
  user: MemberUser | null | undefined;
  size?: number;
}) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(user?.name),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
      title={user?.name ?? "Unknown"}
      aria-label={user?.name ?? "User avatar"}
    >
      {initials(user?.name)}
    </div>
  );
}

// Initial-only avatar (no Convex query needed — just a name string)
function InitialsAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(name),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}

// ── Collapsed chat button ──────────────────────────────────────────────────────

function CollapsedChatButton({
  latestConv,
  unreadCount,
  onClick,
}: {
  latestConv: ConversationItem | undefined;
  unreadCount: number;
  onClick: () => void;
}) {
  const label = latestConv?.displayName ?? "Messages";
  const preview = latestConv?.lastMessagePreview ?? "Open chat";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        border: "none",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.08)",
        padding: "10px 16px 10px 12px",
        cursor: "pointer",
        outline: "none",
        transition: "box-shadow 0.2s",
        maxWidth: 280,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 8px 32px rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.08)";
      }}
    >
      {/* Avatar with unread badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <InitialsAvatar name={label} size={40} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#6366f1",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* Name + preview */}
      <div style={{ textAlign: "left", minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 140,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 140,
          }}
        >
          {preview}
        </div>
      </div>

      {/* Chat icon bubble */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "#6366f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginLeft: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    </button>
  );
}

// ── Message thread (inside the floating panel) ─────────────────────────────────

function MessageThread({
  conversationId,
  currentUserId,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}) {
  const messages = useMessages(conversationId);
  const members = useConversationMembers(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const memberMap = new Map<string, MemberUser>(
    (members ?? [])
      .filter((m) => m.user)
      .map((m) => [m.userId as string, m.user as MemberUser]),
  );
  const currentUser = memberMap.get(currentUserId as string);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    markRead({
      conversationId,
      userId: currentUserId,
      lastReadMessageId: last._id,
    }).catch(console.error);
  }, [conversationId, messages?.length, currentUserId, markRead]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue("");
    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        content,
        contentType: "text",
      });
    } catch (err) {
      console.error("Failed to send:", err);
      setInputValue(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (messages === undefined) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Scrollable message list */}
      <div
        className="chat-messages-list"
        style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}
        tabIndex={0}
        aria-label="Message history"
      >
        {(messages as MessageItem[]).length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, margin: "24px 0" }}>
            No messages yet. Say hello!
          </p>
        ) : (
          (messages as MessageItem[]).map((msg) => {
            const isSent = msg.senderId === currentUserId;
            const sender = isSent
              ? currentUser
              : memberMap.get(msg.senderId as string);
            return (
              <div
                key={msg._id}
                className={`chat-bubble-row ${isSent ? "chat-bubble-row--sent" : "chat-bubble-row--received"}`}
              >
                {!isSent && <Avatar user={sender} size={24} />}
                <div
                  className={`chat-bubble ${isSent ? "chat-bubble--sent" : "chat-bubble--received"} ${msg.isDeleted ? "chat-bubble--deleted" : ""}`}
                >
                  {msg.isDeleted ? (
                    <em>This message was deleted.</em>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                  {msg.source === "email" && (
                    <small className="chat-bubble-source"> · via email</small>
                  )}
                  {msg.editedAt && <small> (edited)</small>}
                </div>
                {isSent && <Avatar user={sender} size={24} />}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          borderTop: "1px solid #f3f4f6",
          padding: "10px 12px",
          flexShrink: 0,
          background: "#fff",
        }}
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send)"
          rows={2}
          aria-label="Message input"
          style={{
            flex: 1,
            resize: "none",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "inherit",
            color: "#111827",
            outline: "none",
            minHeight: 40,
            maxHeight: 100,
            lineHeight: 1.45,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#a5b4fc";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!inputValue.trim()}
          aria-label="Send message"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: inputValue.trim() ? "#6366f1" : "#e5e7eb",
            color: inputValue.trim() ? "#fff" : "#9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Active conversation header info ───────────────────────────────────────────

function ActiveConvHeader({
  conversationId,
  currentUserId,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}) {
  const members = useConversationMembers(conversationId);
  const otherMember = (members as Member[] | undefined)?.find(
    (m) => m.userId !== currentUserId,
  );
  const otherUser = otherMember?.user ?? undefined;

  return (
    <>
      {otherUser && <Avatar user={otherUser as MemberUser} size={28} />}
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 600,
          color: "#111827",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {otherUser?.name ?? "Chat"}
      </span>
    </>
  );
}

// ── Floating chat panel ────────────────────────────────────────────────────────

function FloatingChatPanel({
  currentUserId,
  conversations,
  activeConvId,
  onSelectConv,
  onMinimize,
  onOpenFullChat,
}: {
  currentUserId: Id<"users">;
  conversations: ConversationItem[];
  activeConvId: Id<"conversations"> | null;
  onSelectConv: (id: Id<"conversations"> | null) => void;
  onMinimize: () => void;
  onOpenFullChat: () => void;
}) {
  const [showList, setShowList] = useState(!activeConvId);

  // When a conversation is pre-selected (e.g. collapsed from Messaging Page),
  // jump straight to the thread view.
  useEffect(() => {
    if (activeConvId) {
      setShowList(false);
    }
  }, [activeConvId]);

  const handleSelectConv = (id: Id<"conversations">) => {
    onSelectConv(id);
    setShowList(false);
  };

  const inThread = !showList && activeConvId !== null;

  return (
    <div
      role="dialog"
      aria-label="Chat window"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        width: 380,
        height: 560,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 16,
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 12px 12px 14px",
          borderBottom: "1px solid #f3f4f6",
          flexShrink: 0,
          background: "#fff",
          minHeight: 56,
        }}
      >
        {/* Back arrow — only in thread view */}
        {inThread && (
          <button
            type="button"
            onClick={() => setShowList(true)}
            aria-label="Back to conversations"
            style={iconBtnStyle}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}

        {/* Avatar + title */}
        {inThread && activeConvId ? (
          <ActiveConvHeader
            conversationId={activeConvId}
            currentUserId={currentUserId}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Messages
          </span>
        )}

        {/* Expand to full chat */}
        <button
          type="button"
          onClick={onOpenFullChat}
          title="Open full chat"
          aria-label="Open full chat"
          style={iconBtnStyle}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        {/* Minimize */}
        <button
          type="button"
          onClick={onMinimize}
          title="Minimize"
          aria-label="Minimize chat"
          style={iconBtnStyle}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {showList || activeConvId === null ? (
          /* Conversation list */
          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                  margin: "32px 16px",
                  lineHeight: 1.5,
                }}
              >
                No conversations yet.
                {/* TODO: wire up real user auth so conversations populate */}
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  type="button"
                  onClick={() => handleSelectConv(conv._id)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background:
                      conv._id === activeConvId ? "#eef2ff" : "transparent",
                    border: "none",
                    borderBottom: "1px solid #f9fafb",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (conv._id !== activeConvId)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      conv._id === activeConvId ? "#eef2ff" : "transparent";
                  }}
                >
                  <InitialsAvatar name={conv.displayName} size={40} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conv.displayName}
                    </div>
                    {conv.lastMessagePreview && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                      >
                        {conv.lastMessagePreview}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Active message thread */
          <MessageThread
            conversationId={activeConvId}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}

// Shared icon button style
const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "none",
  background: "transparent",
  color: "#6b7280",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background 0.12s, color 0.12s",
};

// ── Main FloatingChatWidget export ────────────────────────────────────────────

export default function FloatingChatWidget({
  isOpen,
  onToggle,
  onOpenFullChat,
  initialConvId,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onOpenFullChat: () => void;
  initialConvId?: Id<"conversations"> | null;
}) {
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(
    initialConvId ?? null,
  );

  // When a conversation is collapsed from the Messaging Page, sync it into the widget
  useEffect(() => {
    if (initialConvId) {
      setActiveConvId(initialConvId);
    }
  }, [initialConvId]);

  const demoUser = useQuery(api.functions.users.queries.getUserByEmail, {
    email: DEMO_USER_EMAIL,
  });

  const conversations =
    (useConversations(demoUser?._id) as ConversationItem[] | undefined) ?? [];

  if (demoUser === undefined) return null; // still loading

  if (demoUser === null) {
    // TODO: replace with real auth — no demo user seeded yet
    return null;
  }

  const currentUserId = demoUser._id;
  const latestConv = conversations[0];

  if (isOpen) {
    return (
      <FloatingChatPanel
        currentUserId={currentUserId}
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConv={setActiveConvId}
        onMinimize={onToggle}
        onOpenFullChat={onOpenFullChat}
      />
    );
  }

  return (
    <CollapsedChatButton
      latestConv={latestConv}
      unreadCount={0} // TODO: wire up real unread count from messageReads table
      onClick={onToggle}
    />
  );
}
