import { useState } from "react";
import VendorDetailPage from "./components/VendorDetailPage";
import MessagingPage from "./chat/MessagingPage";

function App() {
  const [screen, setScreen] = useState<"vendor" | "chat">("vendor");

  if (screen === "chat") {
    return (
      <div className="app-chat-screen">
        <header className="app-chat-header">
          <button type="button" className="app-back-button" onClick={() => setScreen("vendor")}>
            ← Back to vendor
          </button>
        </header>
        <MessagingPage />
      </div>
    );
  }

  return <VendorDetailPage onOpenChat={() => setScreen("chat")} />;
}

export default App;
