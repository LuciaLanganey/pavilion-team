import { useState } from "react";
import VendorDetailPage from "./components/VendorDetailPage";
import MessagingPage from "./chat/MessagingPage";
import FloatingChatWidget from "./components/FloatingChatWidget";
import LandingPage from "./components/LandingPage";
import type { Id } from "../convex/_generated/dataModel";

type SelectedUser = {
  _id: Id<"users">;
  name: string;
  email: string;
  avatarUrl?: string;
  username?: string;
  userRole?: "vendor" | "buyer";
};

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#0891b2", "#059669", "#d97706", "#dc2626",
];

function avatarColor(name: string): string {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function UserBadge({
  user,
  onSwitch,
}: {
  user: SelectedUser;
  onSwitch: () => void;
}) {
  const isVendor = user.userRole === "vendor";
  const isBuyer = user.userRole === "buyer";

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 16,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: 12,
        padding: "6px 10px 6px 8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
      }}
    >
      {/* Avatar */}
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: avatarColor(user.name),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials(user.name)}
        </div>
      )}

      {/* Name + role pill */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
          {user.name.split(" ")[0]}
          {user.username && (
            <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 4 }}>
              @{user.username}
            </span>
          )}
        </span>
        {user.userRole && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: isVendor ? "#4f46e5" : isBuyer ? "#059669" : "#6b7280",
            }}
          >
            {isVendor ? "🏭 Vendor" : "🛒 Buyer"}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "#e5e7eb", marginLeft: 2 }} />

      {/* Switch user */}
      <button
        type="button"
        onClick={onSwitch}
        title="Switch user"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "2px 4px",
          borderRadius: 6,
          color: "#9ca3af",
          fontSize: 11,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 3,
          transition: "color 0.12s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6366f1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
      >
        ⇄ Switch
      </button>
    </div>
  );
}

function App() {
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [screen, setScreen] = useState<"vendor" | "chat">("vendor");
  const [widgetConvId, setWidgetConvId] = useState<Id<"conversations"> | null>(null);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const handleSelectUser = (user: SelectedUser) => {
    setSelectedUser(user);
    setScreen("vendor");
    setWidgetConvId(null);
    setChatWidgetOpen(false);
  };

  const handleSwitchUser = () => {
    setSelectedUser(null);
    setScreen("vendor");
    setWidgetConvId(null);
    setChatWidgetOpen(false);
  };

  const handleCollapseToMain = (convId: Id<"conversations">) => {
    setWidgetConvId(convId);
    setChatWidgetOpen(true);
    setScreen("vendor");
  };

  if (!selectedUser) {
    return <LandingPage onSelectUser={handleSelectUser} />;
  }

  if (screen === "chat") {
    return (
      <div className="app-chat-screen">
        <header className="app-chat-header">
          <button
            type="button"
            className="app-back-button"
            onClick={() => setScreen("vendor")}
          >
            ← Back to vendor
          </button>
        </header>
        <UserBadge user={selectedUser} onSwitch={handleSwitchUser} />
        <MessagingPage
          onCollapseToMain={handleCollapseToMain}
          currentUserId={selectedUser._id}
        />
      </div>
    );
  }

  return (
    <>
      <VendorDetailPage onOpenChat={() => setScreen("chat")} />
      <UserBadge user={selectedUser} onSwitch={handleSwitchUser} />
      <FloatingChatWidget
        isOpen={chatWidgetOpen}
        onToggle={() => setChatWidgetOpen((o) => !o)}
        onOpenFullChat={() => {
          setChatWidgetOpen(false);
          setScreen("chat");
        }}
        initialConvId={widgetConvId}
        currentUserId={selectedUser._id}
      />
    </>
  );
}

export default App;
