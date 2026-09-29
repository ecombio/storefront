"use client";

import { useSyncExternalStore } from "react";

export const ZIP_KEY = "ecombio-zip";
export const ZIP_EVENT = "ecombio-zip";

const read = () => {
  try {
    return localStorage.getItem(ZIP_KEY);
  } catch {
    return null;
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener(ZIP_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ZIP_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export function saveZip(zip: string) {
  try {
    localStorage.setItem(ZIP_KEY, zip);
    window.dispatchEvent(new Event(ZIP_EVENT));
  } catch {}
}

export function useZipCode() {
  return useSyncExternalStore(subscribe, read, () => null);
}
