# Project memory

Working memory for the Ecombio blog and CMS work. It is the first file an AI assistant should read in a new session, and the last one it should update.

- **Technical reference:** [`terminal-cms.md`](./terminal-cms.md) (app, scopes, scripts, runbooks, open tasks). Do not duplicate it here.
- **This file holds:** how we work, decisions made, where things stand, and lessons learned.
- **Rules for this file:** keep it short (aim for under 150 lines). No secrets, tokens, or personal data. Record what is verified, and label anything unverified. Update the "Last updated" line and the status section at the end of each session. Move finished items out instead of letting the file grow.

Last updated: 2026-10-01

## How we work

- The assistant cannot run commands. It writes PowerShell (or Python) for the user to run, and the user pastes back the output.
- **Go one step at a time and look at the result before the next step.** The user asked to slow down after a fast session. Plan first, then act.
- **Read-only first, then preview, then apply.** Nothing writes to Shopify without a preview and an explicit `-Apply`. Every write script saves a snapshot first.
- **Scripts are created as files** from single-quoted here-strings, with no backtick escapes, then parse-checked. Do not paste long patch scripts into the terminal.
- **Edits to docs are delivered as whole files**, not patch scripts.
- Shipping uses the ship block: pull, format, lint, build, `git add -A`, commit, push to `main`. The push starts a production deploy on Vercel, so read the file list before typing `y`.
- No secrets in chat. If one is pasted, rotate it.

## Project facts

- Headless Next.js storefront on Shopify. Store `ecombio.myshopify.com`, site `https://ecombio.com`. Repo root `C:\Users\Admin\Ecombio\Storefront`. PowerShell 7 in VS Code on Windows.
- Terminal CMS is a Shopify app with no UI. It issues Admin API tokens. Credentials are in `.env.local` (git-ignored).
- Local working data is in `docs\storefronts\blog\seo\` (git-ignored): script output, Semrush exports, `articles\` (local copies), `external\` (fetched pages), `snapshots\`.
- Scripts are in `cms\`. See "Scripts" in `terminal-cms.md` for what each does.
- Python 3.14 is installed. `fetch-external.py` uses only the standard library.

## Decisions made

- Shopify stays the source of truth. Local files in `docs\storefronts\blog\seo\articles\` are working copies that get pushed back.
- `docs\storefronts\blog\seo\` is git-ignored. Conclusions go in tracked docs (`seo.md`, `content-plan.md`). Raw exports stay local.
- Competitor content (Aventon) is research only. Write original posts from our own catalog. Never copy competitor text.
- E-bike maintenance and laws posts must be written so they do not compete with the existing scooter troubleshooting, brakes, and laws posts.
- Unpublishing is the planned fix for the test posts. It is reversible and removes them from the sitemap.

## Open decisions (the user's call)

1. Does the 100-post goal count only real published posts? (About 23 real posts exist, so about 77 would remain.)
2. Unpublish the test posts, or keep them and add `noindex`? The plan assumes unpublish.
3. Priority: scooter content or e-bike content? Most real posts are scooter posts, but the Semrush and competitor work so far is e-bike.

## Where things stand

Verified on 2026-09-30 and after:

- 59 articles across five blogs. About 23 real posts, 5 real topics with empty bodies, about 20 test or demo posts, about 11 landing, taxonomy, or entity entries.
- All 59 article URLs return 200, none has a `noindex` meta tag, and all are in the sitemap. The test posts are indexable today.
- Tag cleanup phase 1 is applied and verified (15 articles). Phase 2 (spelling normalization) is not done.
- Committed and pushed: the research scripts, `set-article-status.ps1`, `export-content.ps1`, `pull-articles.ps1`, `push-articles.ps1`, `fetch-external.py`, `content-plan.md`, `seo.md`, and `terminal-cms.md` (commits `ae8f4a7` and `89a2c1e`).
- 33 articles (30+ words) are pulled to `docs\storefronts\blog\seo\articles\`.
- Competitor sitemap (Aventon): 670 posts, 312 candidates, about 21 unique maintenance topics. No Semrush volume or KD for them yet.
- 12 Aventon maintenance pages were fetched. Only 4 contain the article (bike safety checks, flat tire, maintenance schedule, mechanical vs hydraulic disc brakes). 8 came back as a cookie banner of about 2,470 words with no headings. Whether the article text sits further down those files is unchecked.
- The user's own `best-electric-bikes-guide` page fetched cleanly (3,401 words, 12 H2s).

Not done yet:

- No post has been edited, unpublished, or deleted in Shopify.
- `check-live.ps1` (corrected version) has not been run or its output reviewed.
- The `git grep` for code references to the 20 test handles has not been run.
- `push-articles.ps1` has not been tested on a real post.
- No content review has happened. The files were never attached to a chat.
- The maintenance and laws addendum has not been added to `content-plan.md`.

## Plan (one step per sitting)

1. Run `check-live.ps1` and the `git grep` for the test handles. Both are read-only. This gates step 2.
2. Preview, then apply, the unpublish of the 20 test posts with `set-article-status.ps1`. Verify the sitemap and a 404 on one of them.
3. Empty real posts and the duplicate bike guide: fill or unpublish the empty ones, and merge `Best Electric Bike Guide` into `Best Electric Bikes Guide` with a redirect in the Next.js config.
4. SEO titles and descriptions for real posts. Test `push-articles.ps1` on one low-stakes post first and check the metafield, the live page, and the cache delay. Add a `Test-Shortcodes` check to the push script.
5. New posts only after Semrush volume and KD are pulled for the maintenance cluster.

## Lessons learned

- Pasting a script with `` `r`n `` into the terminal dropped the backticks and corrupted `terminal-cms.md`. Check `git diff --stat` after any doc edit. A huge diff means `git restore` it.
- The first `check-live.ps1` counted words only inside `<main>` and returned 0 everywhere, because article content streams outside `<main>`. Do not trust that column from the old version.
- `competitor-topics.csv` has no URL column. Look URLs up in `competitor-sitemap.csv` by slug.
- `export-content.ps1` overwrites its output each run, so a run with `-Handles` replaces a full export.
- Jina Reader can return a cookie-consent list instead of the article. Check the H2 count and the file contents before relying on a fetched page. A fetch of `example.com` returned 663 words, so a word count alone proves nothing.
- Run `git restore` after copying a file you want to keep, not before.
- Tag URLs do not change with case or spacing. Changing the words does.
- Article URLs are `/blogs/articles/{handle}` regardless of blog, so moving a post between blogs changes the category page, not the URL.
- `generateStaticParams` loads at most 50 articles per blog. The Articles blog has 37.

## Housekeeping

- `terminal-cms.md` "Tooling" bullet still says four scripts are uncommitted. They are committed now, so fix that on the next doc edit.
- Add `memory.md` to the related-docs lists in `README.md` and `roadmap.md` (same list as the `terminal-cms.md` task).
