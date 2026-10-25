import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AmbientField from "../components/motion/AmbientField";

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen bg-ink-950">
      <AmbientField />
      <div className="relative z-10 flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" data-motion-scope="public" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
