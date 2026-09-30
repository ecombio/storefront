# Yotpo reviews: project memory

What this is, how it works, why it is built this way, and what is left. Written so you can come back cold and understand it.

Last reviewed: Sep 30, 2026, at commit `384c3fc`. Reviewed: every file in `@yotpo/`, `app/api/yotpo/reviews/route.ts`, `components/product-detail/product-detail-section.tsx`, `.env.example`, `tsconfig.json`, `AGENTS.md`. Not reviewed: `lib/product/server`, `lib/shopify/id/server`, `lib/config`, `ExpertReviewsSection`, the Yotpo admin, and the Vercel dashboard. Lines marked **(verify)** depend on those.

> **Maintenance rule.** If you change anything in the Yotpo feature (code, env vars, behavior, Jira scope), update this file in the same commit. The exact rules are in section 15. Any AI assistant or human: read section 15 before finishing any Yotpo-related task.

## 1. The 60-second version

- Every product page shows a **star badge** under the title and a **Customer Reviews section** below the description tabs.
- Both read Yotpo's public widget API **on the server**, cached. No Yotpo JavaScript is loaded on the page.
- Customers write reviews in **our own form**. It posts to **our API route**, which validates it and forwards it to Yotpo. New reviews wait for Yotpo moderation before they appear.
- If Yotpo is not configured or fails, the review UI simply **disappears**. Pages never break.

## 2. Why it is built this way

- Yotpo's on-site widgets are scripts that bring their own markup and styling. This storefront is headless Next.js, so the components here render the markup themselves and Yotpo is only the data source. (Reason inferred from the code comments.)
- Server-side fetching plus `'use cache'` keeps reviews in the prerendered page and avoids a client-side request on every visit.
- Failing quiet is deliberate: a missing key or a Yotpo outage must never break the build or render of a page that imports `@yotpo`.
- Ownership (per `AGENTS.md`): the Next.js layer owns this feature (routing, caching, rendering). Yotpo is only an external data source. It never touches the Shopify cart, prices, or customer data.

## 3. The request path

**Showing reviews**

1. A visitor opens `/products/<handle>`.
2. `ProductDetailSection` turns the Shopify GID (`gid://shopify/Product/123`) into the raw number (`123`) with `getNumericShopifyId`. Yotpo needs the number.
3. `StarRating` (under the title, inside `<Suspense>`) calls `getProductRatingSummary(id)`, which calls `getProductReviews(id)`.
4. `fetchProductReviews` is cached. On a miss it calls `GET https://api.yotpo.com/v1/widget/<appKey>/products/<id>/reviews.json?page=1&per_page=50`.
5. `ProductReviews` (inside the `#reviews` wrapper, below the tabs) calls the same function with the same arguments, so it **shares the cache entry**. One Yotpo call serves both.
6. `ProductReviews` hands the data to `ReviewsBrowser`, a client component that does search, rating filter, sort and "Show more" in the browser.

**Submitting a review**

1. `WriteReviewButton` opens a native `<dialog>` form.
2. On submit it posts JSON to `/api/yotpo/reviews`: `handle, score, name, email, title, content, website`.
3. The route runs these checks in order: declared body size (8 KB), honeypot, field validation, per-IP rate limit.
4. It looks the product up by **handle** on the server (`getProduct`) and derives the numeric ID, title, URL and image itself, so a caller cannot post reviews to arbitrary products.
5. `submitReview` posts to `https://api.yotpo.com/v1/widget/reviews`.
6. The form shows "Thanks... it will appear once it has been approved."

| Route response | Meaning                                                      |
| -------------- | ------------------------------------------------------------ |
| 200 `ok`       | Sent to Yotpo, or a bot filled the honeypot (faked success). |
| 400            | Validation failed. The message says which field.             |
| 404            | Product handle not found.                                    |
| 413            | Declared body over 8 KB.                                     |
| 429            | Over 5 submissions per 10 minutes from one IP (per instance). |
| 502            | Yotpo rejected it, or something threw. Details are in the logs. |

## 4. Files

