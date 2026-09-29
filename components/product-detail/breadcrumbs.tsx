import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({
  items,
  className,
  ...props
}: { items: BreadcrumbItem[] } & ComponentProps<"nav">) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-2 text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-foreground/60">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1.5">
              {item.path && !isLast ? (
                <Link href={item.path} className="transition-colors hover:text-foreground">
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "text-foreground")}
                >
                  {item.name}
                </span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
