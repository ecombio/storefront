import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { shopConfig } from "@/lib/config";
import { getMenu } from "@/lib/menu/server";
import type { MenuItem } from "@/lib/shopify/transforms/menu/types";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { MobileMenu } from "./mobile-menu";
import { QuickLinks } from "./quick-links";
import { SearchModal } from "./search-modal";

const FALLBACK_ITEMS: MenuItem[] = [
  { id: "default-nav-shop", title: "Shop", url: "/collections/all", type: "HTTP", items: [] },
];

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
      className="sticky top-0 z-30 w-full bg-background pt-[env(safe-area-inset-top,0px)] transition-shadow duration-250"
      id="nav-outer"
    >
      <Container className="flex h-16 items-center gap-2.5 md:gap-5">
        <MobileMenu items={items} />

        <Link className="flex items-center shrink-0" href="/">
          <span className="text-xl leading-4">{shopConfig.site.name}</span>
        </Link>

        <QuickLinks items={items} />

        <div className="flex items-center gap-5 ml-auto">
          {shopConfig.search.isEnabled && (
            <PredictiveSearchProvider
              debounceInMs={300}
              limit={3}
              types={["PRODUCT", "COLLECTION", "QUERY"]}
            >
              <SearchModal />
            </PredictiveSearchProvider>
          )}
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
    </nav>
  );
}
