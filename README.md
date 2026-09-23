cd C:\Users\Admin\Ecombio\Storefront

$readme = @'
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

Feature flags and site identity live in `lib/config/index.ts`. The production URL is `https://ecombio.com` (root domain; `www` redirects to it). Customer accounts, the Shop Agent chat assistant, analytics, and bot protection are currently disabled.

## Environment variables

Values live in Vercel (Production and Preview) and `.env.local`, never in git.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Required. Shopify store domain. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Required. Public Storefront API token. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID` | Cart attribution for the Headless storefront. |
| `SHOPIFY_WEBHOOK_SECRET` | Enables `POST /api/webhooks/shopify` (returns 404 without it). |
| `AI_GATEWAY_API_KEY` | Only needed if Shop Agent is enabled. |

## Launch status

Done:

- [x] Shopify Headless channel, storefront token, Storefront API permissions
- [x] Products published to Headless; Search & Discovery filters configured
- [x] Deployed on Vercel; `ecombio.com` is primary, `www` redirects to it
- [x] Cloudflare DNS and email records reviewed
- [x] Ecombio branding and root-domain canonicals

Remaining:

- [ ] Checkout test: full test order on the live site, including Shop Pay
- [ ] Webhooks: register product and collection topics in Shopify (JSON) pointing to `https://ecombio.com/api/webhooks/shopify`, then set `SHOPIFY_WEBHOOK_SECRET` in Vercel and redeploy
- [ ] Shopify fixes: contact-information policy email, product description typo, confirm collections are published to Headless
- [ ] DNS: DMARC record and the `store.ecombio.com` proxy setting
- [ ] Connect the GitHub repo in Vercel (Settings, Git)

Later / optional:

- [ ] Shop Agent (needs a card on file in Vercel AI Gateway, spending limits, and bot protection)
- [ ] Vercel Web Analytics
- [ ] "Pairs Well With" products and bundles in Shopify
'@

[System.IO.File]::WriteAllText("$PWD\README.md", $readme)
git diff --stat