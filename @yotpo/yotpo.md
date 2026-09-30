# Yotpo reviews

Custom headless review components for the Ecombio storefront, replacing Yotpo's on-site widgets. Yotpo is the data source; the markup and styling are ours.

> Lines marked **(verify)** were written without reading the code. Check each one against the source, then delete the marker.

## What's in this folder

| File                          | Role                                                     |
| ----------------------------- | -------------------------------------------------------- |
| `config.ts`                   | Reads the Yotpo settings. **(verify)**                   |
| `client.ts`                   | Calls to the Yotpo API. **(verify)**                     |
| `types.ts`                    | Shared types.                                            |
| `index.ts`                    | Public exports for the rest of the app.                  |
| `components/star.tsx`         | A single star, used by `star-ratings.tsx`. **(verify)**  |
| `components/star-ratings.tsx` | Average rating and review count. **(verify)**            |
| `components/reviews-widget.tsx` | Reviews list on the product page. **(verify)**         |
| `components/reviews-browser.tsx` | Browse and filter reviews. **(verify)**               |
| `components/review-form.tsx`  | Form to submit a review. **(verify)**                    |

`types.ts.bak` is a local backup and is ignored by git (`*.bak*`). Don't commit it.

## Configuration

| Variable                     | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_YOTPO_APP_KEY`  | Yotpo app key. **(verify the name and whether anything else is read)** |

Every variable the code reads needs a row here, in the README's environment table, and in `.env.example`. To list them:

```powershell
git grep -n "process.env" -- '@yotpo'
```

Creating reviews also needs `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, which the README already covers. **(verify)**

## Behavior

- The components render nothing when Yotpo isn't configured. **(verify)**
- Current Yotpo plan: Free. **(verify)** A `NEXT_PUBLIC_YOTPO_PLAN` setting is planned but doesn't exist in `config.ts` yet.

## Status

Tasks are tracked in the Jira project YOTPO (24 tasks, all To Do and labeled Research when created on Sep 30, 2026). Only **YOTPO-7 Star Ratings** has a priority (Highest).

| Area                 | Tasks                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Displaying reviews   | YOTPO-7 Star Ratings, -9 Reviews Tab, -8 Reviews Sorting, -16 Custom views & filters, -17 Media front-and-center, -22 Reviewer Badges, -18 SEO Page, -23 Widget Interface Language, -24 Read-Only Reviews Widget (Legacy), -15 Pre-defined templates |
| Collecting reviews   | YOTPO-2 Automatic Review Requests, -3 Reminder Review Requests, -5 Email Templates Library, -1 Kick-start Credits, -4 Reviews Import                                               |
| Managing reviews     | YOTPO-10 Reviews Moderation, -11 Sentiment and Profanity Check, -12 Advanced Auto Publish, -14 Review Tagging, -13 Review Comments                                                |
| Reporting and support| YOTPO-19 Reviews Dashboard, -20 Email Analytics Dashboard, -21 Live Chat Support                                                                                                    |

Some of these (for example Live Chat Support, Email Analytics Dashboard, Kick-start Credits) look like Yotpo plan extras rather than storefront widgets and may end up as "not building". **(verify)**

## Open items

- [ ] Run the v0.3.0 test calls against the live Yotpo account. **(verify)**
- [ ] Add the Yotpo variables to `.env.example`.
- [ ] Add the Yotpo section and variable rows to the README.
- [ ] Decide which Jira tasks are "build" and which are "skip".
