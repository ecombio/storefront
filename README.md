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

Customer sign-in needs a public HTTPS origin, so test it on production or through an HTTPS tunnel, not plain `localhost`.

## Configuration

Feature flags and site identity live in `lib/config/index.ts`. The production URL is `https://ecombio.com` (root domain; `www` redirects to it). Customer accounts are enabled. The Shop Agent chat assistant, analytics, and bot protection are currently disabled.

## Customer accounts

Sign-in uses Shopify Customer Accounts through a confidential Customer Account API client on the Headless storefront.

- Callback URI: `https://ecombio.com/account/authorize`
- Logout URI: `https://ecombio.com/`
- Shopify does not allow wildcard URIs, so register every preview or tunnel origin that needs sign-in.
- Rotating `CUSTOMER_ACCOUNT_SESSION_SECRET` signs out all customers.

## Environment variables

Values live in Vercel (Production and Preview) and `.env.local`, never in git.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Required. Shopify store domain. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Required. Public Storefront API token. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID` | Cart attribution for the Headless storefront. |
| `CUSTOMER_ACCOUNT_SESSION_SECRET` | Required while customer accounts are enabled. Session encryption secret. |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Required while customer accounts are enabled. Confidential client ID. |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET` | Required while customer accounts are enabled. Confidential client secret. |
| `SHOPIFY_WEBHOOK_SECRET` | Enables `POST /api/webhooks/shopify` (returns 404 without it). |
| `AI_GATEWAY_API_KEY` | Only needed if Shop Agent is enabled. |

## Launch status

Done:

- [x] Shopify Headless channel, storefront token, Storefront API permissions
- [x] Products published to Headless; Search & Discovery filters configured
- [x] Deployed on Vercel; `ecombio.com` is primary, `www` redirects to it
- [x] GitHub repo connected to Vercel; pushes to `main` deploy to production
- [x] Cloudflare DNS and email records reviewed
- [x] Ecombio branding and root-domain canonicals
- [x] Customer accounts: Shopify client, callback and logout URIs, env vars, and deployment

Remaining:

- [ ] Sign-in test: log in at `/account/login`, check profile, orders, addresses, and logout
- [ ] Cart test: add, change quantity, remove, discount code, cart carries over after sign-in
- [ ] Checkout test: full test order on the live site, including Shop Pay
- [ ] Branded checkout domain: connect `checkout.ecombio.com` in Shopify (Settings, Domains); decide whether to make it primary
- [ ] Webhooks: register product and collection topics in Shopify (JSON) pointing to `https://ecombio.com/api/webhooks/shopify`, then set `SHOPIFY_WEBHOOK_SECRET` in Vercel and redeploy
- [ ] Shopify fixes: contact-information policy email, product description typo, confirm collections are published to Headless
- [ ] DNS: DMARC record and the `store.ecombio.com` proxy setting

Later / optional:

- [ ] Shop Agent (needs a card on file in Vercel AI Gateway, spending limits, and bot protection)
- [ ] Vercel Web Analytics
- [ ] "Pairs Well With" products and bundles in Shopify