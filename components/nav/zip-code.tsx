"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ecombio-zip";

export function ZipCode() {
  const [zip, setZip] = useState("");
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setZip(saved);
        setDraft(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(draft)) return;
    setZip(draft);
    try {
      localStorage.setItem(STORAGE_KEY, draft);
    } catch {}
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 whitespace-nowrap underline hover:opacity-70 transition-opacity"
      >
        <MapPin className="size-3.5" aria-hidden="true" />
        {zip ? `Delivering to ${zip}` : "Update ZIP code"}
      </button>

      {open && (
        <form
          onSubmit={save}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-background p-4 shadow-md"
        >
          <p className="mb-2 text-sm font-bold">Enter your ZIP code</p>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            placeholder="90210"
            className="mb-3 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            disabled={draft.length !== 5}
            className="h-10 w-full rounded-md bg-foreground text-sm font-medium text-background disabled:opacity-40"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
