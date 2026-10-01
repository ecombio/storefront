# Terminal CMS

Terminal CMS is a private Shopify app (created in the Shopify Dev Dashboard) that lets us manage store content from a terminal instead of the Shopify admin. It is used for bulk edits that would be slow or error-prone by hand, such as renaming blog post tags, fixing authors, or auditing SEO fields.

It has no user interface. It exists only to issue an Admin API access token to scripts we run ourselves.

- **Store:** `ecombio.myshopify.com`
- **Storefront:** `https://ecombio.com`
- **Previous name:** Terminal tag edits
- **Admin API version used in scripts:** `2025-01`

## Context for AI assistants

If you are an AI assistant reading this file, this is everything you need to continue the work.

- **Project:** Ecombio headless storefront (Next.js) on the Shopify store `ecombio.myshopify.com`. The repo root is `C:\Users\Admin\Ecombio\Storefront`. The user works in PowerShell 7 (`pwsh`) inside VS Code on Windows.
- **Terminal CMS:** a Shopify app with no UI. It issues Admin API tokens (client credentials grant) to scripts that edit store content. Credentials are in `.env.local` (git-ignored).
- **You cannot run commands.** Write PowerShell blocks for the user to run, and ask them to paste back only the output.
- **Never ask for or accept secrets.** If a secret is pasted, tell the user to rotate it.
- **Rules for every write job:** read current data first (paginate), save a snapshot, match items by ID, preview old → new with `$apply = $false`, apply only after the user confirms the preview, check `userErrors`, then read again to verify. Do not send `body` unless the job requires it.
- **Format source of truth:** `docs/articles.md` (shortcodes, URLs, tags, authors). `docs/cms.md` holds general content rules. `docs/pages.md` maps routes to Shopify templates. `docs/seo.md` covers SEO fields, keyword targeting, Semrush, and audits.
- **Session start:** the user runs the token block in "Getting a token" and confirms `$resp.scope`. Tokens expire, so repeat this in any new session.
- **Where things stand:** see "Current state and open work" at the end of this file.

## How it works

The app uses the client credentials grant. A script sends the app's client ID and client secret to the store and receives a short-lived Admin API access token. That token is then sent in the `X-Shopify-Access-Token` header on GraphQL requests.

Credentials live in `.env.local` (git-ignored):

```
SHOPIFY_ADMIN_CLIENT_ID=...
SHOPIFY_ADMIN_CLIENT_SECRET=...
```

Never commit these, paste them into chats, tickets, or screenshots, or add them to hosting environment variables unless a deployed feature actually needs them.

## Getting a token (PowerShell)

Run from the repository root:

```powershell
$env = @{}
Get-Content .env.local | ForEach-Object { if ($_ -match '^\s*([^#=]+?)\s*=\s*"?(.*?)"?\s*$') { $env[$matches[1]] = $matches[2] } }

$resp = Invoke-RestMethod -Method Post -Uri "https://ecombio.myshopify.com/admin/oauth/access_token" -ContentType "application/x-www-form-urlencoded" -Body @{ grant_type = "client_credentials"; client_id = $env["SHOPIFY_ADMIN_CLIENT_ID"]; client_secret = $env["SHOPIFY_ADMIN_CLIENT_SECRET"] }
$headers = @{ "X-Shopify-Access-Token" = $resp.access_token; "Content-Type" = "application/json" }
$url = "https://ecombio.myshopify.com/admin/api/2025-01/graphql.json"
$resp.scope
```

`$resp.scope` prints the scopes the token holds. Shopify lists only the highest level per scope, so `write_files` implies `read_files`. Tokens expire, so rerun this block in any new session.

Quick check that the token works:

```powershell
$q = 'query { shop { name } }'
(Invoke-RestMethod -Method Post -Uri "https://ecombio.myshopify.com/admin/api/2025-01/graphql.json" -Headers $headers -Body (@{ query = $q } | ConvertTo-Json)).data.shop.name
```

