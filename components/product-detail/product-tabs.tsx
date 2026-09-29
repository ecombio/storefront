"use client";

import { type ReactNode, useState } from "react";

export type ProductTab = { id: string; label: string; content: ReactNode };

// The bar sticks below the site header. Change top-16 to match your header height.
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  if (tabs.length === 0) return null;
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section className="grid gap-5" data-slot="product-tabs">
      <div
        className="sticky top-[var(--header-offset,0px)] z-20 border-b border-border bg-background"
        style={{ transition: "var(--header-offset-transition, none)" }}
      >
        <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={tab.id === current.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 py-3 text-sm font-semibold whitespace-nowrap ${
                tab.id === current.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
        {current.content}
      </div>
    </section>
  );
}
