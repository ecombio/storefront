"use client";

import { useZipCode } from "@/lib/zip/use-zip-code";

// Placeholders: replace with your real numbers
const HANDLING_DAYS = "1-2";
const DELIVERY_DAYS = "5-9";

export function DeliveryEstimate() {
  const zip = useZipCode();
  return (
    <p className="text-sm">
      Ships in {HANDLING_DAYS} days, arrives in {DELIVERY_DAYS} business days
      {zip ? ` to ${zip}` : ""}.
    </p>
  );
}
