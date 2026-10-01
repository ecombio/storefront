# SEO

How we handle search optimization for the Ecombio blog. This file covers SEO fields, keyword targeting, Semrush, and audits. It does not repeat other docs:

- [`articles.md`](./articles.md) is the source of truth for post format (shortcodes, URLs, tags, authors).
- [`terminal-cms.md`](./terminal-cms.md) covers the Terminal CMS app, tokens, and scripts.
- [`cms.md`](./cms.md) holds general content rules.

Store: `ecombio.myshopify.com`. Storefront: `https://ecombio.com`.

## Goal and current state

The goal is 100 blog posts. State as of 2026-09-30:

- 59 articles, all published. About 28 are real content, and about 20 are template or demo posts (Button, Quote, FAQ Section, Table of Contents and similar).
- The three newest posts have an SEO title, an SEO description, a summary, and an author profile: E-Bike vs Electric Scooter, Electric Bike Classes Explained, and Electric Scooter Range Explained.
- Whether the 100 counts only real published posts has not been decided (see `terminal-cms.md`, open task 9).

## Where SEO fields live

| Field           | Where it is set                                                    |
| --------------- | ------------------------------------------------------------------ |
| SEO title       | Article metafield `global.title_tag`                               |
| SEO description | Article metafield `global.description_tag`                         |
| Handle (URL)    | Article `handle`, which becomes `/blogs/{blog}/{handle}`           |
| Summary         | Article `summary`                                                  |
| Tags            | Article `tags`, which also build the tag pages `/blogs/tag/{tag}`  |
| Author          | `custom.author_profile` (type `mixed_reference`) plus staff author |
| Body            | Article `body`, written to the rules in `articles.md`              |

`docs/apps/terminal-cms/scripts/create-draft-posts.ps1` sets all of these when it creates a draft. If the SEO metafields ever cause an error, set `$withSeo = $false` in that script and add the SEO text in Shopify admin instead.

## Per-post checklist

Before a post is published:

1. **One primary keyword.** Pick one search term the post is for, and record it in the tracking table below.
2. **SEO title.** Include the primary keyword, written for a person to click. As a rule of thumb, stay under about 60 characters, because search engines cut titles by pixel width and the limit is not exact.
3. **SEO description.** Say what the reader gets. As a rule of thumb, stay under about 155 characters. It does not need to repeat the title.
4. **Handle.** Short, lowercase, hyphenated, and based on the keyword. Do not change it after publishing unless a redirect is in place.
5. **No H1 in the body.** The storefront supplies the title. Start with a paragraph, then `<h2>` sections, as `articles.md` describes.
6. **Internal links.** Link to related posts and use product strips with real, published product handles.
7. **Tags and author.** At least one tag, and `author_profile` set.
8. **Featured image.** Add one, with alt text.
9. **Cannibalization check.** Make sure no existing post already targets the same keyword (see below).
10. **Shortcode integrity.** Run the `Test-Shortcodes` check from `terminal-cms.md`.

## Keyword targeting and cannibalization

Keyword cannibalization means two of our own pages compete for the same search, so neither ranks as well as one strong page would.

The blog already has several overlapping scooter guides (Best Commuter, For Adults, Under $1000, For Heavy Riders, Foldable for Commute). Adding about 70 more posts raises the risk, so:

- Give every post its own primary keyword, and write it in the tracking table.
- Before writing a new post, search the table and the live blog for the same or a very similar keyword.
- If two posts do overlap, either merge them, or change one to target a different keyword and link the two to each other.
- Changing a published post's URL needs a redirect, so check that redirects work for this app before relying on it (the Navigation scope may cover them, but this is unconfirmed).

Semrush's Keyword Cannibalization report is only on the Guru and Business plans (see below). On Pro, export Organic Rankings for `ecombio.com` and look for keywords that rank with more than one of our URLs.

### Tracking table

Fill this in as keywords are chosen. Add a row for every published real post over time.

| Post                             | Blog     | Handle                             | Primary keyword | Notes |
| -------------------------------- | -------- | ---------------------------------- | --------------- | ----- |
| E-Bike vs Electric Scooter       | Articles | `e-bike-vs-electric-scooter`       |                 |       |
| Electric Bike Classes Explained  | cycling  | `electric-bike-classes-explained`  |                 |       |
| Electric Scooter Range Explained | Articles | `electric-scooter-range-explained` |                 |       |

## Semrush

Semrush data is used to pick topics by search demand and difficulty instead of guesswork.

**Connection status as of 2026-09-30:** the Semrush connector is available in Claude's directory but is not connected. Exported CSVs work on any plan, so the connector is not required to plan a batch. The pricing page lists "MCP Access" only under Business; whether the Claude connector needs that tier is unconfirmed, so check before paying for it.

