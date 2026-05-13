import type { Id } from "../../convex/_generated/dataModel";
import { useListAllUsers } from "../chat/hooks";

type User = {
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

function UserAvatar({ user, size = 56 }: { user: User; size?: number }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          flexShrink: 0,
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
        background: avatarColor(user.name),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials(user.name)}
    </div>
  );
}

function RoleBadge({ role }: { role: "vendor" | "buyer" }) {
  const isVendor = role === "vendor";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: isVendor ? "#eef2ff" : "#ecfdf5",
        color: isVendor ? "#4f46e5" : "#059669",
        border: `1px solid ${isVendor ? "#c7d2fe" : "#a7f3d0"}`,
      }}
    >
      {isVendor ? "🏭" : "🛒"} {role}
    </span>
  );
}

function UserCard({ user, onSelect }: { user: User; onSelect: (u: User) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "28px 20px 22px",
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: 16,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.12s",
        textAlign: "center",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "#6366f1";
        el.style.boxShadow = "0 4px 24px rgba(99,102,241,0.13)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "#e5e7eb";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      <UserAvatar user={user} size={64} />

      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{user.name}</span>
        {user.username && (
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
            @{user.username}
          </span>
        )}
        <span style={{ fontSize: 12, color: "#d1d5db", marginTop: 2 }}>{user.email}</span>
      </div>

      {user.userRole ? (
        <RoleBadge role={user.userRole} />
      ) : (
        <span
          style={{
            fontSize: 11,
            color: "#d1d5db",
            fontStyle: "italic",
          }}
        >
          no role set
        </span>
      )}

      <div
        style={{
          marginTop: 4,
          padding: "8px 20px",
          borderRadius: 8,
          background: "#6366f1",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          width: "100%",
        }}
      >
        Continue as {user.name.split(" ")[0]}
      </div>
    </button>
  );
}

export default function LandingPage({ onSelectUser }: { onSelectUser: (user: User) => void }) {
  const users = useListAllUsers();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "60px 24px 80px",
        fontFamily: "inherit",
      }}
    >
      {/* Logo / brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.5px" }}>
          Pavilion
        </span>
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 480 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 12px",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          Who are you today?
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
          Select your account to access your conversations and marketplace activity.
        </p>
      </div>

      {/* User grid */}
      {users === undefined ? (
        <div style={{ color: "#9ca3af", fontSize: 15 }}>Loading users…</div>
      ) : users.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "32px 40px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
            maxWidth: 400,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>No users found</p>
          <p style={{ margin: 0 }}>
            Run <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
              npx convex run seed:seedDemoData
            </code>{" "}
            then{" "}
            <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
              npx convex run seed:seedExtraUsers
            </code>{" "}
            to populate the database.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {(users as User[]).map((user) => (
            <UserCard key={user._id} user={user} onSelect={onSelectUser} />
          ))}
        </div>
      )}
    </div>
  );
}
