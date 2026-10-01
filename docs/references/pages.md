# Pages and Templates Map

How each storefront route relates to a Shopify theme template, and where its data comes from.

| Route                                                        | Shopify template      | Data source                                   | Notes                                                              |
| ------------------------------------------------------------ | --------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `/`                                                          | `index`               | `components/product/products-grid`            | Home                                                               |
| `/collections`                                               | `list-collections`    | `lib/collections/server`                      |                                                                    |
| `/collections/[handle]`                                      | `collection`          | `lib/collections/server`, `lib/blog/server`   | Blog data feeds the Expert Advice tab                              |
| `/collections/all`                                           | `collection`          | `lib/collections/server`                      | Own page                                                           |
| `/products/[handle]`                                         | `product`             | `lib/product/server`                          | Dynamic. Also renders related products                             |
| `/blogs/category/[categoryHandle]`                           | `blog`                | `lib/blog/server`                             | Shopify blog = category                                            |
| `/blogs/articles/[articleHandle]`                            | `article`             | `lib/blog/server`                             |                                                                    |
| `/blogs/tag/[tagHandle]`                                     | none                  | `lib/blog/tag-server`                         | Custom, across all blogs                                           |
| `/blogs/author/[authorHandle]`                               | none                  | `lib/blog/author-server`                      | Custom, from the Author metaobject                                 |
| `/blogs/[blogHandle]`, `/blogs/[blogHandle]/[articleHandle]` | none                  | none                                          | 308 redirects to the canonical URLs                                |
| `/pages/[handle]`                                            | `page`                | `lib/pages/server`                            | Respects `lib/pages/hidden`. Shares `rich-text-page` with policies |
| `/policies/[handle]`                                         | none                  | `lib/policies/server`                         | Shopify has no policy template                                     |
| `/search`                                                    | `search`              | `lib/search/server`, `lib/collections/server` |                                                                    |
| `/cart`                                                      | `cart`                | client-side (`components/cart-page/body`)     | No server data helper                                              |
| `/account`                                                   | `customers/account`   | none imported directly                        | Authenticated route group                                          |
| `/account/orders`                                            | `customers/orders`    | `lib/shopify/operations/customer/server`      |                                                                    |
| `/account/orders/[id]`                                       | `customers/order`     | `lib/shopify/operations/customer/server`      |                                                                    |
| `/account/addresses`                                         | `customers/addresses` | `lib/shopify/operations/customer/server`      |                                                                    |
| `/account/profile`                                           | none                  | `lib/shopify/operations/customer/server`      | Custom                                                             |
| `not-found`                                                  | `404`                 | none                                          |                                                                    |

## Not part of the theme equivalent

- `/md/*`, `/llms.txt`, `/agent/ucp-profile.json`: markdown and agent-facing mirrors
- `/api/agent/session`, `/api/webhooks/shopify`, `/api/yotpo/reviews`: API handlers
- `/sitemap.xml`, `/sitemap/[shard]`, `/robots.txt`: SEO

## No equivalent in this storefront

`password`, `gift_card`, `customers/login`, `register`, `reset_password`, `activate_account`, `metaobject/*`.

## Data layer

Shopify queries live in `lib/shopify/operations/`: `blogs`, `collections`, `customer`, `menu`, `pages`, `policies`, `products`, `shop`, `sitemap`. Pages mostly reach them through `lib/*/server` helpers, except account pages, which import the customer operations directly.
