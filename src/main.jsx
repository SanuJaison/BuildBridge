import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ScrollToTop from "./components/shared/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { ToastProvider } from "./contexts/ToastContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <BrandingProvider>
            <AuthProvider>
              <ScrollToTop />
              <App />
            </AuthProvider>
          </BrandingProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