## Scopes

| Area                                      | Access         |
| ----------------------------------------- | -------------- |
| Store content (blogs, articles, comments) | read and write |
| Files                                     | read and write |
| Online store pages                        | read and write |
| Navigation (menus)                        | read and write |
| Metaobjects                               | read and write |
| Metaobject definitions                    | read only      |
| Translations                              | read and write |
| Legal policies                            | read and write |
| Locales                                   | read only      |
| Products                                  | read only      |
| Markets                                   | read only      |
| Reports                                   | read only      |

### Deliberately excluded

Orders, customers, companies, draft orders, gift cards, store credit, Shopify Payments, themes, script tags, discounts, inventory, fulfillment, shipping, and checkouts. This is a content tool and has no need for money, personal data, or commerce settings. Product access is read only so a script cannot change the catalog.

## Features and capabilities

What the app can do follows directly from its scopes. All of it is done through scripts calling the Admin API.

### Can read and change

| Area                 | What it can do                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blog posts and blogs | Edit titles, body HTML, authors, summaries, tags, featured images, SEO fields, handles, and publish status. Publish or unpublish in bulk. Read and moderate comments. |
| Pages                | Create, edit, and bulk-update content pages                                                                                                                           |
| Menus (navigation)   | View and edit navigation menus and their items. Redirects may fall under this scope as well, but this is unconfirmed, so test before relying on it.                   |
| Files                | List, upload, and update media, including alt text                                                                                                                    |
| Metaobjects          | Create and edit entries of existing types, such as author bios or FAQs                                                                                                |
| Translations         | Read and write translated content for the locales enabled on the store                                                                                                |
| Legal policies       | Edit the privacy, refund, terms, and similar policy pages                                                                                                             |

### Read only

| Area                   | What it can do                                                             |
| ---------------------- | -------------------------------------------------------------------------- |
| Products               | Audit titles, descriptions, tags, and SEO fields without changing anything |
| Metaobject definitions | Inspect the structure of custom content types, but not alter it            |
| Locales                | See which languages are enabled                                            |
| Markets                | See configured regions                                                     |
| Reports                | Pull report data                                                           |

### Cannot do

- Change products, prices, or inventory
- Access orders, customers, payments, discounts, shipping, or fulfillment
- Edit theme files
- Run any interactive or user-facing flow, since the app has no interface

### Typical jobs

- Rename, merge, and audit blog post tags
- Find posts and pages missing a meta title or description
- Find images missing alt text
- Set or correct article authors and summaries
- Find-and-replace in post bodies, such as an updated link or brand name
- Publish or unpublish batches of posts
- Review menus and policy pages
- Check translation coverage across locales

### Extending it

If a job needs a capability not listed above, add the scope through a new app version (see "Changing the app"). Prefer read-only scopes, and add write access only for the specific job that needs it. For example, `write_products` should be added only for a planned bulk product edit, and removed afterwards if it is no longer needed.

## Editing post bodies

Article bodies contain shortcodes that the storefront turns into accordions, buttons, and product strips (for example `<p>[accordion: Question?]</p>`, `<p>[/accordion]</p>`, and `<p>[products: handle-1, handle-2]</p>`). The full syntax and rules are in [`articles.md`](./articles.md), which is the single source of truth. Do not duplicate them here.

A script that edits `body` can break these without any error from Shopify, so:

- Leave `body` alone unless the job requires it. Tags, author, summary, and SEO fields can be updated without sending the body.
- Every shortcode must stay alone in its own `<p>`, exactly as `articles.md` describes.
- Every `[accordion: ...]` needs a matching `[/accordion]`.
- Product handles must match real, published products.
- Compare the shortcodes before and after each edit, and include that comparison in the preview.

A quick integrity check for accordion and product markers:

