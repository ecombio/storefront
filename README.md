## Updating the GitHub repository

Pushes to `main` deploy to production on Vercel automatically, so only push work you are happy to publish.

Plain `git push` fails silently on this machine (exit code 128) because git has no working GitHub credential helper. Use the push command in step 4 instead.

Run everything in PowerShell. Paste one block at a time, copy only the command and never the `PS C:\...>` prompt, and never paste a token anywhere.

1. Go to the project folder and see what changed:

```powershell
cd C:\Users\Admin\Ecombio\Storefront
git status
```

2. Stage only the files you mean to commit. Avoid `git add .`, and never stage `.env.local`:

```powershell
git add README.md
```

3. Commit with a short message:

```powershell
git commit -m "Describe the change"
```

4. Push using the GitHub CLI login:

```powershell
$t = gh auth token
$h = "Authorization: Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$t"))
git -c credential.helper= -c credential.https://github.com.helper= -c "http.extraheader=$h" push origin main
```

5. Confirm it landed. The two hashes should match:

```powershell
git ls-remote origin main
git log --oneline -1
```

6. Check the build at https://vercel.com/ecombiology/storefront/deployments. If a build fails, the previous deployment stays live. Read the build log, fix the problem, and push again. If the cause was an environment variable, fix it in Vercel and use Redeploy from the deployment's menu.

7. Close the PowerShell window so the token variable is cleared.

If the push is rejected with a 401 or a permission error, run `gh auth status`. If it shows you logged out, run `gh auth login`, then try step 4 again. If the remote has newer commits, run `git pull --rebase origin main` and push again.

---
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

## Pages and content

- **Home:** the headline and description are fixed copy in the code. The grid shows the first eight products from the relevance-ranked `/collections/all` catalog, not a hand-picked list. To control what is featured, point the grid at a specific Shopify collection.
- **Product pages:** bundles, complementary products, related products, Buy with Shop, and the quantity picker are enabled in `lib/config/index.ts`. Bundles and complementary products show nothing until they are set up in Shopify. Product data is cached and refreshed by Shopify webhooks, so edits may lag until webhooks are registered.
- **Collections and search:** `/collections/[handle]` and `/search` have no configuration toggles. Results are live, not cached. Collections and products must be published to the Headless channel to appear. Filters come from Shopify Search & Discovery. Batch size is `PRODUCTS_PER_PAGE` in `lib/collections/index.ts`.
- **Content pages:** Shopify Pages appear at `/pages/[handle]`, policies at `/policies/[handle]`, and blogs at `/blogs/[blogHandle]`. All are edited in Shopify. The webhook handler does not refresh them, so edits can stay cached until the content is revalidated. There is no `/blogs` index, so link to a specific blog. A policy only has a URL and a footer link once it has content. Unknown handles return a 404 (Shopify redirects are disabled).
- **Cart and checkout:** one Shopify cart is used everywhere and remembered in the browser for up to 14 days. Checkout is hosted by Shopify, currently on `ecombio.myshopify.com`. Shopify decides prices, discounts, and availability.

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
- [ ] Product pages: bundles and complementary products need data in Shopify; set them up or disable their flags in `lib/config/index.ts` before launch
- [ ] Home page: check the headline copy and which eight products show, and consider featuring a Shopify collection
- [ ] Content: fill in every store policy, check the footer links, and confirm edits (such as the contact-information email) show on the live site

Later / optional:

- [ ] Shop Agent (needs a card on file in Vercel AI Gateway, spending limits, and bot protection)
- [ ] Vercel Web Analytics
- [ ] "Pairs Well With" products and bundles in Shopify