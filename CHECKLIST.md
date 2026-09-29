# Ecombio Storefront Checklist

Tick items by changing `[ ]` to `[x]`. Details for each item are in `README.md`.

## Before every push

Pushes to `main` deploy to production on Vercel.

- [ ] Only files I meant to change are listed by `git status --short`
- [ ] `.env.local` and `.devin/` are not staged
- [ ] `pnpm lint` exits `0` (`pnpm lint; echo $LASTEXITCODE`)
- [ ] `pnpm build` completes
- [ ] No placeholder text or numbers in what I'm publishing (see Delivery estimate below)
- [ ] Commit message says what changed

## After every deploy

- [ ] `git ls-remote origin main` and `git rev-parse HEAD` return the same hash
- [ ] Vercel build is green: https://vercel.com/ecombiology/storefront/deployments
- [ ] Live site loads and a product page renders
- [ ] Browser console has no new errors or hydration warnings
- [ ] If the build failed: the old deployment is still live; fix the cause and push again (env variable problems: fix in Vercel, then **Redeploy**)

## Launch status

### Done

- [x] Shopify Headless channel, storefront token, Storefront API permissions
- [x] Products published to Headless; Search & Discovery filters configured
- [x] Deployed on Vercel; `ecombio.com` is primary, `www` redirects to it
- [x] GitHub repo connected to Vercel; pushes to `main` deploy to production
- [x] Cloudflare DNS and email records reviewed
- [x] Ecombio branding and root-domain canonicals
- [x] Customer accounts: Shopify client, callback and logout URIs, env vars, and deployment
- [x] Webhooks: product and collection webhooks registered (JSON, API version 2026-07) to `https://ecombio.com/api/webhooks/shopify`; `SHOPIFY_WEBHOOK_SECRET` set in Production; unsigned requests return 401
- [x] ZIP code modal with switch country view
- [x] Delivery estimate line under the product price (placeholder numbers)

### ZIP code and delivery estimate

- [ ] Replace placeholder `HANDLING_DAYS` and `DELIVERY_DAYS` in `components/delivery-estimate.tsx` with real numbers, or build the ZIP-based estimate
- [ ] Decide where handling time lives (one store-wide number, or a per-product Shopify metafield with Storefront API access enabled)
- [ ] Country and language picker: connect it to Shopify Markets / i18n, or hide it until it does something
- [ ] Edit `lib/zip/countries.ts` to the markets actually served
- [ ] Decide what the ZIP form does for non-US countries (currently 5-digit US only)
- [ ] Swap `flagcdn.com` flag images for local SVGs if a strict Content-Security-Policy is added

### Testing

- [ ] Sign-in: `/account/login` redirects to Shopify with `redirect_uri=https://ecombio.com/account/authorize` (verified). Still to confirm in a browser: sign in with the emailed code, check profile, orders, addresses, and logout
- [ ] Cart: add, change quantity, remove, discount code, cart carries over after sign-in
- [ ] Checkout: full test order on the live site, including Shop Pay
- [ ] ZIP modal on the live site: opens with the saved ZIP prefilled; Esc, X, and backdrop click close it; saving updates the nav label and the product-page estimate; persists after reload
- [ ] Spot-check `/sitemap.xml`, `/robots.txt`, and `/llms.txt` on the live site

### Shopify

- [ ] Product pages: set up bundles and complementary products, or disable their flags in `lib/config/index.ts`
- [ ] Fix the product description typo
- [ ] Confirm collections are published to Headless
- [ ] Fill in every store policy, check the footer links, and confirm edits (such as the contact-information email) appear on the live site

### Site content

- [ ] Home page: check the headline copy and which eight products show; consider featuring a collection

### Checkout domain

- [ ] Cloudflare DNS: CNAME `checkout` to `shops.myshopify.com`, DNS only (grey cloud); verify with `Resolve-DnsName checkout.ecombio.com -Type CNAME`
- [ ] Shopify Admin, Settings, Domains: connect and verify `checkout.ecombio.com`
- [ ] Decide whether it becomes the primary domain (checkout and generated Shopify links follow the primary domain)
- [ ] Run the test order on the current checkout first

### DNS and configuration

- [ ] DMARC record
- [ ] `store.ecombio.com` proxy setting
- [ ] `.env.example` lists the auth variables and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID`
- [ ] Remove `AI_GATEWAY_API_KEY` from Vercel until Shop Agent is enabled

### Later / optional

- [ ] Shop Agent (card on file in Vercel AI Gateway, spending limits, bot protection)
- [ ] Vercel Web Analytics
- [ ] Shopify-managed navigation and footer menus
- [ ] Multiple languages or regions
- [ ] "Pairs Well With" products and bundles in Shopify
