export interface BodyHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export type BodySegment =
  | { html: string; type: "html" }
  | { html: string; title: string; type: "accordion" }
  | { href: string; label: string; type: "button" }
  | { handles: string[]; href?: string | undefined; title?: string | undefined; type: "products" };

const SHORTCODE = new RegExp(
  [
    String.raw`<p>\s*\[accordion:\s*([^\]]+?)\s*\]\s*</p>([\s\S]*?)<p>\s*\[/accordion\]\s*</p>`,
    String.raw`<p>\s*\[button:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]\s*</p>`,
    String.raw`<p>\s*\[products:\s*([^\]]+?)\s*\]\s*</p>`,
  ].join("|"),
  "gi",
);

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function plainText(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, "")).trim();
}

function safeHref(value: string): string | null {
  const href = value.trim();
  if (href.includes("\\") || href.startsWith("//")) return null;
  return href.startsWith("/") || href.startsWith("https://") ? href : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseBody(html: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;
  for (const match of html.matchAll(SHORTCODE)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ html: html.slice(last, index), type: "html" });
    if (match[1] !== undefined) {
      segments.push({ html: match[2] ?? "", title: plainText(match[1]), type: "accordion" });
    } else if (match[3] !== undefined) {
      const href = safeHref(plainText(match[3]));
      if (href) segments.push({ href, label: plainText(match[4] ?? ""), type: "button" });
    } else if (match[5] !== undefined) {
      const parts = match[5].split("|").map((part) => plainText(part));
      const handles = (parts.at(-1) ?? "")
        .split(",")
        .map((handle) => handle.trim().toLowerCase())
        .filter(Boolean);
      const title = parts.length > 1 ? parts[0] : undefined;
      const href = parts.length > 2 ? (safeHref(parts[1] ?? "") ?? undefined) : undefined;
      if (handles.length > 0)
        segments.push({ handles: [...new Set(handles)], href, title, type: "products" });
    }
    last = index + match[0].length;
  }
  if (last < html.length) segments.push({ html: html.slice(last), type: "html" });
  return segments;
}

export function addHeadingIds(html: string, headings: BodyHeading[]): string {
  return html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string | undefined, inner: string) => {
      const text = plainText(inner);
      if (!text) return match;
      const base = slugify(text) || "section";
      let id = base;
      let n = 2;
      while (headings.some((heading) => heading.id === id)) id = `${base}-${n++}`;
      headings.push({ id, level: Number(level) as 2 | 3, text });
      const cleanAttrs = (attrs ?? "").replace(/\sid="[^"]*"/i, "");
      return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
    },
  );
}
