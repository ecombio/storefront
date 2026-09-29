import { getComplementaryProducts } from "@/lib/product/server";
import type { ProductCard } from "@/lib/product/types";

import { CompatibleAccessoriesList } from "./compatible-accessories-list";

export async function CompatibleAccessories({
  handle,
  initialVisible = 3,
}: {
  handle: string;
  initialVisible?: number;
}) {
  const products = await getComplementaryProducts({ handle });
  if (products.length === 0) return null;

  const accessories = products.map((p: ProductCard) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    imageUrl: p.featuredImage?.url,
    imageAlt: p.featuredImage?.altText ?? undefined,
    price: { amount: String(p.price.amount), currencyCode: p.price.currencyCode },
    compatibility: undefined as string | undefined,
  }));

  return <CompatibleAccessoriesList accessories={accessories} initialVisible={initialVisible} />;
}
