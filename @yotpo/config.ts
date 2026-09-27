// Path: @yotpo/config.ts
//
// CHANGE FROM ORIGINAL:
// Reads `NEXT_PUBLIC_YOTPO_APP_KEY` instead of `YOTPO_APP_KEY`, to match the variable
// name already present in this project's .env.local (used elsewhere for Yotpo's
// client-side widget script). The app key is a public Yotpo identifier, not a secret,
// so reading the NEXT_PUBLIC_-prefixed var here is safe even though this file itself
// stays server-only (`import 'server-only'` in client.ts).
//
// Single source of truth for anything Yotpo-related: env vars and the
// Brand Kit tokens (kept in code, not fetched, since they rarely change and
// this avoids an extra network round trip on every render).

const appKey = process.env.NEXT_PUBLIC_YOTPO_APP_KEY;

if (!appKey) {
  throw new Error('NEXT_PUBLIC_YOTPO_APP_KEY environment variable is not set');
}

export const yotpoConfig = {
  appKey,
  apiBaseUrl: 'https://api.yotpo.com/v1/widget',
  reviewsPerPage: 5, // matches "Reviews per page" in Yotpo's Style settings
  revalidateSeconds: 3600,
  brand: {
    primaryColor: '#000000',
    starsColor: '#FFE000',
    textColor: '#000000',
    fontPrimary: 'var(--font-nunito-sans)', // bold weight
    fontSecondary: 'var(--font-nunito-sans)', // regular weight
    lineSeparatorStyle: 'smooth' as const
  }
} as const;
