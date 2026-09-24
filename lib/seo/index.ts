import type { Metadata } from "next";

import { shopConfig } from "@/lib/config";
import { defaultLocale, enabledLocales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

import type { SearchParamsInput } from "./types";

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash === "/") return withLeadingSlash;
  return withLeadingSlash.replace(/\/+$/, "");
}

function withLocalePath(locale: string, pathname: string): string {
  const normalized = normalizePath(pathname);
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

function toSearchParams(input: SearchParamsInput): URLSearchParams {
  if (!input) return new URLSearchParams();
  if (input instanceof URLSearchParams) return new URLSearchParams(input);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      if (key.startsWith("filter.")) {
        if (value.length > 0) params.set(key, value.join(","));
      } else {
        for (const item of value) {
          params.append(key, item);
        }
      }
      continue;
    }
    params.set(key, value);
  }

  return params;
}

function buildCanonicalPath(pathname: string, searchParams?: SearchParamsInput): string {
  const params = toSearchParams(searchParams);
  params.delete("cursor");

  const query = params.toString();
  const normalizedPath = normalizePath(pathname);
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

// TODO(i18n): make `locale` required (and pass it from every caller) before enabling a second locale.
export function buildAlternates({
  locale = defaultLocale,
  pathname,
  searchParams,
}: {
  locale?: Locale;
  pathname: string;
  searchParams?: SearchParamsInput;
}): Metadata["alternates"] {
  const canonical = buildCanonicalPath(withLocalePath(locale, pathname), searchParams);

  const languages: Record<string, string> = {};
  for (const candidate of enabledLocales) {
    languages[candidate] = buildCanonicalPath(withLocalePath(candidate, pathname), searchParams);
  }
  languages["x-default"] = buildCanonicalPath(
    withLocalePath(defaultLocale, pathname),
    searchParams,
  );

  return { canonical, languages };
}

export function buildOpenGraph({
  title,
  description,
  url,
  type,
  images = ["/og-default.png"],
}: {
  title: string;
  description?: string;
  url: string;
  type?: "website" | "article";
  images?: Array<string | { url: string; width?: number; height?: number; alt?: string }>;
}): Metadata["openGraph"] {
  // Omit type so product pages can emit og:type=product through raw meta tags.
  return {
    ...(type ? { type } : {}),
    title,
    description,
    url,
    siteName: shopConfig.site.name,
    images,
  };
}
