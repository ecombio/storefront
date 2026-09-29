"use client";

import { type ReactNode, useEffect, useState } from "react";

// Shows once the primary buy buttons have scrolled off the top of the screen.
export function StickyBuyBar({
  targetId,
  title,
  price,
}: {
  targetId: string;
  title: string;
  price: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      setVisible(!!el && el.getBoundingClientRect().bottom < 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  // Reuse the real Add to Cart button so cart logic, validation and the cart drawer stay in one place.
  const handleClick = () => {
    document.querySelector<HTMLButtonElement>(`#${targetId} button:not([type="button"])`)?.click();
  };

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      data-slot="sticky-buy-bar"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <span className="hidden min-w-0 truncate text-lg sm:block">{title}</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium tabular-nums">{price}</span>
          <button
            type="button"
            onClick={handleClick}
            className="h-11 cursor-pointer rounded-full bg-primary px-10 text-xs font-semibold tracking-widest text-primary-foreground uppercase"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
