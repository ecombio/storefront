"use client";

import { useEffect, useRef, useState } from "react";

// Tries: resized JPEG from Shopify's CDN -> original URL -> grey tile with the title.
export function MenuCardImage({ url, alt, title }: { url: string; alt: string; title: string }) {
  const [attempt, setAttempt] = useState(0);
  const ref = useRef<HTMLImageElement>(null);

  const joiner = url.includes("?") ? "&" : "?";
  const sources = [`${url}${joiner}width=600&format=jpg`, url];
  const failed = () => setAttempt((n) => n + 1);

  // Catch images that failed before React attached the error handler.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) failed();
  }, [attempt]);

  if (attempt >= sources.length) {
    return (
      <span className="absolute inset-0 flex items-end p-3 text-xs font-semibold text-muted-foreground">
        {title}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={attempt}
      ref={ref}
      src={sources[attempt]}
      alt={alt}
      loading="eager"
      decoding="async"
      onError={failed}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
    />
  );
}
