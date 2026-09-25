// components/@yotpo/config.ts

export const YOTPO_APP_KEY = process.env.NEXT_PUBLIC_YOTPO_APP_KEY;

if (!YOTPO_APP_KEY && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[yotpo] NEXT_PUBLIC_YOTPO_APP_KEY is not set — star ratings and reviews widgets will not render.',
  );
}

/**
 * Common shape passed into every Yotpo widget. Map your real product
 * object to this in one place (see product-adapter.ts) instead of
 * repeating field-name lookups everywhere a widget is used.
 */
export type YotpoProduct = {
  id: string;
  url: string;
  name: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  description?: string;
};
