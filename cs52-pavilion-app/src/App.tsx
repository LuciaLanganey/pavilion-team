import { useState } from "react";
import PopupMenu from "./components/popup_menu";
import MessagingPage from "./chat/MessagingPage";
import sampleRep from "./util/sales_rep";

function App() {
  const [screen, setScreen] = useState<"profile" | "chat">("profile");

  if (screen === "chat") {
    return (
      <div className="app-chat-screen">
        <header className="app-chat-header">
          <button type="button" className="app-back-button" onClick={() => setScreen("profile")}>
            ← Back to profile
          </button>
        </header>
        <MessagingPage />
      </div>
    );
  }

  return <PopupMenu {...sampleRep} onOpenChat={() => setScreen("chat")} />;
}

export default App;
