import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { compactNumber } from "../../lib/format";

gsap.registerPlugin(ScrollTrigger, SplitText);

const REVEAL_VARIANTS = {
  up: { y: 28, x: 0, scale: 1 },
  left: { y: 0, x: -32, scale: 1 },
  right: { y: 0, x: 32, scale: 1 },
  scale: { y: 12, x: 0, scale: 0.95 },
};

export default function MotionSystem() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const root = document.querySelector("[data-motion-scope]") || document.querySelector("main");
    if (!root) return undefined;

    const scope = root.dataset.motionScope || "app";
    const rich = scope === "public";
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const html = document.documentElement;
    const all = (selector) => Array.from(root.querySelectorAll(selector));
    const created = [];
    const triggers = [];
    const splits = [];
    const cleanups = [];
    let cancelled = false;
    let bindTimer = 0;
    const animatedMedia = new Set();
    const iconShapes = new Map();

    html.classList.add("motion-ready");

    const track = (animation) => {
      if (!animation) return animation;
      created.push(animation);
      if (animation.scrollTrigger) triggers.push(animation.scrollTrigger);
      return animation;
    };

    const splitHeading = (element, timeline, position = 0) => {
      const split = new SplitText(element, {
        type: "words",
        wordsClass: "split-word",
        aria: "auto",
      });
      splits.push(split);
      timeline.from(
        split.words,
        {
          yPercent: 115,
          opacity: 0,
          rotate: 1.5,
          duration: 0.82,
          ease: "power4.out",
          stagger: 0.038,
          clearProps: "transform,opacity",
        },
        position
      );
      return split;
    };

    const pageEnter = all("[data-page-enter]").filter((element) => !element.matches("h1, h2"));
    if (pageEnter.length) {
      track(
        gsap.fromTo(
          pageEnter,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.055,
            delay: 0.05,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          }
        )
      );
    }

    const bind = () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger && !trigger.trigger.isConnected) trigger.kill();
      });

      all("[data-motion-header]").forEach((header) => {
        if (header.dataset.motionHeaderBound) return;
        header.dataset.motionHeaderBound = "true";
        const heading = header.querySelector("[data-split]");
        const eyebrow = header.querySelector(".eyebrow");
        const copy = header.querySelector("[data-motion-header-copy]");
        const action = header.querySelector("[data-motion-header-action]");
        if (!heading && !eyebrow && !copy && !action) return;

        const timeline = gsap.timeline({
          scrollTrigger: { trigger: header, start: "top 88%", once: true },
        });
        if (timeline.scrollTrigger) triggers.push(timeline.scrollTrigger);
        if (eyebrow) timeline.from(eyebrow, { opacity: 0, y: 12, duration: 0.5, ease: "power2.out" }, 0);
        if (heading) splitHeading(heading, timeline, 0.06);
        if (copy) timeline.from(copy, { opacity: 0, y: 14, duration: 0.6, ease: "power2.out" }, 0.38);
        if (action) timeline.from(action, { opacity: 0, y: 12, duration: 0.5, ease: "power2.out" }, 0.46);
        created.push(timeline);
      });

      all("[data-split]")
        .filter((element) => !element.closest("[data-motion-header]") && !element.dataset.splitBound)
        .forEach((element) => {
          element.dataset.splitBound = "true";
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          });
          if (timeline.scrollTrigger) triggers.push(timeline.scrollTrigger);
          splitHeading(element, timeline);
          created.push(timeline);
        });

      all("h1, h2")
        .filter(
          (element) =>
            !element.closest("[data-split]") &&
            !element.closest("[data-motion-header]") &&
            !element.closest("[data-reveal]") &&
            !element.closest("[data-motion-skip]") &&
            !element.closest("article") &&
            !element.dataset.headingBound &&
            element.textContent.trim()
        )
        .forEach((element) => {
          element.dataset.headingBound = "true";
          const tween = gsap.fromTo(
            element,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: element, start: "top 92%", once: true },
            }
          );
          track(tween);
        });

      all("[data-reveal]")
        .filter((element) => !element.dataset.revealBound)
        .forEach((element) => {
          element.dataset.revealBound = "true";
          const variant = REVEAL_VARIANTS[element.dataset.reveal] || REVEAL_VARIANTS.up;
          const delay = Number(element.dataset.revealDelay || 0);
          const tween = gsap.fromTo(
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
              scrollTrigger: { trigger: element, start: "top 91%", once: true },
              onComplete: () => {
                element.dataset.revealDone = "true";
                gsap.set(element, { clearProps: "transform,opacity" });
              },
            }
          );
          track(tween);
        });

      all("[data-motion-list]")
        .filter((element) => !element.dataset.motionListBound)
        .forEach((list) => {
          const items = Array.from(list.children).filter((child) => !child.closest("[data-no-motion]"));
          if (!items.length) return;
          list.dataset.motionListBound = "true";
          gsap.set(items, { opacity: 0, y: 30, scale: 0.985 });
          const tween = gsap.to(items, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: { trigger: list, start: "top 92%", once: true },
            onComplete: () => gsap.set(items, { clearProps: "transform,opacity" }),
          });
          track(tween);
        });

      const cardSet = new Set(all("article, [data-card]"));
      const cardNodes = Array.from(cardSet).filter((element) => !element.closest("[data-no-motion]"));
      const freshCards = cardNodes.filter((element) => !element.dataset.motionCardBound);

      freshCards.forEach((element) => {
        element.dataset.motionCardBound = "true";
        gsap.set(element, { opacity: 0, y: 46, scale: 0.97 });

        const media = Array.from(element.querySelectorAll("img")).filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width >= 140 && rect.height >= 72;
        });
        if (media.length) {
          gsap.set(media, { scale: 1.12, transformOrigin: "50% 50%" });
          media.forEach((image) => animatedMedia.add(image));
        }

        const icon = element.querySelector("svg.lucide");
        if (!icon) return;
        const shapes = Array.from(icon.querySelectorAll("path, circle, ellipse, line, polyline, polygon")).filter((shape) => {
          const stroke = shape.getAttribute("stroke") || getComputedStyle(shape).stroke;
          if (!stroke || stroke === "none") return false;
          const fill = getComputedStyle(shape).fill;
          return !fill || fill === "none" || fill.startsWith("rgba(0, 0, 0, 0");
        });
        let prepared = false;
        shapes.forEach((shape) => {
          try {
            const length = shape.getTotalLength();
            if (!Number.isFinite(length) || length <= 0) return;
            gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
            prepared = true;
          } catch {
            // Non-path SVG elements can fail; skip them.
          }
        });
        if (prepared) iconShapes.set(element, shapes);
      });

      if (freshCards.length) {
        const batches = ScrollTrigger.batch(freshCards, {
          start: "top 92%",
          once: true,
          interval: 0.08,
          batchMax: 8,
          onEnter: (batch) => {
            const tween = gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.95,
              stagger: 0.07,
              ease: "power4.out",
              overwrite: "auto",
              onComplete: () => {
                batch.forEach((element) => {
                  element.dataset.motionRevealed = "true";
                  gsap.set(element, { clearProps: "transform,opacity" });
                  const shapes = iconShapes.get(element);
                  if (!shapes) return;
                  iconShapes.delete(element);
                  const iconTween = gsap.to(shapes, {
                    strokeDashoffset: 0,
                    duration: 0.8,
                    stagger: 0.04,
                    ease: "power2.out",
                    onComplete: () => gsap.set(shapes, { clearProps: "strokeDasharray,strokeDashoffset" }),
                  });
                  created.push(iconTween);
                });
              },
            });

            const batchMedia = batch.flatMap((element) =>
              Array.from(element.querySelectorAll("img")).filter((image) => animatedMedia.has(image))
            );
            if (batchMedia.length) {
              const mediaTween = gsap.to(batchMedia, {
                scale: 1,
                duration: 1.25,
                stagger: 0.05,
                ease: "power3.out",
                onComplete: () => gsap.set(batchMedia, { clearProps: "transform" }),
              });
              created.push(mediaTween);
            }

            created.push(tween);
          },
        });
        triggers.push(...batches);
      }

      if (canHover) {
        freshCards.forEach((card) => {
          if (card.dataset.tiltBound || card.dataset.cardTiltBound) return;
          card.dataset.cardTiltBound = "true";
          card.classList.add("motion-card");
          gsap.set(card, { transformPerspective: 1000 });
          const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.55, ease: "power3.out" });
          const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.55, ease: "power3.out" });
          let rect = null;
          const enter = () => {
            rect = card.getBoundingClientRect();
          };
          const move = (event) => {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            card.style.setProperty("--spot-x", `${Math.round(px * 100)}%`);
            card.style.setProperty("--spot-y", `${Math.round(py * 100)}%`);
            rotateX(-(py - 0.5) * 3);
            rotateY((px - 0.5) * 3);
          };
          const leave = () => {
            rect = null;
            rotateX(0);
            rotateY(0);
          };
          card.addEventListener("pointerenter", enter, { passive: true });
          card.addEventListener("pointermove", move, { passive: true });
          card.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          });
        });
      }

      all("[data-tilt]")
        .filter((element) => !element.dataset.tiltBound)
        .forEach((element) => {
          element.dataset.tiltBound = "true";
          const max = Number(element.dataset.tilt) || 5;
          gsap.set(element, { transformPerspective: 1100, transformStyle: "preserve-3d" });
          const rotateX = gsap.quickTo(element, "rotationX", { duration: 0.5, ease: "power3.out" });
          const rotateY = gsap.quickTo(element, "rotationY", { duration: 0.5, ease: "power3.out" });
          let rect = null;
          const enter = () => {
            rect = element.getBoundingClientRect();
          };
          const move = (event) => {
            if (!rect) rect = element.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            rotateX(-py * max);
            rotateY(px * max);
          };
          const leave = () => {
            rect = null;
            rotateX(0);
            rotateY(0);
          };
          element.addEventListener("pointerenter", enter, { passive: true });
          element.addEventListener("pointermove", move, { passive: true });
          element.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          });
        });

      const magnetCandidates = new Set([...all("[data-magnetic]"), ...(rich ? all(".btn-primary, .btn-light") : [])]);
      Array.from(magnetCandidates)
        .filter((element) => !element.dataset.magneticBound)
        .forEach((element) => {
          element.dataset.magneticBound = "true";
          const strength = Number(element.dataset.magnetic) || 0.16;
          const moveX = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" });
          const moveY = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });
          let rect = null;
          const enter = () => {
            rect = element.getBoundingClientRect();
          };
          const move = (event) => {
            if (!rect) rect = element.getBoundingClientRect();
            moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
            moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
          };
          const leave = () => {
            rect = null;
            moveX(0);
            moveY(0);
          };
          element.addEventListener("pointerenter", enter, { passive: true });
          element.addEventListener("pointermove", move, { passive: true });
          element.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          });
        });

      all("[data-svg-draw]")
        .filter((element) => !element.dataset.svgDrawBound)
        .forEach((host) => {
          host.dataset.svgDrawBound = "true";
          const selector = "path, circle, ellipse, line, polyline, polygon";
          const shapes = host.matches(selector) ? [host] : Array.from(host.querySelectorAll(selector));
          const drawable = shapes.filter((shape) => {
            if (shape.dataset.svgDrawn) return false;
            const stroke = shape.getAttribute("stroke") || getComputedStyle(shape).stroke;
            return stroke && stroke !== "none";
          });
          if (!drawable.length) return;
          drawable.forEach((shape) => {
            shape.dataset.svgDrawn = "true";
            try {
              const length = shape.getTotalLength();
              gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
            } catch {
              shape.dataset.svgDrawn = "skip";
            }
          });
          const ready = drawable.filter((shape) => shape.dataset.svgDrawn === "true");
          if (!ready.length) return;
          const tween = gsap.to(ready, {
            strokeDashoffset: 0,
            duration: 1.7,
            stagger: 0.12,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: host.closest("[data-svg-trigger]") || host,
              start: "top 92%",
              once: true,
            },
          });
          track(tween);
        });

      all("[data-parallax]")
        .filter((element) => !element.dataset.parallaxBound)
        .forEach((element) => {
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
              invalidateOnRefresh: true,
            },
          });
          track(tween);
        });

      all("[data-scroll-words]")
        .filter((element) => !element.closest("[data-no-motion]") && !element.dataset.scrollWordsBound)
        .forEach((element) => {
          element.dataset.scrollWordsBound = "true";
          const split = new SplitText(element, {
            type: "words",
            wordsClass: "scroll-word",
            aria: "auto",
          });
          splits.push(split);
          const tween = gsap.fromTo(
            split.words,
            { opacity: 0.16, yPercent: 26 },
            {
              opacity: 1,
              yPercent: 0,
              stagger: 0.055,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                end: "bottom 58%",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            }
          );
          track(tween);
        });

      all("[data-scroll-rotate]")
        .filter((element) => !element.dataset.scrollRotateBound)
        .forEach((element) => {
          element.dataset.scrollRotateBound = "true";
          const strength = Number(element.dataset.scrollRotate) || 6;
          const tween = gsap.fromTo(
            element,
            { rotation: -strength },
            {
              rotation: strength,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("section") || element,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            }
          );
          track(tween);
        });

      all("[data-scroll-line]")
        .filter((element) => !element.dataset.scrollLineBound)
        .forEach((element) => {
          element.dataset.scrollLineBound = "true";
          gsap.set(element, { scaleY: 0, transformOrigin: "top center" });
          const tween = gsap.to(element, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element.closest("section") || element,
              start: "top 72%",
              end: "bottom 58%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          track(tween);
        });

      all("[data-count]")
        .filter((element) => !element.dataset.countBound)
        .forEach((element) => {
          const target = Number(element.dataset.count);
          if (!Number.isFinite(target)) return;
          element.dataset.countBound = "true";
          element.dataset.countOriginal = element.textContent;
          const compact = element.dataset.countFormat !== "raw";
          const state = { value: 0 };
          const render = () => {
            element.textContent = compact ? compactNumber(state.value) : Math.round(state.value).toLocaleString();
          };
          render();
          const tween = gsap.to(state, {
            value: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: { trigger: element, start: "top 95%", once: true },
          });
          track(tween);
        });

      if (rich) {
        const collectAutoBlocks = (element, depth, output) => {
          if (!element || depth > 5) return;
          if (element.closest("[data-no-motion]")) return;
          if (element.dataset.autoBound) return;
          if (
            element.matches(
              "article, [data-card], [data-motion-header], [data-motion-list], [data-reveal], [data-split], [data-page-enter], [data-auto-skip]"
            )
          ) {
            return;
          }
          if (element.querySelector("[data-motion-header], [data-motion-list], [data-reveal]")) return;
          if (element.tagName === "SCRIPT" || element.tagName === "STYLE") return;
          const style = getComputedStyle(element);
          if (style.position === "sticky" || style.display === "none") return;
          const rect = element.getBoundingClientRect();
          if (rect.height < 8 || rect.width < 8) return;
          const isGrid =
            element.classList.contains("grid") ||
            (typeof element.className === "string" && element.className.includes("grid-cols"));
          const hasCards = Boolean(element.querySelector("article, [data-card]"));
          if ((hasCards || (isGrid && element.children.length > 1)) && depth < 4) {
            Array.from(element.children).forEach((child) => collectAutoBlocks(child, depth + 1, output));
            return;
          }
          const meaningful =
            element.textContent.trim().length > 0 ||
            Boolean(element.querySelector("img, video, svg, canvas, form, input, textarea, select, button, a"));
          if (meaningful) output.push(element);
        };

        const autoBlocks = [];
        all(".container-page").forEach((container) => {
          if (container.dataset.autoBound) return;
          if (container.closest("[data-no-motion]")) return;
          const section = container.closest("section");
          if (section && section.querySelector("h1")) return;
          container.dataset.autoBound = "true";
          Array.from(container.children).forEach((child) => collectAutoBlocks(child, 0, autoBlocks));
        });

        const freshAuto = autoBlocks.filter((element) => !element.dataset.autoBound);
        freshAuto.forEach((element) => {
          element.dataset.autoBound = "true";
          gsap.set(element, { opacity: 0, y: 34 });
        });

        if (freshAuto.length) {
          const autoBatches = ScrollTrigger.batch(freshAuto, {
            start: "top 93%",
            once: true,
            interval: 0.09,
            batchMax: 10,
            onEnter: (batch) => {
              const tween = gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.06,
                ease: "power3.out",
                overwrite: "auto",
                onComplete: () => {
                  batch.forEach((element) => {
                    element.dataset.autoDone = "true";
                    gsap.set(element, { clearProps: "transform,opacity" });
                  });
                },
              });
              created.push(tween);
            },
          });
          triggers.push(...autoBatches);
        }
      }

      ScrollTrigger.refresh();
    };

    bind();

    const refresh = () => {
      if (cancelled) return;
      ScrollTrigger.refresh();
    };
    const frame = window.requestAnimationFrame(refresh);
    const settle = window.setTimeout(refresh, 380);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    const observer = new MutationObserver(() => {
      window.clearTimeout(bindTimer);
      bindTimer = window.setTimeout(() => {
        if (cancelled) return;
        bind();
      }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const cleanup = () => {
      cancelled = true;
      window.clearTimeout(bindTimer);
      window.clearTimeout(settle);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("beforeunload", cleanup);
      observer.disconnect();
      cleanups.forEach((fn) => fn());
      created.forEach((animation) => animation.kill());
      triggers.forEach((trigger) => trigger.kill());
      splits.forEach((split) => split.revert());

      root
        .querySelectorAll(
          "[data-reveal-bound],[data-reveal-done],[data-motion-header-bound],[data-split-bound],[data-heading-bound]," +
            "[data-motion-card-bound],[data-motion-revealed],[data-card-tilt-bound],[data-tilt-bound],[data-magnetic-bound]," +
            "[data-svg-draw-bound],[data-svg-drawn]," +
            "[data-parallax-bound],[data-scroll-line-bound],[data-count-bound],[data-scroll-words-bound]," +
            "[data-scroll-rotate-bound],[data-auto-bound],[data-auto-done]"
        )
        .forEach((element) => {
          gsap.set(element, {
            clearProps: "opacity,visibility,transform,strokeDasharray,strokeDashoffset",
          });
          const { dataset } = element;
          delete dataset.revealBound;
          delete dataset.revealDone;
          delete dataset.motionHeaderBound;
          delete dataset.splitBound;
          delete dataset.headingBound;
          delete dataset.motionCardBound;
          delete dataset.motionRevealed;
          delete dataset.cardTiltBound;
          delete dataset.tiltBound;
          delete dataset.magneticBound;
          delete dataset.svgDrawBound;
          delete dataset.svgDrawn;
          delete dataset.parallaxBound;
          delete dataset.scrollLineBound;
          delete dataset.countBound;
          delete dataset.scrollWordsBound;
          delete dataset.scrollRotateBound;
          delete dataset.autoBound;
          delete dataset.autoDone;
        });

      iconShapes.forEach((shapes) => gsap.set(shapes, { clearProps: "strokeDasharray,strokeDashoffset" }));
      iconShapes.clear();
      gsap.set(Array.from(animatedMedia), { clearProps: "transform" });
      animatedMedia.clear();

      root.querySelectorAll("[data-count]").forEach((element) => {
        if (element.dataset.countOriginal !== undefined) element.textContent = element.dataset.countOriginal;
        delete element.dataset.countOriginal;
      });

      root.querySelectorAll("[data-motion-list-bound]").forEach((list) => {
        Array.from(list.children).forEach((child) => gsap.set(child, { clearProps: "opacity,transform" }));
        delete list.dataset.motionListBound;
      });

      html.classList.remove("motion-ready");
    };

    window.addEventListener("beforeunload", cleanup, { once: true });

    return cleanup;
  }, [pathname]);

  return null;
}
