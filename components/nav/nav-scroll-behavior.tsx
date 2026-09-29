"use client";

import { useEffect } from "react";

// Hide the sticky header on scroll down, show it again on scroll up (all screen sizes).
// Any scrolling also collapses open dropdown menus. They stay closed until the pointer moves
// again, leaves the header, or keyboard focus enters it.
export function NavScrollBehavior() {
  useEffect(() => {
    const nav = document.getElementById("nav-outer");
    if (!nav) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.style.transition = reduceMotion ? "none" : "transform 250ms ease, box-shadow 250ms ease";

    const THRESHOLD = 8; // ignore tiny scroll jitters (px)
    const MOVE_TO_REOPEN = 6; // pointer travel (px) that reopens menus after a scroll
    let lastY = window.scrollY;
    let ticking = false;

    // --- Dropdown suppression -------------------------------------------------------------
    const panels = () => nav.querySelectorAll<HTMLElement>("[data-nav-dropdown]");
    let suppressed = false;
    let pointer = { x: 0, y: 0 };
    let anchor = { x: 0, y: 0 };

    const suppress = () => {
      if (suppressed) return;
      suppressed = true;
      anchor = pointer;
      panels().forEach((panel) => {
        panel.style.visibility = "hidden";
        panel.style.opacity = "0";
      });
    };
    const release = () => {
      if (!suppressed) return;
      suppressed = false;
      panels().forEach((panel) => {
        panel.style.visibility = "";
        panel.style.opacity = "";
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (suppressed && Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y) > MOVE_TO_REOPEN) {
        release();
      }
    };

    // --- Hide on scroll down, show on scroll up -------------------------------------------
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;

      nav.classList.toggle("shadow-sm", y > 0);

      if (y <= nav.offsetHeight) {
        nav.style.transform = ""; // near the top: always visible
        lastY = y;
        return;
      }
      if (Math.abs(delta) < THRESHOLD) return;

      nav.style.transform = delta > 0 ? "translateY(-100%)" : "";
      lastY = y;
    };

    const onScroll = () => {
      suppress();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    nav.addEventListener("pointermove", onPointerMove);
    nav.addEventListener("pointerleave", release);
    nav.addEventListener("focusin", release);
    return () => {
      window.removeEventListener("scroll", onScroll);
      nav.removeEventListener("pointermove", onPointerMove);
      nav.removeEventListener("pointerleave", release);
      nav.removeEventListener("focusin", release);
      release();
      nav.style.transform = "";
      nav.style.transition = "";
      nav.classList.remove("shadow-sm");
    };
  }, []);

  return null;
}