```powershell
function Test-Shortcodes([string]$body) {
  $open  = [regex]::Matches($body, '\[accordion:').Count
  $close = [regex]::Matches($body, '\[/accordion\]').Count
  $any   = [regex]::Matches($body, '\[(accordion:|/accordion\]|products:|button:)').Count
  $clean = [regex]::Matches($body, '<p>\[(accordion:[^\]]*|/accordion|products:[^\]]*|button:[^\]]*)\]</p>').Count
  [pscustomobject]@{ Balanced = ($open -eq $close); EachInOwnParagraph = ($any -eq $clean) }
}
```

Run it on the old and new body for every post in the preview, and do not apply a change where either value is `False`. Button shortcodes use the format `[button: link | label]`, and the link must start with `/` or `https://`, otherwise the storefront ignores the button.

After a write, content may stay cached on the storefront. See the caching notes in `articles.md` and `README.md` before concluding that an edit did not work.

## Tags and authors

Both affect how the storefront builds pages, so check them before bulk edits. Details are in the "Categories and tags" and "Authors" sections of [`articles.md`](./articles.md).

**Tags**

- A blog is a category. Tags are not categories, and moving a post between blogs changes its category.
- Tag chips on a category page are built from the 12 most common tags on that category's articles, and each chip links to a tag page.
- Tag URLs are case-insensitive, so `Running` and `running` share a page. Keep one spelling per tag anyway.
- Avoid near-duplicates such as `cycling` and `cycling-1`. Merging them is the intended cleanup.
- Tag URLs come from the tag text: lowercase, `&` becomes `and`, and runs of other characters become a hyphen (`tagToHandle` in `lib/blog/tags.ts`). Changing only case or spaces keeps the URL, and changing the words changes it.
- A post with no tags still works but appears on no tag page.

**Authors**

- Authors are **Author** metaobject entries (fields: name, role, bio, photo). Each entry's handle is its URL: `/blogs/author/{handle}`.
- Each post points to its author through the `custom.author_profile` metafield. The staff Author field is only a fallback. Create or update it through the Admin API with type `mixed_reference` (not `metaobject_reference`) and the GID of the Author entry as the value.
- The author page shows the photo, role, and bio from the author's **newest** post, so set `author_profile` on every post a person writes.
- A post with no profile shows the staff name with no card and no byline link.
- The Author definition already exists. Scripts should edit entries, not the definition, which is read only for this app.

## Updating tags (runbook)

A tag's page URL (`/blogs/tag/{handle}`) is built from the tag text by `tagToHandle` in `lib/blog/tags.ts` (duplicated as `tagHandle` in `components/blog/article-page.tsx`): lowercase, `&` becomes `and`, any run of other non-alphanumeric characters becomes a hyphen, and leading and trailing hyphens are trimmed. So `electric-scooters` and `Electric Scooters` share the handle `electric-scooters`, and changing only case or spacing never moves a tag page. Changing the words does (for example `cycling-1` to `cycling`). The chip label on the storefront comes from the first article seen with that handle, so mixed spellings show up inconsistently.

Do tag work in two phases:

1. **Fix and add tags using the spellings already in use.**
2. **Normalize spellings** to readable Title Case (for example `electric-scooters` to `Electric Scooters`). This is cosmetic, and URLs do not change.

Per-post changes use an exact article title as the key, with tags to add and remove. The script requires exactly one title match, matches by ID when writing, keeps all other tags, and removes duplicates. Titles with special characters (such as the en dash in "250–350 lbs") may not match. The preview reports any it skips.

