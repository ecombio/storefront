"use client";

import { useEffect, useState, type ReactNode } from "react";

type Tab = "products" | "advice";

const TAB_BASE = "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors";
const TAB_ACTIVE = "border-foreground text-foreground";
const TAB_IDLE = "border-transparent text-muted-foreground hover:text-foreground";

export function CollectionTabs({
  advice,
  adviceCount,
  productCount,
  children,
}: {
  advice: ReactNode;
  adviceCount: number;
  productCount?: number;
  children: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (window.location.hash === "#advice") setTab("advice");
  }, []);

  if (adviceCount === 0) return <>{children}</>;

  function select(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.hash = next === "advice" ? "advice" : "";
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="grid gap-5">
      <div role="tablist" className="flex justify-center border-b">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "products"}
          onClick={() => select("products")}
          className={`${TAB_BASE} ${tab === "products" ? TAB_ACTIVE : TAB_IDLE}`}
        >
          Products{productCount ? ` (${productCount})` : ""}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "advice"}
          onClick={() => select("advice")}
          className={`${TAB_BASE} ${tab === "advice" ? TAB_ACTIVE : TAB_IDLE}`}
        >
          Expert Advice ({adviceCount})
        </button>
      </div>
      <div role="tabpanel" hidden={tab !== "products"}>
        {children}
      </div>
      <div role="tabpanel" hidden={tab !== "advice"}>
        {advice}
      </div>
    </div>
  );
}
