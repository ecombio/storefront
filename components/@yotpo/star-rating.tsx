// components/@yotpo/star-rating.tsx

import type { YotpoProduct } from './config';

/**
 * Star rating summary badge (Yotpo's "bottomLine" snippet).
 * Use on product cards (collection/search grids) and near the PDP title.
 */
export function YotpoStarRating({ product }: { product: YotpoProduct }) {
  return (
    <div
      className="yotpo bottomLine"
      data-product-id={product.id}
      data-url={product.url}
      data-name={product.name}
    />
  );
}
