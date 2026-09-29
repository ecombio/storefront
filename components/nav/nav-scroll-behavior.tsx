"use client";

import { useEffect } from "react";

// Desktop (768px and up): tier 1 scrolls away naturally (the nav is sticky at a negative offset),
// tiers 2 and 3 stay pinned. We only add a shadow once the pinned part sticks.
// Mobile: hide the header on scroll down, show it again on scroll up.
export function NavScrollBehavior() {
  useEffect(() => {
    const nav = document.getElementById("nav-outer");
    if (!nav) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.style.transition = reduceMotion ? "none" : "transform 250ms ease, box-shadow 250ms ease";

    const THRESHOLD = 8; // ignore tiny scroll jitters (px)
    const UTILITY_BAR_HEIGHT = 32; // tier 1 height (h-8); keep in sync with index.tsx
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;

      if (desktop.matches) {
        nav.style.transform = "";
        nav.classList.toggle("shadow-sm", y > UTILITY_BAR_HEIGHT);
        lastY = y;
        return;
      }

      nav.classList.remove("shadow-sm");
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

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", update);
      nav.style.transform = "";
      nav.style.transition = "";
      nav.classList.remove("shadow-sm");
    };
  }, []);

  return null;
}
