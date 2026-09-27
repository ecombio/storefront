// Path: @yotpo/index.ts
//
// CHANGE FROM PREVIOUS VERSION:
// Import paths updated for the renamed component files:
//   ./components/star-rating.tsx    -> ./components/star-ratings.tsx
//   ./components/product-reviews.tsx -> ./components/reviews-widget.tsx
// Exported names are unchanged (StarRating, ProductReviews), so nothing outside
// this folder needs to change — everything still imports from `@yotpo`.
//
// Public surface of the Yotpo slice. Everything else in this folder
// (client.ts, config.ts, components/star.tsx) is an implementation detail —
// the rest of the app should only ever import from `@yotpo` (or a relative
// path to this file), never reach into `@yotpo/client` or `@yotpo/components/*`
// directly. That's what makes this folder swappable later.

export { StarRating } from './components/star-ratings';
export { ProductReviews } from './components/reviews-widget';

export type {
  YotpoReview,
  YotpoBottomline,
  YotpoProductReviews,
  YotpoRatingSummary
} from './types';