# components/@yotpo/

Everything Yotpo-related lives here. Nothing else in the repo needs to know
Yotpo's internals — other files just import from `@/components/@yotpo` and
call one component.

## Files

- `config.ts` — reads the env var once, defines the shared `YotpoProduct` type
- `loader.tsx` — `<YotpoLoader />`, mounted once in `app/layout.tsx`
- `star-rating.tsx` — `<YotpoStarRating />`, the star badge
- `reviews-widget.tsx` — `<YotpoReviewsWidget />`, the full reviews list
- `product-adapter.ts` — `toYotpoProduct()`, maps your real Shopify product
  object to what the widgets expect. Handles both the product-card shape
  and the product-detail-section shape.
- `index.tsx` — barrel export, so call sites only need one import line

Already wired into: `app/layout.tsx`, `components/product-card/product-card.tsx`,
`components/product-detail/product-detail-section.tsx`.