```powershell
$apply = $false
$url = "https://ecombio.myshopify.com/admin/api/2025-01/graphql.json"

# Phase 1 plan, applied and verified on 2026-09-30. Rerunning it makes no changes. Kept as an example of the plan format.
$plan = [ordered]@{
  # Add tags to untagged buying guides
  'Best Commuter Electric Scooters Guide'                  = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  'best electric scooters for adults'                      = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  'Best Electric Scooters for Heavy Riders (250–350 lbs)'  = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  'Best Electric Scooters Under $1000'                     = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  'best foldable electric scooter for commute'             = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  'The Complete Guide to Folding Electric Scooters'        = @{ add = @('electric-scooters','electric-scooter-buying-guide') }
  # Add tags to other untagged posts
  'Inside the World''s Longest Electric Scooter Ride'      = @{ add = @('electric-scooters') }
  'Apollo Explore Review: Speed, Comfort & Build Quality'  = @{ add = @('electric-scooters') }
  'Kick Scooters'                                          = @{ add = @('Scootering') }
  'Best electric mountain bike guide'                      = @{ add = @('electric-mountain-bikes') }
  # Correct wrong tags
  'Best Electric Scooters Guide (2026): Reviews, Comparisons & Buying Advice' = @{ remove = @('cycling-1'); add = @('electric-scooters') }
  'Electric Scooter Buying Guide (2026 Complete Edition)'  = @{ remove = @('electric-mountain-bikes'); add = @('electric-scooter-buying-guide') }
  'Electric Scooter Accessories'                           = @{ remove = @('cycling'); add = @('electric-scooters') }
  'Electric Scooter Parts'                                 = @{ remove = @('cycling'); add = @('electric-scooters') }
  'Best Electric Bike Guide'                               = @{ remove = @('Stretching & Mobility'); add = @('Cycling Guides') }
}

$posts = @(); $after = $null
do {
  $q = 'query($after:String){ articles(first:100, after:$after){ pageInfo{hasNextPage endCursor} nodes{ id title tags blog{ title } } } }'
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json)
  $posts += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)

# Snapshot of the original values (outside the repo)
$snap = Join-Path $env:TEMP ("articles-snapshot-{0}.json" -f (Get-Date -Format yyyyMMdd-HHmmss))
$posts | ConvertTo-Json -Depth 5 | Set-Content $snap

foreach ($title in $plan.Keys) {
  $found = @($posts | Where-Object { $_.title -eq $title })
  if ($found.Count -ne 1) { Write-Host ("SKIP ({0} matches): {1}" -f $found.Count, $title) -ForegroundColor Yellow; continue }
  $p = $found[0]; $op = $plan[$title]
  $old = @($p.tags)
  $remove = @($op.remove)
  $new = @($old | Where-Object { $remove -notcontains $_ })   # -notcontains ignores case
  foreach ($t in @($op.add)) { if ($t -and ($new -notcontains $t)) { $new += $t } }
  if (($new -join '|') -ceq ($old -join '|')) { continue }
  Write-Host ("[{0}] {1}" -f $p.blog.title, $p.title)
  Write-Host ("    {0}  ->  {1}" -f ($(if ($old) { $old -join ', ' } else { '(none)' }), ($new -join ', ')))
  if ($apply) {
    $m = 'mutation($id:ID!,$tags:[String!]){ articleUpdate(id:$id, article:{tags:$tags}){ article{ id } userErrors{ field message } } }'
    $res = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $m; variables = @{ id = $p.id; tags = [string[]]$new } } | ConvertTo-Json -Depth 5)
    if ($res.errors) { Write-Host ("    GraphQL error: {0}" -f ($res.errors | ConvertTo-Json -Compress)) -ForegroundColor Red }
    elseif ($res.data.articleUpdate.userErrors) { Write-Host ("    ERROR: {0}" -f ($res.data.articleUpdate.userErrors | ConvertTo-Json -Compress)) -ForegroundColor Red }
  }
}
"Snapshot: $snap"
```

Run it once with `$apply = $false` and review the output. Then set `$apply = $true` and run it again. If a mutation error appears, paste only the error text.

To check the result, rerun the fetch loop and print the tag counts:

```powershell
$posts.tags | Group-Object | Sort-Object Name | Select-Object Name, Count | Format-Table -AutoSize
```

