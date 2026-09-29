"use client";

import { useMemo, useSyncExternalStore } from "react";

import { COUNTRIES, DEFAULT_COUNTRY, getCountry } from "@/lib/zip/countries";

export const COUNTRY_KEY = "ecombio-country";
export const COUNTRY_EVENT = "ecombio-country";

export type CountrySelection = { code: string; language: string };

const read = () => {
  try {
    return localStorage.getItem(COUNTRY_KEY);
  } catch {
    return null;
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener(COUNTRY_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(COUNTRY_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

function parse(raw: string | null): CountrySelection {
  const fallback = {
    code: DEFAULT_COUNTRY,
    language: getCountry(DEFAULT_COUNTRY).languages[0],
  };
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw) as Partial<CountrySelection>;
    const country = COUNTRIES.find((c) => c.code === value.code);
    if (!country) return fallback;
    const language = country.languages.includes(value.language ?? "")
      ? (value.language as string)
      : country.languages[0];
    return { code: country.code, language };
  } catch {
    return fallback;
  }
}

export function saveCountry(selection: CountrySelection) {
  try {
    localStorage.setItem(COUNTRY_KEY, JSON.stringify(selection));
    window.dispatchEvent(new Event(COUNTRY_EVENT));
  } catch {}
}

export function useCountry() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parse(raw), [raw]);
}
