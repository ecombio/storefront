import { BadgeCheck, RotateCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

import type { ProductSpec, TrustBadge } from "@/lib/product/types";

// Shown until custom.trust_badges returns data.
const FALLBACK_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "2 Year Warranty" },
  { icon: BadgeCheck, label: "UL Safety Certified" },
  { icon: RotateCcw, label: "14-Day Returns" },
  { icon: Truck, label: "Fast Shipping" },
];

const TILE =
  "flex h-full flex-1 items-center justify-start gap-2 bg-gray-50 px-2 py-2 text-left text-xs font-semibold leading-tight";

const SPEC_ROW = "flex items-start gap-3";

function BadgeTile({ badge }: { badge: TrustBadge }) {
  const content = (
    <>
      {badge.iconUrl ? (
        <img
          src={badge.iconUrl}
          alt={badge.iconAlt || ""}
          className="h-6 w-auto shrink-0 object-contain"
          loading="lazy"
        />
      ) : null}
      <span>{badge.title}</span>
    </>
  );

  return (
    <li className="flex" title={badge.tooltip}>
      {badge.href ? (
        <a
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TILE} hover:bg-gray-100`}
        >
          {content}
        </a>
      ) : (
        <div className={TILE}>{content}</div>
      )}
    </li>
  );
}

function SpecItem({ spec }: { spec: ProductSpec }) {
  const content = (
    <>
      {spec.iconUrl ? (
        <img
          src={spec.iconUrl}
          alt={spec.iconAlt || ""}
          className="mt-0.5 size-7 shrink-0 object-contain"
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] tracking-wide uppercase">{spec.label}</p>
        <p className="text-foreground text-sm font-semibold">{spec.value}</p>
      </div>
    </>
  );

  return (
    <li title={spec.tooltip}>
      {spec.href ? (
        <a
          href={spec.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${SPEC_ROW} hover:opacity-80`}
        >
          {content}
        </a>
      ) : (
        <div className={SPEC_ROW}>{content}</div>
      )}
    </li>
  );
}

export function ProductHighlights({
  badges,
  specs,
}: {
  badges?: TrustBadge[];
  specs?: ProductSpec[];
}) {
  const hasBadges = !!badges && badges.length > 0;
  const hasSpecs = !!specs && specs.length > 0;

  return (
    <div className="mt-6 grid gap-6">
      {hasSpecs ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          {specs.map((spec) => (
            <SpecItem key={spec.label} spec={spec} />
          ))}
        </ul>
      ) : null}

      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {hasBadges
          ? badges.map((badge) => <BadgeTile key={badge.title} badge={badge} />)
          : FALLBACK_BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex">
                <div className={TILE}>
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
}
