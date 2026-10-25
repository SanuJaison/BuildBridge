import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const COLORS = ["167,139,250", "125,211,252", "94,234,212", "196,181,253"];
const ORBIT_COUNT = 34;
const FIELD_RADIUS = 340;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let orbiters = [];
    let initialized = false;
    const cores = navigator.hardwareConcurrency || 8;
    const density = cores <= 4 ? 22000 : 16000;
    const pointer = {
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      active: false,
      lastMove: 0,
    };

    const random = (min, max) => min + Math.random() * (max - min);

    const makeParticle = () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        px: x,
        py: y,
        vx: random(-0.16, 0.16),
        vy: random(-0.16, 0.16),
        size: random(0.7, 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: random(0.1, 0.32),
      };
    };

    const makeOrbiter = () => ({
      radius: random(46, 214),
      angle: Math.random() * Math.PI * 2,
      speed: random(0.11, 0.42) * (Math.random() > 0.5 ? 1 : -1),
      squash: random(0.48, 0.8),
      size: random(0.7, 1.9),
      phase: Math.random() * Math.PI * 2,
      wobble: random(0.4, 1.6),
    });

    const reset = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(118, Math.max(48, Math.round((width * height) / density)));
      particles = Array.from({ length: count }, makeParticle);
      orbiters = Array.from({ length: ORBIT_COUNT }, makeOrbiter);
      initialized = true;
    };

    reset();

    let glowShown = false;
    let glowX = null;
    let glowY = null;

    const showGlow = () => {
      if (glowShown) return;
      glowShown = true;
      gsap.to(glow, { autoAlpha: 0.85, duration: 0.65, ease: "power2.out" });
    };

    const onPointerMove = (event) => {
      const now = performance.now();
      if (pointer.active) {
        pointer.vx = event.clientX - pointer.x;
        pointer.vy = event.clientY - pointer.y;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      pointer.lastMove = now;

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
      const ratio = Math.min(2.4, gsap.ticker.deltaRatio(60));
      const seconds = time;
      const idle = Math.min(1, Math.max(0, 1 - (performance.now() - pointer.lastMove) / 1600));
      const activity = pointer.active ? idle : 0;
      const scroll = window.scrollY * 0.018;

      ctx.clearRect(0, 0, width, height);

      const spacing = width < 900 ? 48 : 44;
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const influenced = [];

      ctx.fillStyle = "rgba(148,163,184,0.055)";
      for (let row = 0; row < rows; row += 1) {
        const baseY = row * spacing - ((scroll + seconds * 4) % spacing);
        for (let col = 0; col < cols; col += 1) {
          const baseX = col * spacing;
          let x = baseX + Math.sin(baseY * 0.007 + seconds * 0.3) * 2.2;
          let y = baseY + Math.cos(baseX * 0.006 - seconds * 0.24) * 2.2;
          let influence = 0;
          if (activity > 0.01) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 210) {
              influence = (1 - distance / 210) * activity;
              const force = influence * influence * 34;
              const direction = distance || 1;
              x += (dx / direction) * force;
              y += (dy / direction) * force;
            }
          }
          ctx.fillRect(x, y, 1.15, 1.15);
          if (influence > 0.12) influenced.push([x, y, influence]);
        }
      }

      if (influenced.length) {
        ctx.fillStyle = "rgba(196,181,253,0.36)";
        influenced.forEach(([x, y, influence]) => {
          ctx.beginPath();
          ctx.arc(x, y, 0.8 + influence * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.globalCompositeOperation = "lighter";

      for (const particle of particles) {
        const fieldAngle =
          Math.sin(particle.y * 0.0031 + seconds * 0.22) * 1.8 +
          Math.cos(particle.x * 0.0038 - seconds * 0.17) * 1.5;
        let ax = Math.cos(fieldAngle) * 0.02;
        let ay = Math.sin(fieldAngle) * 0.02;

        if (activity > 0.01) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < FIELD_RADIUS) {
            const force = (1 - distance / FIELD_RADIUS) * activity;
            const direction = distance || 1;
            ax += (-dy / direction) * force * 0.28 - (dx / direction) * force * 0.1;
            ay += (dx / direction) * force * 0.28 - (dy / direction) * force * 0.1;
          }
        }

        particle.vx = particle.vx * 0.95 + ax * ratio;
        particle.vy = particle.vy * 0.95 + ay * ratio;
        const velocity = Math.hypot(particle.vx, particle.vy);
        if (velocity > 1.4) {
          const clamp = 1.4 / velocity;
          particle.vx *= clamp;
          particle.vy *= clamp;
        }
        particle.px = particle.x;
        particle.py = particle.y;
        particle.x += particle.vx * 8 * ratio;
        particle.y += particle.vy * 8 * ratio;

        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        if (particle.y < -30) particle.y = height + 30;
        if (particle.y > height + 30) particle.y = -30;

        ctx.strokeStyle = `rgba(${particle.color},${particle.alpha})`;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.px, particle.py);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      }

      if (activity > 0.01) {
        const rotation = -0.5 + Math.max(-0.4, Math.min(0.4, pointer.vx * 0.0015));
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        for (let index = 0; index < orbiters.length; index += 1) {
          const orbiter = orbiters[index];
          const angle = orbiter.angle + seconds * orbiter.speed;
          const radius = orbiter.radius + Math.sin(seconds * orbiter.wobble + orbiter.phase) * 9;
          const localX = Math.cos(angle) * radius;
          const localY = Math.sin(angle) * radius * orbiter.squash;
          const x = pointer.x + localX * cos - localY * sin;
          const y = pointer.y + localX * sin + localY * cos;
          const pulse = 0.5 + Math.sin(seconds * 1.6 + orbiter.phase) * 0.5;
          const alpha = activity * (0.05 + (1 - index / orbiters.length) * 0.2) * (0.55 + pulse * 0.45);
          ctx.fillStyle = `rgba(${index % 3 === 0 ? COLORS[2] : COLORS[0]},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, orbiter.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };

    gsap.ticker.add(render);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
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
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      gsap.killTweensOf(glow);
    };
  }, [enabled]);

  return (
    <div aria-hidden="true" className="ambient-shell">
      <div className="ambient-bg" />
      {enabled ? <canvas ref={canvasRef} className="ambient-canvas" /> : null}
      {enabled ? <div ref={glowRef} className="ambient-glow" /> : null}
    </div>
  );
}
