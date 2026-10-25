import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, [data-cursor]";
const TRAIL = [
  { size: 20, opacity: 0.14, duration: 0.24 },
  { size: 16, opacity: 0.2, duration: 0.3 },
  { size: 13, opacity: 0.26, duration: 0.36 },
  { size: 11, opacity: 0.32, duration: 0.43 },
  { size: 9, opacity: 0.38, duration: 0.5 },
  { size: 7, opacity: 0.46, duration: 0.57 },
  { size: 6, opacity: 0.54, duration: 0.64 },
];

export default function CustomCursor() {
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return fine && !reduced;
  });
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const auraRef = useRef(null);
  const trailRef = useRef(null);
  const trailDots = useRef([]);
  const labelRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const aura = auraRef.current;
    const trail = trailRef.current;
    const label = labelRef.current;
    const pulse = pulseRef.current;
    if (!dot || !ring || !aura || !trail || !label || !pulse) return undefined;

    const dots = trailDots.current.filter(Boolean);
    const movable = [dot, ring, aura, label, pulse, ...dots];
    const xTo = movable.map((element, index) => {
      const base = index === 0 ? 0.08 : index === 1 ? 0.18 : index === 2 ? 0.5 : index === 3 ? 0.32 : index === 4 ? 0.16 : TRAIL[index - 5].duration;
      return gsap.quickTo(element, "x", { duration: base, ease: "power3.out" });
    });
    const yTo = movable.map((element, index) => {
      const base = index === 0 ? 0.08 : index === 1 ? 0.18 : index === 2 ? 0.5 : index === 3 ? 0.32 : index === 4 ? 0.16 : TRAIL[index - 5].duration;
      return gsap.quickTo(element, "y", { duration: base, ease: "power3.out" });
    });

    gsap.set([dot, ring, aura, label, pulse, trail], { autoAlpha: 0 });
    gsap.set(ring, { xPercent: -50, yPercent: -50, scale: 1 });
    gsap.set([dot, aura, pulse, ...dots], { xPercent: -50, yPercent: -50 });

    let visible = false;
    let pointerLabel = "";
    let labelWidth = 0;
    let stateKey = "";
    let active = false;

    const show = () => {
      if (visible) return;
      visible = true;
      document.documentElement.classList.add("has-custom-cursor");
      gsap.to([dot, ring, aura, trail], { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
    };

    const hide = () => {
      visible = false;
      gsap.to([dot, ring, aura, trail, label, pulse], { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    };

    const setState = (target) => {
      const labelled = target.closest?.("[data-cursor-label]");
      const text = labelled?.getAttribute("data-cursor-label");
      const interactive = Boolean(target.closest?.(INTERACTIVE));
      const key = text ? `label:${text}` : interactive ? "interactive" : "default";
      if (key === stateKey) return;
      stateKey = key;

      if (text) {
        pointerLabel = text;
        label.textContent = text;
        labelWidth = label.offsetWidth || 140;
        gsap.to(ring, {
          scale: 1.75,
          borderColor: "rgba(196,181,253,0.9)",
          backgroundColor: "rgba(139,92,246,0.12)",
          duration: 0.35,
          overwrite: "auto",
        });
        gsap.to(dot, { scale: 0, duration: 0.2, overwrite: "auto" });
        gsap.to(label, { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
        return;
      }

      pointerLabel = "";
      labelWidth = 0;
      gsap.to(label, { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
      gsap.to(ring, {
        scale: interactive ? 1.35 : 1,
        borderColor: interactive ? "rgba(255,255,255,0.72)" : "rgba(196,181,253,0.7)",
        backgroundColor: interactive ? "rgba(255,255,255,0.055)" : "rgba(139,92,246,0.035)",
        duration: 0.3,
        overwrite: "auto",
      });
      gsap.to(dot, { scale: interactive ? 0.7 : 1, duration: 0.22, overwrite: "auto" });
    };

    const move = (event) => {
      if (!active) {
        active = true;
        show();
      }
      const { clientX, clientY } = event;
      const offsetX = pointerLabel ? (clientX + 26 + labelWidth > window.innerWidth - 12 ? -labelWidth - 26 : 26) : 22;
      xTo[0](clientX);
      yTo[0](clientY);
      xTo[1](clientX);
      yTo[1](clientY);
      xTo[2](clientX);
      yTo[2](clientY);
      xTo[4](clientX);
      yTo[4](clientY);
      xTo[3](clientX + offsetX);
      yTo[3](clientY + 20);
      dots.forEach((_, index) => {
        xTo[index + 5](clientX);
        yTo[index + 5](clientY);
      });
      setState(event.target);
    };

    const down = () => {
      gsap.to(ring, { scale: 0.82, duration: 0.16, overwrite: "auto" });
      gsap.fromTo(
        pulse,
        { scale: 0.5, autoAlpha: 0.65 },
        { scale: 2.1, autoAlpha: 0, duration: 0.6, ease: "power2.out", overwrite: true }
      );
    };

    const up = (event) => {
      stateKey = "";
      setState(event.target);
    };

    const leave = () => {
      active = false;
      hide();
      document.documentElement.classList.remove("has-custom-cursor");
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("mouseleave", leave);
    window.addEventListener("blur", hide);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      window.removeEventListener("blur", hide);
      gsap.killTweensOf([dot, ring, aura, trail, label, pulse, ...dots]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[500] overflow-hidden">
      <span ref={auraRef} className="cursor-aura" />
      <span ref={trailRef}>
        {TRAIL.map((item, index) => (
          <span
            key={item.size}
            ref={(element) => {
              trailDots.current[index] = element;
            }}
            className="cursor-trail-dot"
            style={{ width: item.size, height: item.size, opacity: item.opacity }}
          />
        ))}
      </span>
      <span ref={ringRef} className="cursor-ring" />
      <span ref={pulseRef} className="cursor-pulse" />
      <span ref={dotRef} className="cursor-dot" />
      <span ref={labelRef} className="cursor-label" />
    </div>
  );
}
