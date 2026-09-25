// components/@yotpo/reviews-widget.tsx

import type { YotpoProduct } from "./config";

/**
 * Full reviews list + "write a review" CTA (Yotpo's "main widget").
 * Place near the bottom of the PDP, below the product description.
 */
export function YotpoReviewsWidget({ product }: { product: YotpoProduct }) {
  return (
    <div
      className="yotpo yotpo-main-widget"
      data-product-id={product.id}
      data-url={product.url}
      data-name={product.name}
      data-price={product.price}
      data-currency={product.currency}
      data-image-url={product.imageUrl}
      data-description={product.description}
    />
  );
}
