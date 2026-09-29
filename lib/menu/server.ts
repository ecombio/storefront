import { gql } from "@shopify/hydrogen";
import { cacheLife, cacheTag } from "next/cache";

import { assertStorefrontOk } from "@/lib/shopify/errors/server";
import { fetchMenu } from "@/lib/shopify/operations/menu/server";
import { storefront } from "@/lib/shopify/storefront/server";
import type { Menu, MenuItemImage } from "@/lib/shopify/transforms/menu/types";

const COLLECTION_IMAGE_QUERY = gql(`#graphql
  query getMenuCollectionImage($handle: String!) {
    collection(handle: $handle) {
      image {
        url
        altText
        width
        height
      }
      products(first: 1) {
        nodes {
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`);

// Works for "/collections/x" and "https://domain.com/collections/x?y"
function collectionHandle(url: string): string | null {
  const match = url.match(/\/collections\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Same as Liquid's collection.featured_image: collection image, else first product image.
const PUBLIC_DOMAINS = ["ecombio.com", process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? ""].filter(
  Boolean,
);

// Fallback: the public collection JSON the theme also relies on.
async function fetchPublicCollectionImage(handle: string): Promise<MenuItemImage | null> {
  for (const domain of PUBLIC_DOMAINS) {
    try {
      const res = await fetch(`https://${domain}/collections/${handle}.json`);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        collection?: {
          image?: { src: string; alt?: string | null; width?: number; height?: number } | null;
        };
      };
      const image = json.collection?.image;
      if (!image?.src) continue;
      return {
        url: image.src,
        altText: image.alt ?? null,
        width: image.width ?? null,
        height: image.height ?? null,
      };
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchCollectionImage(handle: string): Promise<MenuItemImage | null> {
  let image: MenuItemImage | null = null;
  try {
    const response = await storefront.request(COLLECTION_IMAGE_QUERY, {
      variables: { handle },
    });
    assertStorefrontOk(response, "getMenuCollectionImage");
    const collection = response.data.collection;
    image = collection?.image ?? collection?.products?.nodes?.[0]?.featuredImage ?? null;
    // TEMP DEBUG
    console.log(
      `[menu-image] ${handle}: api collection=${collection ? "found" : "NOT FOUND"} image=${image ? "yes" : "no"}`,
    );
  } catch (error) {
    console.error(`[menu-image] ${handle}: api ERROR`, error);
  }
  if (image) return image;

  const fallback = await fetchPublicCollectionImage(handle);
  console.log(`[menu-image] ${handle}: public json image=${fallback ? "yes" : "no"}`);
  return fallback;
}

async function withCollectionImages(menu: Menu): Promise<Menu> {
  const items = await Promise.all(
    menu.items.map(async (item) => ({
      ...item,
      items: await Promise.all(
        item.items.map(async (child) => {
          if (child.image) return child;
          const handle = collectionHandle(child.url);
          if (!handle) return child;
          return { ...child, image: await fetchCollectionImage(handle) };
        }),
      ),
    })),
  );
  return { ...menu, items };
}

export async function getMenu(params: { handle: string }): Promise<Menu | null> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("menus");

  const menu = await fetchMenu(params);
  return menu ? withCollectionImages(menu) : null;
}