**Which plan we are on:** not recorded yet. Fill in here once known: ______

### Plans (SEO Toolkit)

Taken from Semrush's pricing page on 2026-09-30. The page has a Monthly/Annually toggle and says annual billing saves up to 17%, so confirm which period the prices were for. Prices and limits change, so check the page before buying.

|                                                                                         | Pro        | Guru       | Business   |
| --------------------------------------------------------------------------------------- | ---------- | ---------- | ---------- |
| Price shown                                                                             | $139.95/mo | $249.95/mo | $499.95/mo |
| Websites to monitor                                                                     | 5          | 15         | 40         |
| Keywords tracked daily                                                                  | 500        | 1,500      | 5,000      |
| Keyword research, competitor analysis, Position Tracking, Backlink Analysis, Site Audit | Yes        | Yes        | Yes        |
| Keyword Cannibalization report                                                          | No         | Yes        | Yes        |
| Topics (Topic Research)                                                                 | No         | Yes        | Yes        |
| Historical data                                                                         | No         | Yes        | Yes        |
| Multi-location and device data, content marketing tools                                 | No         | Yes        | Yes        |
| AI Search Site Audit                                                                    | No         | Yes        | Yes        |
| JavaScript rendering in crawls                                                          | No         | Yes        | Yes        |
| Looker Studio integration                                                               | No         | Yes        | Yes        |
| Pages crawled per month                                                                 | 100,000    | 300,000    | 1,000,000  |
| Results per report                                                                      | 10,000     | 30,000     | 50,000     |
| Reports per day                                                                         | 3,000      | 5,000      | 10,000     |
| Targets per monitored website                                                           | 1          | 10         | Unlimited  |
| Share of Voice tracking                                                                 | No         | No         | Yes        |
| API access and MCP access                                                               | No         | No         | Yes        |

An earlier plan description used different names ("Everything in Starter, plus": monitor 100 prompts and 1,500 keywords daily, history since 2012, content optimization with AI, multi-targeting, keyword cannibalization). Its 1,500 keywords, history, and cannibalization match the Guru column, but confirm which plan name that text came from.

### Which features matter for the 100-post goal

- **Pro is enough to start.** It includes the Keyword Magic Tool, Keyword Gap, Organic Rankings, Top Pages, and Site Audit. Its 500 tracked keywords is about the limit for 100 posts at 3 to 5 keywords each.
- **Pro lacks two things we would like:** the cannibalization report and Topic Research.
- **Guru adds** the cannibalization report, Topic Research, and history. The cannibalization report is the most useful one for this blog.
- **Not needed now:** content optimization with AI (drafts are already written through the script), multi-targeting (only useful when selling in several countries or caring about engines beyond Google), Share of Voice, and API access.

### Tools in the SEO toolkit and what we use them for

| Tool                                                                      | Use                                                                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Organic Rankings (`ecombio.com`)                                          | What we already rank for, and which keywords have two of our URLs                                                                    |
| Top Pages (`ecombio.com`)                                                 | Which existing posts get search traffic, so we know which to protect or rework                                                       |
| Keyword Magic Tool                                                        | Topic ideas with volume and difficulty, one export per seed: `electric scooter`, `electric bike`, `electric skateboard`, `one wheel` |
| Keyword Gap                                                               | Topics competitors rank for that we do not. Competitors: not chosen yet                                                              |
| Topic Research (Guru and up)                                              | Questions to use in the FAQ accordions                                                                                               |
| Keyword Overview                                                          | Quick check of one keyword before committing to a post                                                                               |
| Site Audit                                                                | One-time crawl. Its list of issues helps decide what to do with the template posts                                                   |
| Position Tracking                                                         | Add each post's keywords once it is live                                                                                             |
| SEO Writing Assistant, On Page SEO Checker                                | Polish finished drafts. Later, not for choosing topics                                                                               |
| Backlinks, Referring Domains, Backlink Audit, Backlink Gap                | Link building. Not needed for this goal                                                                                              |
| Compare Domains, Sensor, SEOquake, Semrush Rank, Organic Traffic Insights | Not needed for now                                                                                                                   |

### Exports to attach in the chat (in order)

1. Organic Rankings for `ecombio.com`, top few hundred rows.
2. Top Pages for `ecombio.com`.
3. Keyword Magic Tool for each of the four seeds. Sort by volume, filter out very high difficulty, and export keyword, volume, difficulty, and intent.
4. Keyword Gap against two or three competitors.
5. Topic Research for `electric scooter` and `e-bike` (Guru and up).

