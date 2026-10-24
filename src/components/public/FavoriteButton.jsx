import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function FavoriteButton({ providerId, initialSaved = false, className = "" }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await api.delete(`/favorites/${providerId}`);
        setSaved(false);
        toast.info("Removed from saved talent");
      } else {
        await api.post(`/favorites/${providerId}`);
        setSaved(true);
        toast.success("Saved", "You can find this provider in your favorites.");
      }
      window.dispatchEvent(new CustomEvent("bb:favorites-changed"));
    } catch (error) {
      toast.error("Could not update favorites", getApiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={saved}
      className={`relative z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
        saved
          ? "border-brand-300/40 bg-brand-500/25 text-brand-100"
          : "border-white/15 bg-ink-950/50 text-slate-300 hover:border-white/30 hover:text-white"
      } ${className}`}
    >
      <Bookmark size={15} className={saved ? "fill-current" : ""} />
    </button>
  );
}
