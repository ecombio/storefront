import Link from "next/link";

import { ProductCard } from "@/components/product-card/product-card";
import { getProduct } from "@/lib/product/server";
import type { ProductDetails } from "@/lib/product/types";

export interface ProductStripProps {
  handles: string[];
  href?: string | undefined;
  title?: string | undefined;
}

export async function ProductStrip({ handles, href, title }: ProductStripProps) {
  const products = (
    await Promise.all(
      handles.slice(0, 3).map((handle) => getProduct({ handle }).catch(() => undefined)),
    )
  ).filter((product): product is ProductDetails => product !== undefined);

  if (products.length === 0) return null;

  const isSingle = products.length === 1;

  const layout = isSingle
    ? "grid-cols-[minmax(0,1fr)]"
    : products.length === 2
      ? "grid-cols-[repeat(2,minmax(0,1fr))]"
      : "grid-cols-[repeat(2,minmax(0,1fr))] sm:grid-cols-[repeat(3,minmax(0,1fr))]";

  return (
    <section className="grid gap-4">
      {(title || href) && (
        <div className="flex items-baseline justify-between gap-4">
          {title && <h3 className="font-medium text-sm uppercase tracking-wide">{title}</h3>}
          {href && (
            <Link className="ml-auto shrink-0 whitespace-nowrap text-xs underline" href={href}>
              Shop Now
            </Link>
          )}
        </div>
      )}
      <div className={`grid gap-4 ${layout}`}>
        {products.map((product) => (
          <div
            className="min-w-0 [&_[data-slot=product-card-image]]:aspect-[4/3] [&_[data-slot=product-card-image]_img]:object-contain"
            key={product.id}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
