"use client";

import { useEffect, useState } from "react";

// Show the button once the reader is this far down the page (0 to 1).
const SHOW_AT = 0.4;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollable > 0 && window.scrollY / scrollable >= SHOW_AT);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      aria-hidden={!visible}
      className={`fixed right-6 bottom-6 z-40 flex items-center gap-1 border bg-background px-3 py-2 text-xs transition-opacity duration-200 hover:bg-muted ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      Back to top <span aria-hidden>↑</span>
    </button>
  );
}
