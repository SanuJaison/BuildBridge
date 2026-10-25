import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, [data-cursor]";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return undefined;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return undefined;

    document.documentElement.classList.add("has-custom-cursor");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });
    const labelX = gsap.quickTo(label, "x", { duration: 0.32, ease: "power3.out" });
    const labelY = gsap.quickTo(label, "y", { duration: 0.32, ease: "power3.out" });

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25, overwrite: true });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring, label], { autoAlpha: 0, duration: 0.2, overwrite: true });
    };

    const move = (event) => {
      show();
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      labelX(event.clientX + 22);
      labelY(event.clientY + 18);
    };

    const setCursorState = (target) => {
      const interactive = target.closest?.(INTERACTIVE);
      const labelled = target.closest?.("[data-cursor-label]");
      const text = labelled?.getAttribute("data-cursor-label");

      if (text) {
        gsap.to(ring, { scale: 2.35, borderColor: "rgba(196,181,253,0.9)", backgroundColor: "rgba(139,92,246,0.16)", duration: 0.32, overwrite: "auto" });
        gsap.to(dot, { scale: 0, duration: 0.2, overwrite: "auto" });
        label.textContent = text;
        gsap.to(label, { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
        return;
      }

      gsap.to(label, { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
      if (interactive) {
        gsap.to(ring, { scale: 1.55, borderColor: "rgba(255,255,255,0.65)", backgroundColor: "rgba(255,255,255,0.04)", duration: 0.28, overwrite: "auto" });
        gsap.to(dot, { scale: 0.6, duration: 0.2, overwrite: "auto" });
      } else {
        gsap.to(ring, { scale: 1, borderColor: "rgba(167,139,250,0.55)", backgroundColor: "transparent", duration: 0.28, overwrite: "auto" });
        gsap.to(dot, { scale: 1, duration: 0.2, overwrite: "auto" });
      }
    };

    const over = (event) => setCursorState(event.target);
    const down = () => gsap.to(ring, { scale: 0.82, duration: 0.15, overwrite: "auto" });
    const up = (event) => setCursorState(event.target);
    const leave = () => hide();
    const enter = () => show();

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      gsap.killTweensOf([dot, ring, label]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300]">
      <span
        ref={ringRef}
        className="fixed left-0 top-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0"
        style={{ borderColor: "rgba(167,139,250,0.55)" }}
      />
      <span
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300 opacity-0 shadow-[0_0_12px_rgba(167,139,250,0.9)]"
      />
      <span
        ref={labelRef}
        className="fixed left-0 top-0 rounded-full border border-white/15 bg-ink-950/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur"
      />
    </div>
  );
}