To normalize tag spellings everywhere (phase 2), apply a map of old tag to new tag across all articles. This uses `$posts` from the fetch loop above, so refetch first if it is stale. It matches tags ignoring case, removes duplicates ignoring case, and writes by article ID. It is cosmetic, because tag URLs do not change.

```powershell
$apply = $false
$map = @{
  'electric-scooters'             = 'Electric Scooters'
  'electric-scooter-buying-guide' = 'Electric Scooter Buying Guide'
  'electric-mountain-bikes'       = 'Electric Mountain Bikes'
  'cycling'                       = 'Cycling'
}

function Invoke-TagMap {
  foreach ($p in $posts) {
    $old = @($p.tags)
    if (-not $old) { continue }
    $new = @()
    foreach ($t in $old) {
      $n = if ($map.ContainsKey($t)) { $map[$t] } else { $t }
      if ($new -notcontains $n) { $new += $n }
    }
    if (($new -join '|') -ceq ($old -join '|')) { continue }
    Write-Host ("[{0}] {1}" -f $p.blog.title, $p.title)
    Write-Host ("    {0}  ->  {1}" -f ($old -join ', '), ($new -join ', '))
    if ($apply) {
      $m = 'mutation($id:ID!,$tags:[String!]){ articleUpdate(id:$id, article:{tags:$tags}){ article{ id } userErrors{ field message } } }'
      $res = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $m; variables = @{ id = $p.id; tags = [string[]]$new } } | ConvertTo-Json -Depth 5)
      if ($res.errors) { Write-Host ("    GraphQL error: {0}" -f ($res.errors | ConvertTo-Json -Compress)) -ForegroundColor Red }
      elseif ($res.data.articleUpdate.userErrors) { Write-Host ("    ERROR: {0}" -f ($res.data.articleUpdate.userErrors | ConvertTo-Json -Compress)) -ForegroundColor Red }
    }
  }
}

Invoke-TagMap
```

Review the preview, then run `$apply = $true; Invoke-TagMap` to apply. Afterwards, refetch and print the tag counts to verify. A merge is the same pattern with two old tags mapped to one new tag.

## Scripts

Reusable scripts live in `cms/` at the repo root. Run them from the repository root, because they read `.env.local` from the current folder:

```powershell
.\cms\create-draft-posts.ps1          # preview, writes nothing
.\cms\create-draft-posts.ps1 -Apply   # creates the drafts
```

If PowerShell blocks a script as not digitally signed, run `Set-ExecutionPolicy -Scope Process Bypass` once in that window first.

One-off runbook scripts (tag plans, tag normalization) stay inline in this file.

## SEO data

Semrush plans, keyword targeting, and SEO audits are in [`seo.md`](./seo.md).

## Working conventions

1. **Preview before applying.** Bulk scripts use an `$apply = $false` flag by default. They print every change they would make, and nothing is written until the flag is set to `$true` and the script is run again.
2. **Verify afterwards.** Re-run the read query to confirm the result.
3. **Minimum scopes.** Add a scope only when a specific job needs it, and consider removing it afterwards.

## Changing the app

**Add or remove scopes**

1. In the Dev Dashboard, open the app, go to **Versions**, and create a new version.
2. Edit the required **Scopes** field (leave **Optional scopes** empty) and release the version.
3. Approve the updated permissions on the store, or uninstall and reinstall the app.
4. Get a new token and check `$resp.scope`. Old tokens do not gain new scopes.

**Rotate the client secret**

1. Rotate it in the app's **Settings** in the Dev Dashboard.
2. Update `SHOPIFY_ADMIN_CLIENT_SECRET` in `.env.local`.
3. Get a new token to confirm it works.

Rotate immediately if the secret is ever exposed.

## Troubleshooting

