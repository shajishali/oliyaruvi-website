import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/router";
import { LocaleProvider } from "./lib/locale";
import "./styles/tokens.css";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");

createRoot(root).render(
  <StrictMode>
    <LocaleProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </LocaleProvider>
  </StrictMode>,
);
