import { useState } from "react";
import VendorDetailPage from "./components/VendorDetailPage";
import MessagingPage from "./chat/MessagingPage";
import FloatingChatWidget from "./components/FloatingChatWidget";
import type { Id } from "../convex/_generated/dataModel";

function MissingConvexNotice() {
  return (
    <div className="chat-page chat-page--centered chat-page--notice">
      <p>
        Chat needs Convex before it can load. From <code>cs52-pavilion-app</code>, run:
      </p>
      <pre className="chat-code-block">npx convex dev</pre>
      <p>
        That creates <code>.env.local</code> with <code>VITE_CONVEX_URL</code>. Then refresh this page.
      </p>
    </div>
  );
}

function App({ isConvexConfigured }: { isConvexConfigured: boolean }) {
  const [screen, setScreen] = useState<"vendor" | "chat">("vendor");
  // Conversation to pre-load in the floating widget after "Collapse to main page"
  const [widgetConvId, setWidgetConvId] = useState<Id<"conversations"> | null>(null);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const handleCollapseToMain = (convId: Id<"conversations">) => {
    setWidgetConvId(convId);
    setChatWidgetOpen(true);
    setScreen("vendor");
  };

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
        {isConvexConfigured ? (
          <MessagingPage onCollapseToMain={handleCollapseToMain} />
        ) : (
          <MissingConvexNotice />
        )}
      </div>
    );
  }

  return (
    <>
      <VendorDetailPage onOpenChat={() => setScreen("chat")} />
      {isConvexConfigured && (
        <FloatingChatWidget
          isOpen={chatWidgetOpen}
          onToggle={() => setChatWidgetOpen((o) => !o)}
          onOpenFullChat={() => {
            setChatWidgetOpen(false);
            setScreen("chat");
          }}
          initialConvId={widgetConvId}
        />
      )}
    </>
  );
}

export default App;
