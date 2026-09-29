import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { shopConfig } from "@/lib/config";
import { getMenu } from "@/lib/menu/server";
import type { MenuItem } from "@/lib/shopify/transforms/menu/types";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { MobileMenu } from "./mobile-menu";
import { NavScrollBehavior } from "./nav-scroll-behavior";
import { QuickLinks } from "./quick-links";
import { ScrollFade } from "./scroll-fade";
import { SearchModal } from "./search-modal";

const FALLBACK_ITEMS: MenuItem[] = [
  {
    id: "default-nav-shop",
    title: "Shop",
    url: "/collections/all",
    type: "HTTP",
    image: null,
    items: [],
  },
];

// Tier 1 (thin utility bar). Edit the text and URLs; make sure each URL exists.
const UTILITY_LINKS = [
  { label: "The Ecombio Promise", url: "/pages/contact", icon: ShieldCheck },
  { label: "Shipping & returns", url: "/policies/contact-information", icon: null },
  { label: "Journal", url: "/blogs/ecombio", icon: null },
];

// Tier 3, right side (highlighted links).
const EXTRA_LINKS = [{ label: "Support", url: "/pages/contact", icon: LifeBuoy }];

async function getNavItems(): Promise<MenuItem[]> {
  try {
    const menu = await getMenu({ handle: "main-menu" });
    return menu && menu.items.length > 0 ? menu.items : FALLBACK_ITEMS;
  } catch {
    return FALLBACK_ITEMS;
  }
}

export async function Nav() {
  const items = await getNavItems();
  return (
    <nav
      className="sticky top-0 md:-top-[32px] z-30 w-full border-b border-border bg-background pt-[env(safe-area-inset-top,0px)] transition-shadow duration-250"
      id="nav-outer"
    >
      <NavScrollBehavior />

      {/* Tier 1: utility bar (desktop only) */}
      <div className="hidden md:block">
        <Container className="flex h-8 items-center gap-6 text-xs font-medium">
          {UTILITY_LINKS.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              className="flex items-center gap-1.5 whitespace-nowrap hover:opacity-70 transition-opacity"
            >
              {link.icon && <link.icon className="size-3.5" aria-hidden="true" />}
              {link.label}
            </Link>
          ))}
        </Container>
      </div>

      {/* Tier 2: logo, search pill, help, account, cart.
          On mobile the search pill wraps onto its own full-width row. */}
      <Container className="flex flex-wrap items-center gap-x-2.5 gap-y-2 py-2 md:flex-nowrap md:gap-5">
        <MobileMenu items={items} />

        <Link
          aria-label={`${shopConfig.site.name} home`}
          className="flex items-center shrink-0"
          href="/"
        >
          <Image
            alt={shopConfig.site.name}
            className="h-9 w-auto"
            height={36}
            priority
            src="/logo.svg"
            width={140}
          />
        </Link>

        {shopConfig.search.isEnabled && (
          <div className="order-last w-full md:order-none md:w-auto md:flex-1 md:max-w-xl">
            <PredictiveSearchProvider
              debounceInMs={300}
              limit={3}
              types={["PRODUCT", "COLLECTION", "QUERY"]}
            >
              <SearchModal />
            </PredictiveSearchProvider>
          </div>
        )}

        <div className="flex items-center gap-5 ml-auto">
          <Link href="/pages/contact" className="hidden whitespace-nowrap lg:inline text-sm font-medium hover:opacity-70">
            Need help?
          </Link>
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
        </div>
      </Container>

      {/* Mobile: swipeable category chips with edge fades */}
      <div className="pb-2 md:hidden">
        <Container>
          <ScrollFade innerClassName="gap-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="shrink-0 whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-sm font-medium"
              >
                {item.title}
              </Link>
            ))}
          </ScrollFade>
        </Container>
      </div>

      {/* Tier 3: category links scroll inside their own region; extra links stay fixed on the right */}
      <Container className="hidden md:flex items-center gap-6">
        <ScrollFade className="min-w-0 flex-1">
          <QuickLinks items={items} />
        </ScrollFade>
        <ul className="flex shrink-0 items-center gap-5 whitespace-nowrap text-sm font-medium">
          {EXTRA_LINKS.map((link) => (
            <li key={link.url}>
              <Link
                href={link.url}
                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
