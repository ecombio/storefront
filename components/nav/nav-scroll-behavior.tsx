"use client";

import { useEffect } from "react";

// Hide the sticky header on scroll down, show it again on scroll up.
export function NavScrollBehavior() {
  useEffect(() => {
    const nav = document.getElementById("nav-outer");
    if (!nav) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.style.transition = reduceMotion ? "none" : "transform 250ms ease, box-shadow 250ms ease";

    const THRESHOLD = 8; // ignore tiny scroll jitters (px)
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;

      if (y <= nav.offsetHeight) {
        nav.style.transform = ""; // near the top: always visible
        lastY = y;
        return;
      }
      if (Math.abs(delta) < THRESHOLD) return;

      const engaged = nav.matches(":hover") || nav.matches(":focus-within");
      if (delta > 0 && !engaged) {
        nav.style.transform = "translateY(-100%)";
      } else if (delta < 0) {
        nav.style.transform = "";
      }
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      nav.style.transform = "";
      nav.style.transition = "";
    };
  }, []);

  return null;
}
