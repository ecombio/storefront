# Ecombio Storefront

Headless Shopify storefront for [ecombio.com](https://ecombio.com), built with Next.js on Vercel.

Based on the MIT-licensed [Vercel Shop](https://github.com/vercel/shop) template. See `LICENSE`.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` in `.env.local`. Never commit `.env.local`.

## Configuration

Feature flags and site identity live in `lib/config/index.ts`. Customer accounts, the Shop Agent chat assistant, analytics, and bot protection are currently disabled.