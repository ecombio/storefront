import { gql } from "@shopify/hydrogen";

export const MENU_ITEM_FIELDS_FRAGMENT = gql(`#graphql
  fragment MenuItemFields on MenuItem {
    id
    title
    url
    type
    tags
    resource {
      ... on Collection {
        handle
        image {
          url
          altText
          width
          height
        }
      }
      ... on Product { handle }
      ... on Page { handle }
    }
  }
`);
