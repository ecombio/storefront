export type MenuItemImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

// Structural shape shared by every nesting level of the menu query.
export interface ShopifyMenuItem {
  id: string;
  items?: ShopifyMenuItem[];
  resource?: {
    __typename?: string;
    handle?: string;
    image?: MenuItemImage | null;
  } | null;
  title: string;
  type: MenuItemType;
  url?: string | null;
}

export interface ShopifyMenu {
  handle: string;
  id: string;
  items: ShopifyMenuItem[];
  title: string;
}
export type MenuItemType =
  | "ARTICLE"
  | "BLOG"
  | "CATALOG"
  | "COLLECTION"
  | "COLLECTIONS"
  | "CUSTOMER_ACCOUNT_PAGE"
  | "FRONTPAGE"
  | "HTTP"
  | "METAOBJECT"
  | "PAGE"
  | "PRODUCT"
  | "SEARCH"
  | "SHOP_POLICY";

export type MenuItem = {
  id: string;
  title: string;
  url: string;
  type: MenuItemType;
  image: MenuItemImage | null;
  items: MenuItem[];
};

export type Menu = {
  id: string;
  handle: string;
  title: string;
  items: MenuItem[];
};