| File                                    | What it does                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `@yotpo/config.ts`                      | App key, shop domain, API URLs, sizes (50 fetched, 5 shown), cache time (3600 s), brand colors.           |
| `@yotpo/client.ts`                      | Server-only. `getProductReviews`, `getProductRatingSummary`, `submitReview`. Normalizes Yotpo's response. |
| `@yotpo/types.ts`                       | `YotpoReview`, `YotpoBottomline`, `YotpoProductReviews`, `YotpoRatingSummary`.                            |
| `@yotpo/index.ts`                       | The public surface: `StarRating`, `ProductReviews`, `submitReview`, and the types.                        |
| `@yotpo/components/star.tsx`            | `Star` (one) and `StarRow` (five, rounded to whole stars).                                                |
| `@yotpo/components/star-ratings.tsx`    | `StarRating` badge: stars, score, count, links to `#reviews`. Shows "Write a review" if there are none.   |
| `@yotpo/components/reviews-widget.tsx`  | `ProductReviews` server section, plus the empty state.                                                    |
| `@yotpo/components/reviews-browser.tsx` | Summary, clickable rating bars, search, rating filter, sort, review cards, "Show more".                   |
| `@yotpo/components/review-form.tsx`     | `WriteReviewButton`: star picker, fields, honeypot, posts to the route.                                   |
| `app/api/yotpo/reviews/route.ts`        | Validates and forwards new reviews. Outside `@yotpo/`.                                                    |
| `components/product-detail/product-detail-section.tsx` | Places the badge and the reviews section on the product page. Outside `@yotpo/`.          |
| `tsconfig.json`                         | Path aliases `@yotpo` and `@yotpo/*`.                                                                     |

`types.ts.bak` is a local backup, ignored by git (`*.bak*`). Never commit it.

## 5. Configuration

| Variable                           | Read in                           | Purpose                                                                                      |
| ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_YOTPO_APP_KEY`        | `@yotpo/config.ts`                | Yotpo app key. A public identifier, not a secret. Missing means no review UI.                |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `@yotpo/config.ts`                | Already required by the storefront. Sent to Yotpo as `domain`. Must match what Yotpo knows.  |
| `NEXT_PUBLIC_SITE_URL`             | `app/api/yotpo/reviews/route.ts`  | Optional. Origin used to build the product link sent to Yotpo. Falls back to the request origin. |

Status of these variables:

- **`.env.example` has none of the Yotpo ones, and `NEXT_PUBLIC_SITE_URL` is in no docs.** The README and `AGENTS.md` (rule 8) both require a row for every user-configurable variable the code reads.
- `NEXT_PUBLIC_SITE_URL` is easy to miss because it is read outside `@yotpo/`. The README describes the site URL as a config value (`https://ecombio.com`, localhost fallback), so the route may be able to use that shared value instead of a new variable. **(verify in `lib/config`)**
- Without `NEXT_PUBLIC_SITE_URL`, the link sent with a review is built from whichever host the visitor used, which could be a preview URL.

Find every read yourself, across the whole repo:

```powershell
git grep -n "process.env" -- '@yotpo' 'app/api/yotpo'
```

## 6. Behavior and decisions

- **Fails quiet.** No key or any Yotpo error returns `null` and the components render nothing. Errors are logged with `console.error` and never cached (the cached function throws, the public ones catch).
- **Caching.** Tags `yotpo-reviews` and `yotpo-reviews-<productId>`. Fresh 300 s, revalidated after 3600 s, expires after 24 h. A new approved review can take up to an hour to show.
- **Timeouts.** Every Yotpo call aborts after 5 s.
- **Filters and sort run in the browser** over the 50 fetched reviews. Sort: most recent, highest, lowest, most helpful.
- **Stars rounded.** `StarRow` rounds the score, so 4.4 shows four full stars.
- **Empty state.** With no reviews: a "Write a review" link in the badge slot, and a text plus button in the section.
- **Spam defenses (three layers):** honeypot field, an in-memory per-IP limiter (5 per 10 minutes), and Yotpo's own moderation. The limiter is per serverless instance, so it only slows casual abuse. The route's own comment recommends a Vercel Firewall rate-limit rule and/or BotID. The README lists bot protection as disabled.
- **`submitReview` needs a shop domain.** It returns `false` and logs if `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` is empty.

## 7. Gotchas

