"use client";

import { MapPin, X } from "lucide-react";
import { useRef, useState } from "react";

import { saveZip, useZipCode } from "@/lib/zip/use-zip-code";

export function ZipCode() {
  const zip = useZipCode() ?? "";
  const [draft, setDraft] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openModal() {
    setDraft(zip);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(draft)) return;
    saveZip(draft);
    closeModal();
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={openModal}
        className="flex items-center gap-1.5 whitespace-nowrap underline hover:opacity-70 transition-opacity"
      >
        <MapPin className="size-3.5" aria-hidden="true" />
        {zip ? `Delivering to ${zip}` : "Update ZIP code"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="zip-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="relative border-b border-border pb-4 text-center">
            <h2 id="zip-modal-title" className="text-sm">
              Delivery estimate
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-0 top-1/2 -translate-y-1/2 hover:opacity-70"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={save} className="pt-5">
            <p className="text-lg font-bold">Update ZIP code</p>
            <p className="mt-1 mb-4 text-sm">
              Delivery options and speed may vary depending on location.
            </p>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                inputMode="numeric"
                maxLength={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
                placeholder="ZIP code"
                aria-label="ZIP code"
                className="h-12 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm"
              />
              <button
                type="submit"
                disabled={draft.length !== 5}
                className="h-12 rounded-md bg-foreground px-6 text-sm font-medium text-background disabled:opacity-40"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
