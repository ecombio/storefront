import {
  BadgeCheck,
  BatteryCharging,
  Gauge,
  Lock,
  Route,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { TrustBadge } from "@/lib/product/types";

type Spec = { icon: LucideIcon; label: string; value: string; note?: string };

const SPECS: Spec[] = [
  { icon: Zap, label: "Motor Power", value: "750W", note: "1440W Peak in Boost*" },
  { icon: BatteryCharging, label: "Energy Recovery", value: "Regenerative Braking" },
  { icon: Smartphone, label: "Wireless Connection", value: "4G/GPS" },
  { icon: Lock, label: "Smart Security", value: "Theft Deterrence" },
  { icon: Route, label: "Range", value: "Up to 75 Miles**" },
  { icon: Gauge, label: "Top Speed", value: "Max 28 MPH" },
];

// Shown until custom.trust_badges returns data.
const FALLBACK_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "2 Year Warranty" },
  { icon: BadgeCheck, label: "UL Safety Certified" },
  { icon: RotateCcw, label: "14-Day Returns" },
  { icon: Truck, label: "Fast Shipping" },
];

const TILE =
  "flex h-full flex-1 items-center justify-center gap-2 bg-gray-50 px-2 py-2 text-left text-xs font-semibold leading-tight";

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

export function ProductHighlights({ badges }: { badges?: TrustBadge[] }) {
  const hasBadges = !!badges && badges.length > 0;

  return (
    <div className="mt-6 grid gap-6">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        {SPECS.map(({ icon: Icon, label, value, note }) => (
          <li key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-7 shrink-0 text-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">{label}</p>
              <p className="text-foreground text-sm font-semibold">{value}</p>
              {note ? <p className="text-muted-foreground text-xs">{note}</p> : null}
            </div>
          </li>
        ))}
      </ul>

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
