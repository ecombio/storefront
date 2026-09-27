/**
 * yotpo/index.ts
 *
 * Public surface of the Yotpo slice. Everything else in this folder
 * (client.ts, config.ts, components/star.tsx) is an implementation detail —
 * the rest of the app should only ever import from `@/yotpo` (or a relative
 * path to this file), never reach into `yotpo/client` or `yotpo/components/*`
 * directly. That's what makes this folder swappable later.
 */

export { StarRating } from './components/star-rating';
export { ProductReviews } from './components/product-reviews';

export type {
  YotpoReview,
  YotpoBottomline,
  YotpoProductReviews,
  YotpoRatingSummary
} from './types';
