import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
if (configuredApiBase) {
  const normalized = configuredApiBase
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
  setBaseUrl(normalized);
} else {
  setBaseUrl(window.location.origin);
}
setAuthTokenGetter(() => {
  try {
    return localStorage.getItem("admin_token");
  } catch {
    return null;
  }
});

type ThemeMode = "dark" | "light" | "smart";
const THEME_MODE_KEY = "gt_theme_mode";

function getThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_MODE_KEY);
    if (raw === "dark" || raw === "light" || raw === "smart") return raw;
  } catch {
    // ignore
  }
  return "smart";
}

function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("gt-theme-mode"));
}

function applyTheme() {
  const mode = getThemeMode();
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
    return;
  }
  if (mode === "light") {
    document.documentElement.classList.remove("dark");
    return;
  }

  const hour = new Date().getHours();
  const isEvening = hour >= 18 || hour < 7;

  if (isEvening) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

applyTheme();

// Allow UI to switch modes.
(window as any).setThemeMode = setThemeMode;
(window as any).getThemeMode = getThemeMode;

// Re-evaluate periodically so the theme flips automatically at the right time.
setInterval(applyTheme, 5 * 60 * 1000);
window.addEventListener("visibilitychange", applyTheme);
window.addEventListener("gt-theme-mode", applyTheme);

createRoot(document.getElementById("root")!).render(<App />);
