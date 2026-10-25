import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REVEAL_VARIANTS = {
  up: { y: 28, x: 0, scale: 1 },
  left: { y: 0, x: -32, scale: 1 },
  right: { y: 0, x: 32, scale: 1 },
  scale: { y: 12, x: 0, scale: 0.95 },
};

export default function MotionSystem() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    document.documentElement.classList.add("motion-ready");

    const scrollTriggers = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          observer.unobserve(element);
          if (element.dataset.revealDone) return;
          element.dataset.revealDone = "true";
          const variant = REVEAL_VARIANTS[element.dataset.reveal] || REVEAL_VARIANTS.up;
          const delay = Number(element.dataset.revealDelay || 0);
          gsap.fromTo(
            element,
            { opacity: 0, ...variant },
            {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              duration: 0.85,
              delay,
              ease: "power3.out",
              clearProps: "opacity,transform",
              overwrite: true,
            }
          );
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    const tiltCleanups = [];

    const bindInteractions = () => {
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        if (element.dataset.revealBound) return;
        element.dataset.revealBound = "true";
        observer.observe(element);
      });

      document.querySelectorAll("[data-parallax]").forEach((element) => {
        if (element.dataset.parallaxBound) return;
        element.dataset.parallaxBound = "true";
        const strength = Number(element.dataset.parallax) || 0.12;
        const tween = gsap.to(element, {
          yPercent: strength * 100,
          ease: "none",
          scrollTrigger: {
            trigger: element.closest("section") || element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        if (tween.scrollTrigger) scrollTriggers.push(tween.scrollTrigger);
      });

      document.querySelectorAll("[data-tilt]").forEach((element) => {
        if (element.dataset.tiltBound) return;
        element.dataset.tiltBound = "true";
        const max = Number(element.dataset.tilt) || 5;
        gsap.set(element, { transformPerspective: 1100, transformStyle: "preserve-3d" });
        const rotateX = gsap.quickTo(element, "rotationX", { duration: 0.5, ease: "power3.out" });
        const rotateY = gsap.quickTo(element, "rotationY", { duration: 0.5, ease: "power3.out" });
        const onMove = (event) => {
          const rect = element.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          rotateX(-py * max);
          rotateY(px * max);
        };
        const onLeave = () => {
          rotateX(0);
          rotateY(0);
        };
        element.addEventListener("pointermove", onMove, { passive: true });
        element.addEventListener("pointerleave", onLeave);
        tiltCleanups.push(() => {
          element.removeEventListener("pointermove", onMove);
          element.removeEventListener("pointerleave", onLeave);
        });
      });

      document.querySelectorAll("[data-magnetic]").forEach((element) => {
        if (element.dataset.magneticBound) return;
        element.dataset.magneticBound = "true";
        const strength = Number(element.dataset.magnetic) || 0.22;
        const moveX = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" });
        const moveY = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });
        const onMove = (event) => {
          const rect = element.getBoundingClientRect();
          moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
          moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const onLeave = () => {
          moveX(0);
          moveY(0);
        };
        element.addEventListener("pointermove", onMove, { passive: true });
        element.addEventListener("pointerleave", onLeave);
        tiltCleanups.push(() => {
          element.removeEventListener("pointermove", onMove);
          element.removeEventListener("pointerleave", onLeave);
        });
      });
    };

    bindInteractions();

    const mutation = new MutationObserver(() => bindInteractions());
    mutation.observe(document.body, { childList: true, subtree: true });

    const pageEnter = document.querySelectorAll("[data-page-enter]");
    if (pageEnter.length) {
      pageEnter.forEach((element) => {
        element.dataset.pageEnterDone = "true";
      });
      gsap.fromTo(
        pageEnter,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.075,
          ease: "power3.out",
          clearProps: "opacity,transform",
          overwrite: true,
        }
      );
    }

    const refresh = () => ScrollTrigger.refresh();
    const frame = window.requestAnimationFrame(() => {
      refresh();
      window.setTimeout(refresh, 350);
    });
    window.addEventListener("load", refresh);

    return () => {
      mutation.disconnect();
      observer.disconnect();
      scrollTriggers.forEach((trigger) => trigger.kill());
      tiltCleanups.forEach((cleanup) => cleanup());
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      gsap.killTweensOf(pageEnter);
    };
  }, [pathname]);

  return null;
}
