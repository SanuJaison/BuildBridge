import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const COLORS = ["167,139,250", "125,211,252", "94,234,212", "196,181,253"];
const SPRITE_SIZE = 64;
const ORBIT_COUNT = 18;
const FIELD_RADIUS = 300;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createSprite(rgb) {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, `rgba(${rgb},0.9)`);
  gradient.addColorStop(0.22, `rgba(${rgb},0.4)`);
  gradient.addColorStop(0.58, `rgba(${rgb},0.1)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
}

export default function AmbientField() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cores = navigator.hardwareConcurrency || 8;
    setEnabled(fine && !prefersReducedMotion() && cores > 2);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas || !glow) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const sprites = COLORS.map(createSprite);
    const cores = navigator.hardwareConcurrency || 8;
    let width = 0;
    let height = 0;
    let motes = [];
    let orbiters = [];
    let initialized = false;
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, active: false, lastMove: 0 };

    const random = (min, max) => min + Math.random() * (max - min);

    const makeMote = () => {
      const depth = random(0.25, 1);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: random(-0.08, 0.08),
        vy: random(-0.08, 0.08),
        radius: 2.5 + depth * depth * 30,
        alpha: 0.07 + depth * 0.17,
        twinkle: random(0.35, 1.35),
        phase: random(0, Math.PI * 2),
        sprite: Math.floor(Math.random() * sprites.length),
      };
    };

    const makeOrbiter = () => ({
      radius: random(42, 190),
      angle: Math.random() * Math.PI * 2,
      speed: random(0.1, 0.4) * (Math.random() > 0.5 ? 1 : -1),
      squash: random(0.5, 0.85),
      size: random(1.4, 4.2),
      phase: random(0, Math.PI * 2),
      wobble: random(0.5, 1.6),
    });

    const reset = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      // Soft bokeh sprites stay smooth at 1x and avoid a high-DPI fill-rate cost.
      const dpr = 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let count = Math.max(30, Math.min(84, Math.round((width * height) / 26000)));
      if (cores <= 4) count = Math.round(count * 0.72);
      motes = Array.from({ length: count }, makeMote).sort((a, b) => b.radius - a.radius);
      orbiters = Array.from({ length: ORBIT_COUNT }, makeOrbiter);
      initialized = true;
    };

    reset();

    let glowShown = false;
    let glowX = null;
    let glowY = null;
    let lastFrame = 0;
    let lastScroll = -1000;

    const onScroll = () => {
      lastScroll = performance.now();
    };

    const showGlow = () => {
      if (glowShown) return;
      glowShown = true;
      gsap.to(glow, { autoAlpha: 0.85, duration: 0.65, ease: "power2.out" });
    };

    const onPointerMove = (event) => {
      if (pointer.active) {
        pointer.vx = event.clientX - pointer.x;
        pointer.vy = event.clientY - pointer.y;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();

      if (!glowX) {
        glowX = gsap.quickTo(glow, "x", { duration: 0.7, ease: "power3.out" });
        glowY = gsap.quickTo(glow, "y", { duration: 0.7, ease: "power3.out" });
      }
      glowX(event.clientX - 280);
      glowY(event.clientY - 280);
      showGlow();
    };

    const onPointerLeave = () => {
      pointer.active = false;
      glowShown = false;
      gsap.to(glow, { autoAlpha: 0, duration: 0.45, ease: "power2.out", overwrite: true });
    };

    const render = (time) => {
      if (!initialized || document.visibilityState === "hidden") return;
      const frameTime = performance.now();
      if (frameTime - lastFrame < 30) return;
      if (frameTime - lastScroll < 220) return;
      lastFrame = frameTime;
      const ratio = Math.min(2.4, gsap.ticker.deltaRatio(60));
      const idle = Math.min(1, Math.max(0, 1 - (performance.now() - pointer.lastMove) / 1600));
      const activity = pointer.active ? idle : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const mote of motes) {
        const angle =
          Math.sin(mote.y * 0.0016 + time * 0.16 + mote.phase) * 1.35 +
          Math.cos(mote.x * 0.0019 - time * 0.12) * 1.1;

        mote.vx = mote.vx * 0.985 + Math.cos(angle) * 0.0045 * ratio;
        mote.vy = mote.vy * 0.985 + Math.sin(angle) * 0.0045 * ratio;

        if (activity > 0.01) {
          const dx = mote.x - pointer.x;
          const dy = mote.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < FIELD_RADIUS) {
            const force = (1 - distance / FIELD_RADIUS) * activity;
            const direction = distance || 1;
            mote.vx += (dx / direction) * force * 0.085 - (dy / direction) * force * 0.06;
            mote.vy += (dy / direction) * force * 0.085 + (dx / direction) * force * 0.06;
          }
        }

        const speed = Math.hypot(mote.vx, mote.vy);
        if (speed > 0.95) {
          const clamp = 0.95 / speed;
          mote.vx *= clamp;
          mote.vy *= clamp;
        }

        mote.x += mote.vx * 11 * ratio;
        mote.y += mote.vy * 11 * ratio;

        if (mote.x < -40) mote.x = width + 40;
        if (mote.x > width + 40) mote.x = -40;
        if (mote.y < -40) mote.y = height + 40;
        if (mote.y > height + 40) mote.y = -40;

        const twinkle = 0.62 + 0.38 * Math.sin(time * mote.twinkle + mote.phase);
        const radius = mote.radius * (1 + activity * 0.08);
        ctx.globalAlpha = mote.alpha * twinkle;
        ctx.drawImage(sprites[mote.sprite], mote.x - radius, mote.y - radius, radius * 2, radius * 2);
      }

      if (activity > 0.01) {
        for (let index = 0; index < orbiters.length; index += 1) {
          const orbiter = orbiters[index];
          const orbitAngle = orbiter.angle + time * orbiter.speed;
          const distance = orbiter.radius + Math.sin(time * orbiter.wobble + orbiter.phase) * 8;
          const x = pointer.x + Math.cos(orbitAngle) * distance;
          const y = pointer.y + Math.sin(orbitAngle) * distance * orbiter.squash;
          const pulse = 0.5 + Math.sin(time * 1.5 + orbiter.phase) * 0.5;
          const radius = orbiter.size * (0.8 + pulse * 0.7);
          ctx.globalAlpha = activity * (0.1 + (1 - index / orbiters.length) * 0.18) * (0.5 + pulse * 0.5);
          ctx.drawImage(sprites[index % 3 === 0 ? 2 : 0], x - radius, y - radius, radius * 2, radius * 2);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    gsap.ticker.add(render);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(reset, 160);
    };
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      gsap.killTweensOf(glow);
    };
  }, [enabled]);

  return (
    <div aria-hidden="true" className="ambient-shell">
      <div className="ambient-bg" />
      <div className="ambient-aurora ambient-aurora-a" />
      <div className="ambient-aurora ambient-aurora-b" />
      <div className="ambient-aurora ambient-aurora-c" />
      {enabled ? <canvas ref={canvasRef} className="ambient-canvas" /> : null}
      {enabled ? <div ref={glowRef} className="ambient-glow" /> : null}
    </div>
  );
}
