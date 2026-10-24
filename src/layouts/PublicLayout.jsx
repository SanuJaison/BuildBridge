import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