1. **Numeric ID, not GID.** Passing the GraphQL GID to Yotpo silently returns 0 reviews. Always use `getNumericShopifyId`.
2. **Suspense is required.** `cacheComponents` is on, so async Server Components (`StarRating`, `ProductReviews`) must be wrapped in `<Suspense>` where used.
3. **`@yotpo` is server-side code in a client-looking package.** `index.ts` re-exports `submitReview` from `client.ts`, which imports `server-only`. Import `@yotpo` only from server components and route handlers. Importing it from a client component breaks the build.
4. **Two validators.** The form (`review-form.tsx`) and the route (`route.ts`) both enforce limits: title 100, content 10 to 2000, name 60, email 254. Change both together. The route is the one that counts.
5. **Yotpo's create-review field names are unconfirmed.** `client.ts` says so and logs the error body on rejection. Watch the Vercel logs on the first live test.
6. **PowerShell and the `@`.** In PowerShell `@` means splatting, so quote the folder: `git add '@yotpo'`, `git ls-files '@yotpo'`.
7. **Line endings.** Scripts that rewrite a file can switch it from Unix to Windows line endings, which makes git show every line as changed. Edit files in VS Code rather than with scripts, and consider a `.gitattributes` with `* text=auto`.
8. **Don't confuse with Expert Reviews.** `ExpertReviewsSection` in the Description tab is a separate feature, not Yotpo. **(verify what feeds it)**
9. **Pushes to `main` deploy to production.** Docs-only pushes are safe; anything in `@yotpo/` should go through the README's push block (format, lint, build).
10. **`@yotpo/index.ts` is a barrel on purpose.** `AGENTS.md` says no barrel files, but `@yotpo` and `@yotpo/*` are path aliases in `tsconfig.json` and the app imports only from `@yotpo`. Do not delete it or rewrite those imports unless that is the task.

## 8. Known limits

- **Only the newest 50 reviews are fetched** (page 1). Search, filters, sort and "Show more" work on those 50. The summary and rating bars count all reviews, so clicking a bar can show fewer reviews than its number.
- **Whole stars only.**
- **Text only.** `YotpoReview` has no fields for photos or video, verified-buyer badges, or store replies. The avatar is a plain circle.
- **Helpful votes are display-only.**
- **No review structured data** (schema markup) for search engines.
- **Unused `brand` settings** in `config.ts` (`primaryColor`, `textColor`, fonts, `lineSeparatorStyle`). Only `starsColor` is read.
- **Limiter is per instance.** See section 6.
- **Body size check trusts `content-length`.** A request without the header skips it. Low risk, worth knowing.
- **Review creation is unverified against the live Yotpo account.**

## 9. Where to change things

| I want to...                               | Edit                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Fetch or show more reviews, change caching | `config.ts` (`reviewsFetchLimit`, `reviewsPerPage`, `revalidateSeconds`) |
| Change the star color                      | `config.ts` (`brand.starsColor`)                                       |
| Change the badge layout                    | `components/star-ratings.tsx`                                          |
| Move the badge or the reviews section      | `components/product-detail/product-detail-section.tsx`                 |
| Add a sort option                          | `SORT_LABELS` and the `switch` in `reviews-browser.tsx`                |
| Change form fields or limits               | `review-form.tsx` **and** `route.ts`                                   |
| Change rate limit numbers                  | `route.ts` (`WINDOW_MS`, `MAX_PER_WINDOW`)                             |
| Change what is sent to Yotpo               | `client.ts` (`submitReview`)                                           |
| Handle new fields from Yotpo               | `types.ts` and the normalizing block in `fetchProductReviews`          |
| Refresh reviews sooner                     | Revalidate the cache tag `yotpo-reviews-<productId>`                   |

## 10. How to test

1. **Local:** put `NEXT_PUBLIC_YOTPO_APP_KEY` in `.env.local`, run `pnpm dev`, open a product that has reviews. With no key nothing shows, and that is correct.
2. **Live, reading:** a product with reviews shows the badge under the title, clicking it scrolls to the reviews, and search, rating filter, rating bars and sort work.
3. **Live, writing:** submit a test review with an email you own. Expect the success message. It should appear in Yotpo's moderation queue, not on the page. Decline it in Yotpo afterwards.
4. **Failure check:** if step 3 errors, open the function logs in Vercel and search for "Yotpo". The logged response body says which field Yotpo disliked.
5. **Rate limit:** six quick valid submissions from one IP should return 429 on the sixth (per instance, so it may vary).

## 11. Jira (project YOTPO)

24 tasks, all created as To Do on Sep 30, 2026. Only YOTPO-7 has a priority (Highest).

| Task                               | State in code                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| YOTPO-7 Star Ratings               | Built (`StarRating`). Verify on the live site, then move to Done.             |
| YOTPO-8 Reviews Sorting            | Built, four options, browser-side. Verify, then Done.                         |
| YOTPO-16 Custom views & filters    | Partial: search, rating filter, rating bars. No saved or alternate views.     |
| YOTPO-9 Reviews Tab                | Reviews are a section, not a tab. Decide what the task means.                 |
| YOTPO-10 Reviews Moderation        | Handled by Yotpo (new reviews wait for approval). No moderation UI here.      |
| YOTPO-17 Media front-and-center    | Not started. Types have no media fields.                                      |
| YOTPO-22 Reviewer Badges           | Not started.                                                                  |
| YOTPO-13 Review Comments           | Not started.                                                                  |
| YOTPO-18 SEO Page                  | Not started. No review schema markup.                                         |
| All the others                     | Not started in this folder. Some look like Yotpo plan extras (Live Chat Support, Email Analytics Dashboard, Kick-start Credits) and may become "not building". **(verify)** |

