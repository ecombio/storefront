// components/@yotpo/product-adapter.ts

import { buildProductUrl } from "@/lib/product";

import type { YotpoProduct } from "./config";

/**
 * Handles both product shapes in the repo:
 * - product-card.tsx (ProductCardType): featuredImage + price
 * - product-detail-section.tsx (ProductDetails): images[] + priceRange.minVariantPrice
 * ProductDetails.id is confirmed real (see app/products/[handle]/page.tsx,
 * which passes product.id into ProductViewedTracker). ProductCardType's id
 * is still unconfirmed — falls back to handle only if id is missing.
 */
type YotpoSourceProduct = {
  id?: string;
  handle: string;
  title: string;
  descriptionHtml?: string;
  featuredImage?: { url?: string; altText?: string | null } | null;
  images?: { url: string }[];
  price?: { amount: string; currencyCode: string };
  priceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
  defaultVariantSelectedOptions?: { name: string; value: string }[];
};

export function toYotpoProduct(product: YotpoSourceProduct): YotpoProduct {
  const price = product.price ?? product.priceRange?.minVariantPrice;
  const imageUrl = product.featuredImage?.url ?? product.images?.[0]?.url;

  return {
    id: product.id ?? product.handle,
    url: buildProductUrl(product.handle, product.defaultVariantSelectedOptions ?? []),
    name: product.title,
    price: price?.amount,
    currency: price?.currencyCode,
    imageUrl,
    description: product.descriptionHtml,
  };
}
