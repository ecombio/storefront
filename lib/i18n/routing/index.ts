import { defineRouting } from "next-intl/routing";

import { defaultLocale, enabledLocales } from "@/lib/i18n";

export const routing = defineRouting({
  defaultLocale,
  localePrefix: "always",
  locales: enabledLocales,
});
