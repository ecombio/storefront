# Blog Articles Guide

How blog content works on the storefront, and how to write articles that use accordions, buttons, and product strips.

- [URL structure](#url-structure)
- [Writing an article](#writing-an-article)
- [Shortcodes](#shortcodes)
- [Automatic features](#automatic-features)
- [Categories and tags](#categories-and-tags)
- [Authors](#authors)
- [Full example](#full-example)
- [Troubleshooting](#troubleshooting)
- [For developers](#for-developers)

---

## URL structure

| URL                                     | What it shows                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/blogs/category/{blog-handle}`         | A category page (one per Shopify blog). Hero article, article grid, Featured list, tag chips. |
| `/blogs/author/{author-handle}`         | An author page: profile, topic chips, and every article they wrote.                           |
| `/blogs/tag/{tag-handle}`               | Every article with that tag, across all blogs.                                                |
| `/blogs/articles/{article-handle}`      | A single article.                                                                             |
| `/blogs/{blog-handle}`                  | Redirects (308) to `/blogs/category/{blog-handle}`.                                           |
| `/blogs/{blog-handle}/{article-handle}` | Redirects (308) to `/blogs/articles/{article-handle}`.                                        |

Always link to the canonical URLs (`/blogs/category/...`, `/blogs/articles/...`, `/blogs/tag/...`, `/blogs/author/...`). Old URLs keep working through redirects, but they add an extra hop.

**Tag handles** are made from the tag text: lowercase, `&` becomes `and`, and anything that is not a letter or number becomes a hyphen. "Stretching & Mobility" becomes `stretching-and-mobility`.

---

## Writing an article

1. In Shopify admin, go to **Content → Blog posts** and open or create a post.
2. Set the **title**, **featured image**, **author**, **blog** (this is the category), and **tags**.
3. Write the body. Normal text, headings, lists, images, and links all work.
4. For accordions, buttons, and product strips, switch to the **HTML view** (the `</>` button) and add shortcodes (see below).
5. Save.

Rules that keep things working:

- **Do not add an H1 to the body.** The page already renders the post title as the H1. Start the body with a paragraph, and use **Heading 2** for sections.
- **Save from the HTML view.** Switching back to the visual editor can reformat the HTML and break shortcodes.
- Every shortcode must sit in **its own paragraph**: `<p>[...]</p>`.

---

## Shortcodes

Shopify's editor has no custom blocks, so writers type a short marker and the site turns it into a real component.

### Accordion

Wrap the content between an opening and a closing marker. The content can be paragraphs, lists, and links.

```html
<p>[accordion: Motor placement: mid-drive or hub?]</p>
<p>Mid-drive motors offer better balance and hill-climbing. Hub motors are simpler and cheaper.</p>
<p>[/accordion]</p>
```

Behavior:

- Accordions that follow each other become **one connected list** with dividers.
- They all start **closed**.
- Each one opens and closes on its own, so several can be open at once.
- Links inside an accordion are shown dark and underlined.
- A paragraph, heading, or other content between two accordions **starts a new list**.

### Button

```html
<p>[button: /collections/electric-bikes | Shop electric bikes]</p>
```

Format: `[button: link | label]`

- The link must start with `/` or `https://`. Anything else is ignored.

### Products

Shows product cards pulled live from the store. **The number of handles picks the layout:**

| Handles | Layout                                       |
| ------- | -------------------------------------------- |
| 1       | Single: one product, full column width       |
| 2       | Duo: two side by side                        |
| 3       | Trio: three in a row (two per row on phones) |

Formats:

```html
<p>[products: lectric-xp-black]</p>
<p>[products: lectric-xp-step-thru-white, lectric-xp-lite-sandstorm]</p>
<p>[products: Shop our best-selling commuter | lectric-xp-black]</p>
<p>
  [products: Shop our standout picks | /collections/electric-bikes | handle-1, handle-2, handle-3]
</p>
```

| Parts (separated by `\|`) | Meaning                                                      |
| ------------------------- | ------------------------------------------------------------ |
| Handles only              | No header row                                                |
| Title, then handles       | Header row with the title                                    |
| Title, link, then handles | Header row with the title and a "Shop Now" link on the right |

Notes:

- The **last part is always the handles**, separated by commas.
- Use the product handle, which is the last part of a product URL (`/products/{handle}`).
- A maximum of **3 products** is shown. Extra handles are ignored.
- Handles are not case-sensitive, and a repeated handle is shown once.
- A handle that does not exist is skipped. If none exist, nothing is shown.
- Do not use a `|` or a comma inside a title.

---

## Automatic features

These need no markers.

- **Contents sidebar.** Built from the article's **Heading 2** sections. It appears on wide screens when there are two or more H2s. Each entry scrolls to its section.
- **Category page "Featured".** The first five articles in the category, numbered 01 to 05.
- **Category page "The latest".** The newest article is the large hero, and the rest fill a two-column grid.
- **Load More.** Grids show 6 articles at a time, with "Viewing 1 - N of N articles" under them.
- **Byline.** Author and date come from the Shopify post. If the post has an author profile, the name links to the author page.
- **Author card.** Posts with an author profile show a card under the body (see Authors).

---

## Categories and tags

**Category = Shopify blog.** The row at the top of every blog page lists your blogs. Put an article in the right blog to give it the right category.

**Tag chips** on a category page are built from the tags on that category's articles (the 12 most common). Each chip links to its tag page.

Good tagging:

- Use readable, consistent names, for example `Stretching & Mobility`. Avoid near-duplicates such as `cycling` and `cycling-1`.
- Tags are case-insensitive for URLs, so `Running` and `running` share a page, but keep one spelling for clean chips.
- An article with no tags still works. It just will not appear on any tag page.

---

## Authors

Author profiles live in Shopify as an **Author** metaobject. Each one gets its own page, and the card on articles and the byline link to it.

**One-time setup (already done):**

- Metaobject definition **Author** with fields `name` (single line text), `role` (single line text), `bio` (multi-line text, not rich text), and `photo` (File, images only). Storefront API access is on.
- Blog post metafield `custom.author_profile`, type **Metaobject reference** pointing to Author. Storefront API access is on.

**Adding an author:**

1. Go to **Content → Metaobjects → Author → Add entry** and fill in name, role, bio, and photo. The entry handle (for example `jordan-pham`) becomes the URL: `/blogs/author/{handle}`.
2. On each of their posts, pick the entry in the **author_profile** field. The staff **Author** field can stay as it is.

**What readers see:**

- The byline name links to the author page.
- A card (photo, name, role, two lines of bio) appears under the article body.
- The author page shows the profile on the left, topic chips built from their articles, and a "Latest from" grid with Load More.

Notes:

- The photo, role, and bio on the author page come from the author's **newest** post, so set `author_profile` on every post they write.
- A post with no profile falls back to the staff Author name. It has no card and no byline link, but its author page still exists at the name's slug, showing only the name.

---

## Full example

```html
<p>Short intro paragraph.</p>

<h2>1. First section</h2>
<p>Some text.</p>

<p>[accordion: First question?]</p>
<p>First answer.</p>
<p>[/accordion]</p>

<p>[accordion: Second question?]</p>
<p>Second answer, with a <a href="/collections/electric-bikes">link</a>.</p>
<p>[/accordion]</p>

<p>[products: Shop electric bikes | /collections/electric-bikes | lectric-xp-black]</p>

<h2>2. Second section</h2>
<p>More text.</p>

<p>
  [products: Shop our standout picks | /collections/electric-bikes | handle-1, handle-2, handle-3]
</p>

<p>[button: /collections/electric-bikes | Shop electric bikes]</p>
```

---

## Troubleshooting

| Problem                                            | Likely cause and fix                                                                                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A marker shows up as plain text                    | The marker is not alone in its own `<p>`, or has a typo. Open the HTML view and make sure it reads exactly `<p>[accordion: Title]</p>`. Also check that the site code has been deployed.  |
| Accordion content shows as text                    | The closing `<p>[/accordion]</p>` is missing.                                                                                                                                             |
| A product strip is missing or shows fewer products | A handle is wrong, or the product is unpublished. Check each handle against its `/products/...` URL.                                                                                      |
| A button is missing                                | Its link does not start with `/` or `https://`.                                                                                                                                           |
| Contents sidebar is missing                        | The article needs two or more Heading 2 sections, and the screen must be wide.                                                                                                            |
| Author card is missing                             | The post has no **author_profile** picked, or Storefront API access is off on the Author definition or the metafield. Also check that `photo` is a File field and `bio` is not rich text. |
| Tag chips are missing                              | The category's articles have no tags. Add tags in Shopify.                                                                                                                                |
| Changes do not appear locally                      | Content is cached. Restart `pnpm dev`. In production, the cache refreshes from Shopify's webhooks.                                                                                        |
| Old version still showing after saving             | Wait a minute and reload. If it persists, check the deployment status in Vercel.                                                                                                          |

---

## For developers

### Files

| File                                              | Purpose                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `app/blogs/category/[categoryHandle]/page.tsx`    | Category page: title, tag chips, hero, grid, Featured list           |
| `app/blogs/author/[authorHandle]/page.tsx`        | Author page: profile, topic chips, article grid                      |
| `app/blogs/tag/[tagHandle]/page.tsx`              | Tag page                                                             |
| `app/blogs/articles/[articleHandle]/page.tsx`     | Article route                                                        |
| `app/blogs/[blogHandle]/page.tsx`                 | Redirect to the category page                                        |
| `app/blogs/[blogHandle]/[articleHandle]/page.tsx` | Redirect to the article page                                         |
| `components/blog/article-page.tsx`                | Article layout and Contents sidebar                                  |
| `components/blog/article-body.tsx`                | Renders parsed body segments (HTML, accordions, buttons, products)   |
| `components/blog/product-strip.tsx`               | Single, duo, and trio product layouts                                |
| `components/blog/author-card.tsx`                 | Author card shown under the article body                             |
| `components/blog/article-tile.tsx`                | Grid tile used on category and tag pages                             |
| `components/blog/load-more-grid.tsx`              | Client-side "Load More" grid                                         |
| `components/blog/tag-chips.tsx`                   | Tag chip row                                                         |
| `components/blog/blog-sub-nav.tsx`                | Category row at the top of blog pages                                |
| `lib/blog/shortcodes.ts`                          | Shortcode parser and heading-id generator                            |
| `lib/blog/author-server.ts`                       | Author queries: groups articles by profile handle, loads the profile |
| `lib/blog/tags.ts`                                | Tag helpers: slug conversion, tag counting                           |
| `lib/blog/tag-server.ts`                          | Cross-blog article and tag queries                                   |
| `lib/blog/server.ts`                              | Cached blog and article fetchers                                     |
| `lib/shopify/operations/blogs/server.ts`          | Shopify Storefront API queries                                       |
| `app/sitemap/[shard]/route.ts`                    | Sitemap shards (blogs list `/blogs/category/...`)                    |
| `lib/shopify/operations/sitemap/server.ts`        | Article sitemap paths (`/blogs/articles/...`)                        |

### How the body is rendered

1. `parseBody()` splits the article HTML on shortcode paragraphs into typed segments.
2. `addHeadingIds()` adds an `id` to every H2 and H3 and collects them for the Contents list.
3. `ArticleBody` renders each segment. Consecutive accordion segments are grouped into one list.
4. `ProductStrip` is an async server component. It calls `getProduct({ handle })` for each handle and reuses the store's `ProductCard`.

### Adding a new shortcode

1. Add a pattern to `SHORTCODE` and a new variant to `BodySegment` in `lib/blog/shortcodes.ts`, then handle it in `parseBody()`.
2. Add a `case` for it in `components/blog/article-body.tsx`.
3. Document it in this file.

### Limits

- Each blog loads up to **50 articles** (`limit` in `fetchBlog`). Tag chips, tag pages, and "Viewing N of N" counts reflect only those.
- "Load More" reveals already-loaded articles in the browser. It does not fetch more from Shopify.
- Tag and author pages are not in the sitemap yet.
- Product cards in articles use the shared `ProductCard`. They show the image, name, price, and a discount badge when a compare-at price is set, but no ratings or variant text. The strip overrides the card image to 4:3 with `object-contain` so landscape photos are not cropped.
- Author pages group the articles already loaded (up to 50 per blog), and read the profile from the newest one.

### Deploying

Content changes in Shopify go live on their own once the cache refreshes. Code changes (this system included) need a normal deploy to `main`. Before pushing, run `pnpm oxfmt`, `pnpm lint`, and `pnpm build`.
