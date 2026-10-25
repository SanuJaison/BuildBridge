import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[210] h-[2px] bg-white/[0.03]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-300 shadow-[0_0_18px_rgba(167,139,250,0.65)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
