import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
const app = <App isConvexConfigured={Boolean(convex)} />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {convex ? <ConvexProvider client={convex}>{app}</ConvexProvider> : app}
  </StrictMode>,
);