- **Token request fails:** check that the app is installed on `ecombio.myshopify.com` and that the client ID and secret in `.env.local` are current.
- **Access denied on a query:** the token lacks the needed scope. Compare `$resp.scope` with the table above.
- **Token is missing newly added scopes:** the new version may not be released, or the updated permissions have not been approved on the store.

## Current state and open work

Last audit of the store's articles (update this section after each job):

- **59 articles** across five blogs: Articles, Athletes, Authors, Category, and cycling. About 20 of them look like template or demo posts (for example Button, Quote, Images Gallery, Recipe Header, Table of Contents, Social Share, FAQ Section). They have no tags, and they should stay untagged. Audit on 2026-09-30: all 56 were published (Articles 35, Athletes 2, Authors 1, Category 4, cycling 14), so the template posts are live on the storefront. The 3 new posts were published afterwards (Articles 37, cycling 15), so all 59 are published and about 28 are real content.
- **Tags in use before phase 1:** `electric-scooters` 15, `cycling` 4, `electric-scooter-buying-guide` 4, `Cycling Guides` 1, `cycling-1` 1, `electric-mountain-bikes` 1, `Scootering` 1, `Stretching & Mobility` 1. Spellings are mixed between hyphenated and readable names. `articles.md` recommends readable, consistent names.
- **Phase 1 (fixes and additions) was applied and verified on 2026-09-30:** 15 articles updated. Tag counts now: `electric-scooters` 26, `electric-scooter-buying-guide` 11, `cycling` 2, `Cycling Guides` 2, `Scootering` 2, `electric-mountain-bikes` 1. `cycling-1` and `Stretching & Mobility` are gone. The 3 new posts then added `Electric Scooters` 2 (same tag page as `electric-scooters`, so 28 combined), `Electric Bikes` 2 (new tag page), and `Cycling Guides` 1 (now 3). A snapshot of the state before phase 1 was saved in the user's temp folder as `articles-snapshot-20260930-213826.json`.

**Wrong tags found (all fixed in phase 1 except Customer Support):**

- The 2026 Best Electric Scooters Guide has `cycling-1`, and the Electric Scooter Buying Guide has `electric-mountain-bikes`.
- Electric Scooter Accessories and Electric Scooter Parts have `cycling`.
- Best Electric Bike Guide has `Stretching & Mobility`.
- Customer Support has `cycling`. It is probably not a real article, so leave it until the owner decides.

**Untagged real content:** about ten scooter and e-bike posts, tagged in phase 1.

**Open tasks:**

1. Done: the phase 1 plan was previewed and applied on 2026-09-30.
2. Phase 2: normalize the tag spellings with the map script in "Updating tags (runbook)", then update the counts in this section.
3. Decide the final readable spellings and normalize them (for example `electric-scooters` to `Electric Scooters`). Tag URLs do not change for case and spacing changes, so this is cosmetic.
4. Check which articles lack the `custom.author_profile` metafield.
5. Resolve doc conflicts: `articles.md` says the author `bio` is multi-line text, but it may have been set up as rich text. `roadmap.md` also lists `docs/requirements.md`, which does not exist.
6. Add `terminal-cms.md` and `cms.md` to the related docs lists in `roadmap.md` and `README.md`.
7. Move any hardcoded tag links inside post bodies if tag URLs change. A scan for `/blogs/tag/` in post bodies has not been run yet.
8. Done: published the three posts made by `cms/create-draft-posts.ps1`. The new `Electric Bikes` tag page is live at `/blogs/tag/electric-bikes`.
9. Decide whether the 100-post goal counts only real published posts.
10. Add featured images to the three published posts (E-Bike vs Electric Scooter, Electric Bike Classes Explained, Electric Scooter Range Explained).
11. Decide on Semrush: connect the connector or export CSVs (Keyword Magic Tool, Organic Research for `ecombio.com`, Keyword Gap), then plan the next batch of drafts around target keywords and check for cannibalization against existing posts.
