# Product Roadmap

Minimum requirements must be true before the site is promoted. Recommended requirements improve the store but can wait. Tick items off as they are done.

Related docs: `docs/requirements.md`, `docs/prd.md`, `docs/articles.md`, `docs/pages.md`, `README.md`.

## Phase 1: Now (minimum requirements)

Goal: nothing customers see is false, broken, or unfinished.

### 1.1 Verify what shipped

- [ ] Progress line works on a live article. Check: `<html>` has `data-reading`, and `--reading-progress` rises from 0 and reaches 1 at the end of the article body.
- [ ] Back-to-top appears at about 40% scroll and works from the keyboard.
- [ ] `docs/articles.md` includes the new blog features. Check: `Select-String -Path docs/articles.md -Pattern "Back to top"` returns a match.

### 1.2 Customer-facing honesty

- [ ] Delivery estimate uses real numbers, or the line is hidden. Check: no ZIP gets a made-up promise.
- [ ] Country and language picker works, or is hidden. Check: nothing in the UI does nothing.

### 1.3 Clean content in Shopify

- [ ] Delete or unpublish the "BLOGGLE" test post.
- [ ] Remove placeholder pages: `/blogs/author/name`, `/blogs/category/category`, `/blogs/category/authors`.
- [ ] Every post has a featured image and `author_profile`. Check: no gray boxes in "You may like", and no "name" bylines.

### 1.4 Buying path

- [ ] Full test order passes on the live site: add to cart, change quantity, remove, discount code, Shop Pay, sign-in, and the cart carrying over after sign-in.

### 1.5 Shipping discipline

- [ ] Every push has 0 lint errors and a passing build.
- [ ] After each push, `git ls-remote origin main` equals `git rev-parse HEAD`.
- [ ] After each scripted edit, run `git diff --stat`. A `.Replace()` with a non-matching anchor changes nothing and prints no error.

## Phase 2: Next (recommended requirements)

Goal: the store feels finished and is safer to change.

### 2.1 Deploy safely

- [ ] Review changes on a Vercel preview branch before merging to `main`.

### 2.2 Checkout

- [ ] Finish the branded `checkout.ecombio.com` (Cloudflare CNAME to `shops.myshopify.com`, verify in Shopify, decide on primary domain).

### 2.3 Code quality

- [ ] `pnpm lint` reports 0 warnings:
  - [ ] `sandbox` on the iframe in `components/product-detail/expert-reviews.tsx`
  - [ ] `next/image` for the two `<img>` tags in `components/product-detail/product-highlights.tsx`
  - [ ] Remove the `collections.length` dependency in `components/collections/sub-collection-tiles.tsx`
  - [ ] Derive the tab from the hash without `setState` in an effect in `components/collections/collection-tabs.tsx`
- [ ] Replace the local `tagHandle()` in `components/blog/article-page.tsx` with the shared helper in `lib/blog/tags.ts`, if one is exported.

### 2.4 Blog SEO

- [ ] Article pages emit Article JSON-LD, a canonical URL, and Open Graph tags.
- [ ] Tag and author pages are in the sitemap (`app/sitemap/[shard]/route.ts`).
- [ ] Spot-check `/sitemap.xml`, `/robots.txt`, and `/llms.txt` on the live site.

### 2.5 Delivery and regions (full versions)

- [ ] Real ZIP delivery estimate: handling time per product, origin, carrier transit by destination ZIP, and business-day rules.
- [ ] Wire the country and language picker to Shopify Markets.

## Phase 3: Later (optional)

- [ ] Fetch more than 50 articles per blog, and make "Load More" fetch from Shopify.
- [ ] Shopify-managed footer menus (the header already reads `main-menu`).
- [ ] Bundles and "Pairs Well With" products in Shopify, or disable their flags in `lib/config/index.ts`.
- [ ] Vercel Web Analytics.
- [ ] Multiple languages or regions (`/vercel-shop:enable-i18n`, `/vercel-shop:enable-shopify-markets`).
- [ ] Shop Agent, only with a card on file in Vercel AI Gateway, spending limits, and bot protection.

## Known limits

- Each blog loads at most 50 articles. Tag pages, author pages, "You may like", and "Viewing N of N" reflect only those.
- No storefront equivalents for `password`, `gift_card`, `customers/login`, `register`, `reset_password`, `activate_account`, `metaobject/*`.
- Content is cached. If a change does not show locally, restart `pnpm dev`.
