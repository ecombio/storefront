import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { MenuItem } from "@/lib/shopify/transforms/menu/types";

import { MenuCardImage } from "./menu-card-image";

const MAX_COLUMNS = 5;

interface MenuLinkProps {
  url: string;
  children: ReactNode;
  className?: string;
}

function MenuLink({ url, children, className }: MenuLinkProps) {
  if (url.startsWith("http")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}

export function QuickLinks({ items }: { items: MenuItem[] }) {
  return (
    <ul className="hidden md:flex items-center gap-6">
      {items.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

const TRIGGER_CLASS = "flex items-center gap-1 text-sm hover:opacity-70 transition-opacity";

function NavItem({ item }: { item: MenuItem }) {
  if (item.items.length === 0) {
    return (
      <li className="flex items-center h-11">
        <MenuLink url={item.url} className={TRIGGER_CLASS}>
          {item.title}
        </MenuLink>
      </li>
    );
  }

  const columns = item.items.slice(0, MAX_COLUMNS);

  return (
    <li className="group flex items-center h-11">
      <MenuLink url={item.url} className={TRIGGER_CLASS}>
        {item.title}
        <ChevronDown className="size-3" aria-hidden="true" />
      </MenuLink>
      <div
        className={cn(
          "absolute inset-x-0 top-full z-40",
          "invisible opacity-0",
          "group-hover:visible group-hover:opacity-100",
          // :focus-visible (not :focus-within) so post-click mouse focus doesn't pin the menu open.
          "group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100",
          "transition-opacity duration-150",
          "bg-background border-b shadow-md",
        )}
      >
        <div className="px-5 lg:px-10 pb-5">
          <CategoryCards columns={columns} />
        </div>
        {/* Page overlay: dark tint + blur, same look as the Liquid theme. Fades with the panel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-full h-screen bg-[rgba(20,20,20,0.4)] backdrop-blur-[6px]"
        />
      </div>
    </li>
  );
}

function CategoryCards({ columns }: { columns: MenuItem[] }) {
  return (
    <div className="pt-4">
      <p className="mb-3 text-xs font-bold">Categories</p>
      <ul className="grid grid-cols-5 gap-4">
        {columns.map((column) => (
          <li key={column.id}>
            <MenuLink url={column.url} className="group/card block">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <CardImage column={column} />
              </div>
              <span className="mt-2 block text-xs font-bold">{column.title}</span>
            </MenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardImage({ column }: { column: MenuItem }) {
  if (!column.image) return null;
  return (
    <MenuCardImage
      url={column.image.url}
      alt={column.image.altText ?? column.title}
      title={column.title}
    />
  );
}