Groups: displaying (7, 9, 8, 16, 17, 22, 18, 23, 24, 15), collecting (2, 3, 5, 1, 4), managing (10, 11, 12, 14, 13), reporting and support (19, 20, 21).

## 12. Open items, in order

- [ ] **Vercel:** confirm `NEXT_PUBLIC_YOTPO_APP_KEY` is set for Production and Preview and redeploy if it was just added. Set `NEXT_PUBLIC_SITE_URL=https://ecombio.com`, or change the route to use the shared site config.
- [ ] **`.env.example`:** add rows for `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_YOTPO_APP_KEY` (optional block, alphabetical, after `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID`).
- [ ] **Vercel Firewall:** add a rate-limit rule on `/api/yotpo/reviews`. Consider BotID.
- [ ] **Live test** (section 10): stars, reviews, then a test submission into the moderation queue.
- [ ] **README:** variables table rows, a short Yotpo section pointing here, and a Launch status item.
- [ ] **Jira:** move YOTPO-7 and YOTPO-8 after the live test. Decide build or skip for the rest.
- [ ] Later: fetch beyond 50 reviews, half stars, remove unused `brand` settings, photos and badges, review schema markup, `.gitattributes`.
- [ ] Later: bring `@yotpo` in line with the `AGENTS.md` code style (banner comments, alphabetized exports and config keys, `{Name}Props` interfaces), or record the exceptions here.

## 13. Glossary

- **App key (`appkey`):** Yotpo's public ID for our store. Goes in the API URL.
- **Bottomline:** Yotpo's summary block: total review count, average score, star distribution.
- **Star distribution:** how many reviews gave 1, 2, 3, 4 and 5 stars. Drives the rating bars.
- **Handle:** the URL slug of a product (`/products/<handle>`). The form sends this, never an ID.
- **GID vs numeric ID:** Shopify's GraphQL ID (`gid://shopify/Product/123`) versus the plain `123` that Yotpo wants.
- **Moderation:** Yotpo holds new reviews until approved, so they do not show immediately.
- **Honeypot:** a hidden form field real people leave empty and bots fill in.
- **`'use cache'` and `cacheTag`:** Next.js caching for server functions, with tags used to refresh specific entries.
- **`cacheComponents`:** the Next.js mode this project uses. It requires `<Suspense>` around async server components.
- **`server-only`:** an import that makes the build fail if the file is pulled into client code.

## 14. Not in this repo

- `yotpo-on-site-widgets.md` (plan tiers, API findings, roadmap) does not show up in `git ls-files`. If it still exists, keep it somewhere you will find it, and link it here. Notes from earlier sessions say the Yotpo plan is Free and that "v0.3.0 test calls" against the live account are pending. **(verify in the Yotpo admin)**

## 15. Keeping this file current (rules for any AI assistant and humans)

This file is the project's memory for the Yotpo feature. It is only useful if it matches the code. Follow these rules whenever you work on anything Yotpo-related.

### When the rules apply

Any change that touches one of these:

- anything under `@yotpo/`
- `app/api/yotpo/**`
- the Yotpo parts of `components/product-detail/product-detail-section.tsx` (`StarRating`, `ProductReviews`, `numericProductId`, the `#reviews` wrapper)
- the `@yotpo` aliases in `tsconfig.json`
- any environment variable the Yotpo code reads, in `.env.example`, the README, or Vercel
- Yotpo behavior a visitor can see (what shows, where, when, and what the form says)
- the Yotpo Jira project (YOTPO), when a task is finished, dropped, or redefined

If none of these apply, do not edit this file.

### What to do, in order

1. **Read this whole file before you change code**, so you know the decisions already made and do not undo them.
2. **Make the code change.**
3. **Before you finish, reopen this file** and update every section the change affects, using the table below. Do it in the same commit as the code, never as a follow-up.
4. **Update the header line.** Change the "Last reviewed" date to today's date. Put in the short commit hash once it exists. If you only reviewed some files, list which.
5. **Say what you changed in your final reply:** one line per section edited. If you decided no doc change was needed, say why in one line.

### Which section to update

