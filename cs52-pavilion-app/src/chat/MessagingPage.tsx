import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkRead,
} from "./hooks";
import ExportPdfButton from "./ExportPdfButton";
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

function ChatThread({
  conversationId,
  currentUserId,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}) {
  // All hooks must be called unconditionally before any early return
  const messages = useMessages(conversationId);
  const conversation = useQuery(api.functions.conversations.queries.getConversation, {
    conversationId,
  });
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    markRead({
      conversationId,
      userId: currentUserId,
      lastReadMessageId: lastMessage._id,
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
      console.error("Failed to send message:", err);
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
    return <div className="chat-thread">Loading messages...</div>;
  }

  return (
    <div className="chat-thread">
      {/* Thread header with title and export button */}
      <div className="chat-thread-header">
        <span className="chat-thread-title">
          {conversation?.title ?? "Conversation"}
        </span>
        <ExportPdfButton
          conversationId={conversationId}
          conversationTitle={conversation?.title}
        />
      </div>

      <div className="chat-messages-list">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Say hello!</p>
        )}
        {messages.map((msg: MessageListItem) => (
          <div
            key={msg._id}
            className={`chat-bubble ${msg.senderId === currentUserId ? "chat-bubble--sent" : "chat-bubble--received"} ${msg.isDeleted ? "chat-bubble--deleted" : ""}`}
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
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-composer">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Enter to send)"
          rows={2}
        />
        <button type="button" onClick={() => void handleSend()} disabled={!inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default function MessagingPage() {
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