## Workflow for a new batch of posts

1. Get keyword data (Semrush connector or exported CSVs).
2. Pick topics by volume against difficulty, grouped by cluster: scooters, e-bikes, skateboards, one-wheel boards.
3. Check each topic against the tracking table for overlap.
4. Write the drafts, one primary keyword each, with SEO title and description built around it.
5. Create them as drafts with `docs/apps/terminal-cms/scripts/create-draft-posts.ps1` (preview first, then `-Apply`).
6. Review in Shopify admin, add featured images, then publish.
7. Check the live URLs return 200, and add the keywords to Position Tracking.
8. Update the tracking table and the counts in `terminal-cms.md`.

## Audits from the terminal

These use `$url` and `$headers` from the token block in `terminal-cms.md`. They only read data.

Published posts missing an SEO title or description:

```powershell
$rows = @(); $after = $null
do {
  $q = 'query($after:String){ articles(first:100, after:$after){ pageInfo{hasNextPage endCursor} nodes{ id title handle isPublished blog{ handle } seoTitle: metafield(namespace:"global", key:"title_tag"){ value } seoDesc: metafield(namespace:"global", key:"description_tag"){ value } } } }'
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json)
  $rows += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)

$rows | Where-Object { $_.isPublished -and (-not $_.seoTitle.value -or -not $_.seoDesc.value) } |
  ForEach-Object { "{0}/{1} | SEO title: {2} | SEO description: {3}" -f $_.blog.handle, $_.handle, [bool]$_.seoTitle.value, [bool]$_.seoDesc.value }
```

Using the same `$rows`, SEO titles that are duplicated or longer than about 60 characters:

```powershell
$rows | Where-Object { $_.seoTitle.value } | Group-Object { $_.seoTitle.value } | Where-Object Count -gt 1 | Select-Object Count, Name
$rows | Where-Object { $_.seoTitle.value.Length -gt 60 } | ForEach-Object { "{0} chars | {1}/{2}" -f $_.seoTitle.value.Length, $_.blog.handle, $_.handle }
```

To fill in missing SEO fields in bulk, follow the write rules in `terminal-cms.md`: save a snapshot, preview with `$apply = $false`, write by article ID, check `userErrors`, then read again.

## Open decisions

1. **Semrush plan.** Which plan to use (Pro is enough to start; Guru adds the cannibalization report and Topic Research), and whether to connect the connector or use exports.
2. **Competitors** for Keyword Gap. Two or three domains.
3. **Template and demo posts.** About 20 are published and live on the storefront. Decide whether to leave them, or unpublish them so they do not appear in search results and the sitemap.
4. **What counts toward 100.** Real published posts only, or any article.
5. **Featured images and alt text** for the three newest posts.
6. **Redirect support.** Test whether this app can manage redirects before any handle change.

## Keyword map (Semrush, 2026-09-30, seed: electric bike)

Targets (volume, KD): pedal assist electric bike (8.1k, 19); foldable/folding electric bike (27k/18k, 40); electric bike conversion kit (14.8k, 31); how to convert a bike to electric diy (9.9k, 35); electric mountain bike (18k, 28); fat tire electric bike (12k, 36); electric commuter bike (8.1k, 28); cheap/affordable electric bike (9.9k, 33/32); fastest electric bike (8.1k, 22); electric bike for kids (8.1k, 14); three wheel electric bike (8.1k, 34).
Skip: brand, "near me", "for sale", retailer, and misspelling queries.
Pillar to build toward: electric bike for adults (60.5k, 49).

## Question-keyword map (Semrush Questions tab, seed: electric bike, 2026-09-30)

One post per cluster (variants share a SERP):

- Cost: how much does an electric bike cost (15k+ combined, KD 8-46)
- What is an e-bike (~12k, KD 35-66)
- Speed: how fast do electric bikes go / fastest e bike (~8k + 8.1k, KD 11-22)
- License: do you need a license for an electric bike (~3k, KD 5-24)
- Street legal: are e bikes street legal (~2.7k, KD 14-32)
- How e-bikes work (~4k, KD 16-26)
- Do you have to pedal (~740, KD 5-11)
- Rain / waterproof (~1k, KD 6-14)
- Are e-bikes worth it / safe (~580, KD 16-30)
- Weight (~800, KD 8)
- Charging / battery reset (~800, KD 3-16)
- DIY conversion (~10k, KD 32-35) and conversion kits (14.8k, KD 31)
  Skip: where-to-buy/near-me (collection pages), brand queries, dirt bike queries unless sold, speed-limiter removal.
  Check overlap with existing posts (esp. electric bike classes) before drafting.