| If you changed...                                     | Update these sections                                  |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Any file, added, renamed, deleted, or its job changed | 4 (Files), and 3 (request path) if the flow changed    |
| How reviews are fetched, cached, or normalized        | 3, 6 (Behavior), 8 (Known limits)                      |
| Form fields, validation, limits, or the route         | 3 (response codes), 6, 7 (gotcha 4), 9                 |
| Rate limiting or spam protection                      | 6, 8, 12 (Open items)                                  |
| Any `process.env` read                                | 5 (Configuration), 12, and the three places below      |
| Where or how the badge or section appears on the page | 3, 4, 9                                                |
| Something that fixes a limitation                     | Remove it from 8, note it in 6 if it changes behavior  |
| Something that adds a limitation or a workaround      | Add it to 8 or 7                                       |
| A Jira task finished, dropped, or redefined           | 11 (Jira), 12                                          |
| A to-do in section 12 was done                        | Tick it or delete it. Add new to-dos you create.       |
| A new term that a newcomer would not know             | 13 (Glossary)                                          |

### Environment variables: keep three places in sync

Whenever a Yotpo-related variable is added, renamed, removed, or changes meaning, update all three in the same commit:

1. Section 5 of this file.
2. `.env.example` (optional block, alphabetical, with a short comment).
3. The README environment variables table.

Find every read across the repo, not just the Yotpo folder:

```powershell
git grep -n "process.env" -- '@yotpo' 'app/api/yotpo'
```

Never write real keys, tokens, or secrets into this file, `.env.example`, or the README. Use placeholders.

### Accuracy rules

- Only state what you have read in the code. If you did not read the code behind a statement, mark it **(verify)** and say so in your reply.
- Remove a **(verify)** marker only after you have read the code that proves it.
- Do not guess what Yotpo's API does. If the code comment or the live behavior is the only evidence, say that.
- When code and this file disagree, the code is right. Fix the file, and mention the mismatch in your reply.
- Follow the comment rules in `AGENTS.md`: code comments are terse one-line guardrails, and explanations belong in this file. Before you trim or remove a long comment in `@yotpo`, make sure its facts are here. Do not strip comments as a side effect of unrelated work, and keep every comment you leave accurate.
- Where this file and `AGENTS.md` disagree, `AGENTS.md` wins, except for the exceptions recorded in section 7 (gotcha 10).

### Style rules

- Make small, targeted edits. Do not rewrite sections the change did not affect.
- Describe what is, not what changed. Avoid "now", "previously", "updated to". Git history is the changelog. (This follows the `AGENTS.md` rule to describe the product rather than the change.)
- Keep the section numbers, table layouts, and plain wording. Short sentences, no marketing language.
- Use the same terms as the code (`StarRating`, `ProductReviews`, `bottomline`, `handle`).
- Edit with your file-editing tools, and keep the file's existing line endings. Do not rewrite the whole file with a PowerShell script. That once converted `.gitignore` to Windows line endings.
- Keep the file under about 350 lines. If it grows past that, move detail into a separate file and link it.

### Before you finish: checklist

- [ ] Did I read this file before changing code?
- [ ] Did I update every section the change affects?
- [ ] Are the "Last reviewed" date and hash current?
- [ ] If an env var changed: are section 5, `.env.example`, and the README all updated?
- [ ] Are the Known limits (section 8) and Open items (section 12) still true?
- [ ] Are there new **(verify)** markers, and did I mention them in my reply?
- [ ] Are the code and this file in the same commit?

### How these rules reach each tool

This section is the single source of truth. Everything else only points here, so the rules cannot drift apart.

| Where                                                                  | Reaches                                                                 |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| This file, section 15                                                  | The canonical rules.                                                    |
| `AGENTS.md` (the Yotpo block)                                          | Coding agents that read `AGENTS.md`.                                    |
| One-line comments at the top of `@yotpo/index.ts` and `app/api/yotpo/reviews/route.ts` | Any model that opens those files, in any tool.          |
| The prompt below                                                       | Chat tools that cannot see the repo.                                    |
| Optional one-line pointer files (for example `CLAUDE.md` containing `@AGENTS.md`) | Tools that read their own instruction file. Add only for tools you use. |

### Prompt to paste into any AI chat

Use this with any assistant that cannot read the repo. Paste it first, then this file, then the code files involved.

```text
You are changing the Yotpo reviews feature of a Next.js storefront.

1. I will paste yotpo.md. Read all of it before proposing any change, and follow its section 15.
2. Make the code change, then also output the full text of every yotpo.md section the change affects.
3. If an environment variable is added, renamed, or removed, also give the exact new rows for .env.example and the README variables table.
4. State only what you can see in the code I paste. Mark anything else (verify).
5. Describe what is, not what changed. No "now" or "previously".
6. Never include real keys, tokens, or secrets.
7. End with: the list of yotpo.md sections you changed, and any (verify) markers you added.
```
