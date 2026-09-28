// Path: @yotpo/config.ts
//
// CHANGES:
// - No longer throws at import time. A missing env var used to fail the build of every page
//   that imports `@yotpo`; now the client simply returns null and the components render nothing.
// - Adds `shopDomain`, used by the review-submission route.
//
// The app key is a public Yotpo identifier, not a secret.

export const yotpoConfig = {
  appKey: process.env.NEXT_PUBLIC_YOTPO_APP_KEY ?? null,
  // Domain Yotpo knows your store by (Yotpo admin > Store settings). Adjust if it isn't the myshopify domain.
  shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '',
  apiBaseUrl: 'https://api.yotpo.com/v1/widget',
  createReviewUrl: 'https://api.yotpo.com/v1/widget/reviews',
  reviewsPerPage: 5, // matches "Reviews per page" in Yotpo's Style settings
  revalidateSeconds: 3600,
  brand: {
    primaryColor: '#000000',
    starsColor: '#FFE000',
    textColor: '#000000',
    fontPrimary: 'var(--font-nunito-sans)',
    fontSecondary: 'var(--font-nunito-sans)',
    lineSeparatorStyle: 'smooth' as const
  }
} as const;
