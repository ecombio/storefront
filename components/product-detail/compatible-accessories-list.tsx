"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type AccessoryItem = {
  id: string;
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  price: { amount: string; currencyCode: string };
  compatibility?: string;
};

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function CompatibleAccessoriesList({
  accessories,
  initialVisible = 3,
  title = "Compatible Accessories",
}: {
  accessories: AccessoryItem[];
  initialVisible?: number;
  title?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = expanded ? accessories : accessories.slice(0, initialVisible);
  const hiddenCount = accessories.length - initialVisible;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      className="grid gap-2.5 rounded-lg border border-border p-4"
      data-slot="compatible-accessories"
    >
      <h2 className="font-semibold text-sm">{title}</h2>
      <ul className="divide-y divide-border">
        {visible.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-3">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              aria-label={`Select ${item.title}`}
            />
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.imageAlt || item.title}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="size-12 shrink-0 rounded-md bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.handle}`}
                className="font-semibold text-sm hover:underline"
              >
                {item.title}
              </Link>
              {item.compatibility ? (
                <p className="mt-0.5 text-foreground/60 text-xs">{item.compatibility}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-semibold text-sm">
              {formatPrice(item.price.amount, item.price.currencyCode)}
            </span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="justify-self-end font-semibold text-sm"
        >
          {expanded ? "Show less" : `Show (${hiddenCount}) more...`}
        </button>
      ) : null}
    </div>
  );
}
