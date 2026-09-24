import type { Locale } from "./types";

export const locales = ["en-US"] as const;
export const defaultLocale: Locale = "en-US";
export const enabledLocales: readonly Locale[] = locales;

export function isEnabledLocale(value: string): value is Locale {
  return enabledLocales.some((locale) => locale === value);
}
