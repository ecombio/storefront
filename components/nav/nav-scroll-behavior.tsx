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

    // Reveal is slower and eases out (gentle landing). Hide is a bit quicker.
    const SHOW_TRANSITION =
      "transform 550ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease";
    const HIDE_TRANSITION =
      "transform 300ms cubic-bezier(0.4, 0, 1, 1), box-shadow 300ms ease";

    const setTransition = (value: string) => {
      nav.style.transition = reduceMotion ? "none" : value;
    };
    setTransition(SHOW_TRANSITION);

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
        setTransition(SHOW_TRANSITION);
        nav.style.transform = ""; // near the top: always visible
        lastY = y;
        return;
      }
      if (Math.abs(delta) < THRESHOLD) return;

      if (delta > 0) {
        setTransition(HIDE_TRANSITION);
        nav.style.transform = "translateY(-100%)";
      } else {
        setTransition(SHOW_TRANSITION);
        nav.style.transform = "";
      }
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