import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
setBaseUrl(base);

function applyTheme() {
  const hour = new Date().getHours();
  const isEvening = hour >= 18 || hour < 7;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isEvening || prefersDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

applyTheme();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

createRoot(document.getElementById("root")!).render(<App />);
