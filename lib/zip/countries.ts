export type Country = {
  code: string; // ISO 3166-1 alpha-2, uppercase
  name: string;
  languages: string[];
};

// Edit this list to the markets you actually serve.
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", languages: ["English", "Español"] },
  { code: "CA", name: "Canada", languages: ["English", "Français"] },
];

export const DEFAULT_COUNTRY = "US";

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

// Flag images (emoji flags render as plain letters on Windows).
export function flagUrl(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}
