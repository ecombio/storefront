"use client";

import { useSyncExternalStore } from "react";

const KEY = "ecombio-zip";
const EVENT = "ecombio-zip";

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export function useZipCode() {
  return useSyncExternalStore(subscribe, read, () => null);
}
