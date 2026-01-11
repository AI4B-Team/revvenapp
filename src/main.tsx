import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");

const showFatal = (title: string, err?: unknown) => {
  if (!rootEl) return;
  const message = err instanceof Error ? err.message : String(err ?? "");
  rootEl.innerHTML = `
    <div style="font-family: ui-sans-serif, system-ui; padding: 24px;">
      <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${title}</h1>
      <pre style="white-space: pre-wrap; margin: 0;">${message}</pre>
    </div>
  `;
};

window.addEventListener("error", (e) => {
  // If React already mounted, let the in-app ErrorBoundary handle it.
  if (!rootEl || rootEl.childElementCount > 0) return;
  showFatal("App failed to load", (e as ErrorEvent).error ?? (e as ErrorEvent).message);
});

window.addEventListener("unhandledrejection", (e) => {
  if (!rootEl || rootEl.childElementCount > 0) return;
  showFatal("App failed to load", (e as PromiseRejectionEvent).reason);
});

if (!rootEl) {
  throw new Error("Root element #root not found");
}

try {
  createRoot(rootEl).render(<App />);
} catch (e) {
  showFatal("App failed to start", e);
  throw e;
}
