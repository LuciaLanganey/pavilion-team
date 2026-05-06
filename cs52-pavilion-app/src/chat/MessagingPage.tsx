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
} from "./hooks";
import { useExportPdf } from "./ExportPdfButton";
import "./chat.css";

const DEMO_USER_EMAIL = "alice@example.com";

type ConversationListItem = {
  _id: Id<"conversations">;
  displayName: string;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  isGroup: boolean;
  title?: string;
};

type MessageListItem = {
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

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user, size = 28 }: { user: MemberUser | null | undefined; size?: number }) {
  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="chat-avatar"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="chat-avatar chat-avatar--initials"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={user?.name}
    >
      {initials}
    </div>
  );
}

// ── Conversation sidebar ──────────────────────────────────────────────────────

function ConversationSidebar({
  currentUserId,
  activeConversationId,
  onSelect,
}: {
  currentUserId: Id<"users">;
  activeConversationId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
}) {
  const conversations = useConversations(currentUserId);

  if (conversations === undefined) {
    return <div className="chat-sidebar">Loading conversations...</div>;
  }
  if (conversations.length === 0) {
    return <div className="chat-sidebar">No conversations yet.</div>;
  }

  return (
    <div className="chat-sidebar">
      {conversations.map((conv: ConversationListItem) => (
        <button
          key={conv._id}
          type="button"
          className={`chat-conv-item ${activeConversationId === conv._id ? "chat-conv-item--active" : ""}`}
          onClick={() => onSelect(conv._id)}
        >
          <span className="chat-conv-name">{conv.displayName}</span>
          {conv.lastMessagePreview && (
            <span className="chat-conv-preview">{conv.lastMessagePreview}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Notification settings modal ───────────────────────────────────────────────

type NotificationPrefs = {
  emailEnabled: boolean;
  notifyFor: "all" | "mentions";
};

function NotificationSettingsModal({ onClose }: { onClose: () => void }) {
  // TODO: persist prefs to backend (add a notificationPrefs table to Convex schema,
  // keyed by userId + conversationId). Currently local state only.
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailEnabled: true,
    notifyFor: "all",
  });

  const handleSave = () => {
    // TODO: call a Convex mutation here once the backend table exists
    console.log("Notification prefs saved (local only):", prefs);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
        style={{
          background: "var(--bg, #fff)",
          border: "1px solid var(--border, #e5e7eb)",
          borderRadius: 12,
          padding: 24,
          width: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="notif-modal-title"
          style={{
            margin: "0 0 16px",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-h, #111)",
          }}
        >
          Notification Settings
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={prefs.emailEnabled}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, emailEnabled: e.target.checked }))
              }
            />
            <span style={{ fontSize: 14, color: "var(--text-h, #111)" }}>
              Email notifications
            </span>
          </label>

          {prefs.emailEnabled && (
            <div style={{ marginLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="notifyFor"
                  checked={prefs.notifyFor === "all"}
                  onChange={() => setPrefs((p) => ({ ...p, notifyFor: "all" }))}
                />
                <span style={{ fontSize: 13, color: "var(--text, #374151)" }}>All messages</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="notifyFor"
                  checked={prefs.notifyFor === "mentions"}
                  onChange={() => setPrefs((p) => ({ ...p, notifyFor: "mentions" }))}
                />
                <span style={{ fontSize: 13, color: "var(--text, #374151)" }}>Mentions only</span>
              </label>
            </div>
          )}

          <p style={{ fontSize: 12, color: "var(--text, #374151)", opacity: 0.7, margin: 0 }}>
            Replies sent to your conversation email address sync automatically.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border, #e5e7eb)",
              background: "transparent",
              color: "var(--text-h, #111)",
              cursor: "pointer",
              font: "inherit",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "2px solid var(--accent-border, #6366f1)",
              background: "var(--accent-bg, #eef2ff)",
              color: "var(--text-h, #111)",
              cursor: "pointer",
              font: "inherit",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Thread action menu (⋯ button) ─────────────────────────────────────────────

function ThreadMenu({
  conversationId,
  conversationTitle,
  onCollapseToMain,
}: {
  conversationId: Id<"conversations">;
  conversationTitle: string | undefined;
  onCollapseToMain: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { handleExport, isLoading, exporting, error, clearError } = useExportPdf(
    conversationId,
    conversationTitle,
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="chat-menu" ref={menuRef}>
      <button
        type="button"
        className="chat-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        title="Chat options"
        aria-label="Chat options"
        aria-expanded={open}
      >
        ⋯
      </button>

      {open && (
        <div className="chat-menu-dropdown" role="menu">
          <button
            type="button"
            className="chat-menu-item"
            role="menuitem"
            onClick={() => {
              handleExport();
              setOpen(false);
            }}
            disabled={isLoading || exporting}
          >
            <span className="chat-menu-item-icon">📄</span>
            {exporting ? "Generating PDF…" : isLoading ? "Loading…" : "Export PDF"}
          </button>

          <button
            type="button"
            className="chat-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setNotifOpen(true);
            }}
          >
            <span className="chat-menu-item-icon">🔔</span>
            Notification Settings
          </button>

          <button
            type="button"
            className="chat-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCollapseToMain();
            }}
          >
            <span className="chat-menu-item-icon">↙</span>
            Collapse to Main Page
          </button>
        </div>
      )}

      {error && (
        <div className="chat-menu-error">
          {error}
          <button type="button" onClick={clearError} className="chat-menu-error-dismiss">✕</button>
        </div>
      )}

      {notifOpen && <NotificationSettingsModal onClose={() => setNotifOpen(false)} />}
    </div>
  );
}

// ── Shared message list ───────────────────────────────────────────────────────

function MessageList({
  messages,
  currentUserId,
  memberMap,
  currentUser,
}: {
  messages: MessageListItem[];
  currentUserId: Id<"users">;
  memberMap: Map<string, MemberUser>;
  currentUser: MemberUser | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-messages-list">
        <p className="chat-empty">No messages yet. Say hello!</p>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="chat-messages-list">
      {messages.map((msg: MessageListItem) => {
        const isSent = msg.senderId === currentUserId;
        const sender = isSent ? currentUser : memberMap.get(msg.senderId as string);
        return (
          <div
            key={msg._id}
            className={`chat-bubble-row ${isSent ? "chat-bubble-row--sent" : "chat-bubble-row--received"}`}
          >
            {!isSent && <Avatar user={sender} size={28} />}
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
            {isSent && <Avatar user={sender} size={28} />}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Shared composer ───────────────────────────────────────────────────────────

function Composer({
  inputValue,
  onChange,
  onSend,
}: {
  inputValue: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-composer">
      <textarea
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message… (Enter to send)"
        rows={2}
      />
      <button type="button" onClick={onSend} disabled={!inputValue.trim()}>
        Send
      </button>
    </div>
  );
}

// ── Small floating chat box ───────────────────────────────────────────────────

function SmallChatBox({
  conversationId,
  currentUserId,
  conversationTitle,
  messages,
  members,
  onExpand,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  conversationTitle: string | undefined;
  messages: MessageListItem[];
  members: Member[] | undefined;
  onExpand: () => void;
}) {
  const sendMessage = useSendMessage();
  const [inputValue, setInputValue] = useState("");

  // Draggable state — start bottom-right
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: window.innerHeight - 460 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 340, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 440, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const memberMap = new Map<string, MemberUser>(
    (members ?? [])
      .filter((m) => m.user)
      .map((m) => [m.userId as string, m.user as MemberUser]),
  );

  const otherMember = (members ?? []).find((m) => m.userId !== currentUserId);
  const otherUser = otherMember?.user ?? undefined;
  const currentUser = memberMap.get(currentUserId as string);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue("");
    try {
      await sendMessage({ conversationId, senderId: currentUserId, content, contentType: "text" });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputValue(content);
    }
  };

  return (
    <div
      className="chat-small-box"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Draggable header */}
      <div
        className="chat-small-header"
        onMouseDown={(e) => {
          dragging.current = true;
          dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
          e.preventDefault();
        }}
      >
        <Avatar user={otherUser} size={26} />
        <span className="chat-small-title">{conversationTitle ?? otherUser?.name ?? "Chat"}</span>
        <button
          type="button"
          className="chat-small-expand"
          onClick={onExpand}
          title="Expand to full chat"
          aria-label="Expand to full chat"
        >
          ⤢
        </button>
      </div>

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        memberMap={memberMap}
        currentUser={currentUser}
      />

      <Composer inputValue={inputValue} onChange={setInputValue} onSend={() => void handleSend()} />
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────────────────────

function ChatThread({
  conversationId,
  currentUserId,
  onCollapseToMain,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  onCollapseToMain: (convId: Id<"conversations">) => void;
}) {
  const messages = useMessages(conversationId);
  const members = useConversationMembers(conversationId);
  const conversation = useQuery(api.functions.conversations.queries.getConversation, {
    conversationId,
  });
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    markRead({
      conversationId,
      userId: currentUserId,
      lastReadMessageId: lastMessage._id,
    }).catch(console.error);
  }, [conversationId, messages?.length, currentUserId, markRead]);

  const memberMap = new Map<string, MemberUser>(
    (members ?? [])
      .filter((m) => m.user)
      .map((m) => [m.userId as string, m.user as MemberUser]),
  );
  const currentUser = memberMap.get(currentUserId as string);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue("");
    try {
      await sendMessage({ conversationId, senderId: currentUserId, content, contentType: "text" });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputValue(content);
    }
  };

  if (messages === undefined) {
    return <div className="chat-thread">Loading messages...</div>;
  }

  return (
    <div className="chat-thread">
      <div className="chat-thread-header">
        <span className="chat-thread-title">
          {conversation?.title ?? "Conversation"}
        </span>
        <ThreadMenu
          conversationId={conversationId}
          conversationTitle={conversation?.title}
          onCollapseToMain={() => onCollapseToMain(conversationId)}
        />
      </div>

      <MessageList
        messages={messages as MessageListItem[]}
        currentUserId={currentUserId}
        memberMap={memberMap}
        currentUser={currentUser}
      />

      <Composer inputValue={inputValue} onChange={setInputValue} onSend={() => void handleSend()} />
    </div>
  );
}

// ── Messaging page ────────────────────────────────────────────────────────────

export default function MessagingPage({
  onCollapseToMain,
}: {
  onCollapseToMain?: (convId: Id<"conversations">) => void;
}) {
  const [activeConversationId, setActiveConversationId] =
    useState<Id<"conversations"> | null>(null);

  const demoUser = useQuery(api.functions.users.queries.getUserByEmail, {
    email: DEMO_USER_EMAIL,
  });

  if (demoUser === undefined) {
    return (
      <div className="chat-page chat-page--centered">
        <p>Loading chat…</p>
      </div>
    );
  }

  if (demoUser === null) {
    return (
      <div className="chat-page chat-page--centered chat-page--notice">
        <p>
          No demo user found. From the <code>cs52-pavilion-app</code> directory, run Convex dev and
          seed the database:
        </p>
        <pre className="chat-code-block">
          npx convex dev{"\n"}npx convex run seed:seedDemoData
        </pre>
        <p>
          This loads <strong>{DEMO_USER_EMAIL}</strong> as the signed-in user for the chat UI.
        </p>
      </div>
    );
  }

  const currentUserId = demoUser._id;

  return (
    <div className="chat-messaging-layout">
      <ConversationSidebar
        currentUserId={currentUserId}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
      />

      <main className="chat-main">
        {activeConversationId ? (
          <ChatThread
            conversationId={activeConversationId}
            currentUserId={currentUserId}
            onCollapseToMain={onCollapseToMain ?? (() => {})}
          />
        ) : (
          <div className="chat-empty chat-empty--main">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
