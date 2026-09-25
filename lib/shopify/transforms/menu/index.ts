// lib/shopify/transforms/menu/index.ts
import type {
  Menu,
  MenuItem,
  MenuItemType,
  ShopifyMenu,
  ShopifyMenuItem,
} from "@/lib/shopify/transforms/menu/types";

function transformMenuItem(item: ShopifyMenuItem, storeDomain: string): MenuItem {
  return {
    id: item.id,
    title: item.title,
    url: transformShopifyMenuItemUrl(item.url ?? null, item.type, storeDomain),
    type: item.type,
    items: (item.items ?? []).map((child) => transformMenuItem(child, storeDomain)),
  };
}

export function transformShopifyMenu(
  menu: ShopifyMenu | null | undefined,
  storeDomain: string,
): Menu | null {
  if (!menu) return null;

  return {
    id: menu.id,
    handle: menu.handle,
    title: menu.title,
    items: menu.items.map((item) => transformMenuItem(item, storeDomain)),
  };
}

function transformShopifyMenuItemUrl(
  url: string | null,
  type: MenuItemType,
  storeDomain: string,
): string {
  if (type === "FRONTPAGE") return "/";
  if (type === "SEARCH") return "/search";

  if (type === "CUSTOMER_ACCOUNT_PAGE") {
    // Shopify returns a signed, per-request URL here (buyer_flags), which
    // changes on every call — unsafe to bake into a long-lived cached menu
    // (this menu is fetched under "use cache: remote" with cacheLife("max")).
    // Map to our own static account routes instead of Shopify's hosted UI.
    if (!url) return "/account";

    let path: string;
    try {
      path = new URL(url).pathname;
    } catch {
      return "/account";
    }

    if (path.endsWith("/orders")) return "/account/orders";
    if (path.endsWith("/addresses")) return "/account/addresses";
    return "/account/profile"; // covers /profile and /settings
  }

  if (!url) return "/";

  try {
    const parsed = new URL(url);
    const isInternal =
      storeDomain && parsed.hostname === new URL(`https://${storeDomain}`).hostname;

    if (!isInternal) return url;

    let path = parsed.pathname;
    path = path.replace(/^\/[a-z]{2}(-[a-z]{2,4})?\//i, "/");

    return path;
  } catch {
    return url;
  }
}
