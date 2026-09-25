"use client";
// components/@yotpo/loader.tsx

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

import { YOTPO_APP_KEY } from "./config";

declare global {
  interface Window {
    yotpo?: { refreshWidgets: () => void; initWidgets: () => void };
    yotpoWidgetsContainer?: { initWidgets: () => void };
  }
}

/**
 * Mount ONCE in app/layout.tsx, inside <body>, near the end.
 * Loads Yotpo's widget.js and re-scans the DOM on client-side route
 * changes (App Router navigation doesn't do a full reload, so Yotpo's
 * own one-time page-load scan would otherwise miss new PDPs).
 */
export function YotpoLoader() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.yotpo?.refreshWidgets) {
      window.yotpo.refreshWidgets();
    } else if (window.yotpoWidgetsContainer?.initWidgets) {
      window.yotpoWidgetsContainer.initWidgets();
    }
  }, [pathname]);

  if (!YOTPO_APP_KEY) return null;

  return (
    <Script
      id="yotpo-widget-loader"
      src={`https://staticw2.yotpo.com/${YOTPO_APP_KEY}/widget.js`}
      strategy="afterInteractive"
    />
  );
}
