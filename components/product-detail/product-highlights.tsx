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

type Spec = { icon: LucideIcon; label: string; value: string; note?: string };

const SPECS: Spec[] = [
  { icon: Zap, label: "Motor Power", value: "750W", note: "1440W Peak in Boost*" },
  { icon: BatteryCharging, label: "Energy Recovery", value: "Regenerative Braking" },
  { icon: Smartphone, label: "Wireless Connection", value: "4G/GPS" },
  { icon: Lock, label: "Smart Security", value: "Theft Deterrence" },
  { icon: Route, label: "Range", value: "Up to 75 Miles**" },
  { icon: Gauge, label: "Top Speed", value: "Max 28 MPH" },
];

const BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "2 Year Warranty" },
  { icon: BadgeCheck, label: "UL Safety Certified" },
  { icon: RotateCcw, label: "14-Day Returns" },
  { icon: Truck, label: "Fast Shipping" },
];

export function ProductHighlights() {
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

      <ul className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-4">
        {BADGES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5 text-xs font-medium">
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
