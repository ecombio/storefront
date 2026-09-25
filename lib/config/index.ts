import type { ShopConfig } from "./types";

const productionUrl = "https://ecombio.com";

const defaultUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? productionUrl
  : "http://localhost:3000";

export const shopConfig = {
  agent: {
    isEnabled: false,
  },
  analytics: {
    shopify: {
      consentMode: "default-banner",
      isEnabled: false,
    },
    speedInsights: {
      isEnabled: false,
    },
    vercel: {
      isEnabled: false,
    },
  },
  auth: {
    isEnabled: true,
  },
  botid: {
    checkLevel: "basic",
    isEnabled: false,
  },
  browserAgents: {
    webmcp: {
      isEnabled: false,
    },
  },
  localization: {
    country: "US",
    language: "EN",
    locale: "en-US" as const,
  },
  pdp: {
    bundles: {
      isEnabled: true,
    },
    buyWithShop: {
      isEnabled: true,
    },
    complementaryProducts: {
      isEnabled: true,
    },
    quantityPicker: {
      isEnabled: true,
    },
    relatedProducts: {
      isEnabled: true,
    },
  },
  redirects: {
    shopifyNotFound: {
      isEnabled: false,
    },
  },
  search: {
    isEnabled: true,
  },
  site: {
    name: "Ecombio",
    url: defaultUrl,
  },
} satisfies ShopConfig;
