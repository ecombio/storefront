// Keep @yotpo/yotpo.md in sync with changes to this route.
// Path: app/api/yotpo/reviews/route.ts
//
// Receives the review form, validates it, and forwards it to Yotpo's create-review endpoint.
// The client only sends the product HANDLE; the numeric product ID, title and image are
// re-derived on the server from Shopify, so a caller can't post reviews to arbitrary IDs.
//
// Spam protection here: honeypot + a best-effort per-IP limiter. The limiter is in-memory, so it's
// per serverless instance and only slows casual abuse. For real protection add a Vercel Firewall
// rate-limit rule on /api/yotpo/reviews and/or turn on BotID (shopConfig.botid).
//
// The limiter runs AFTER validation, so mistyped forms don't burn a visitor's allowance.

import { submitReview } from "@yotpo";
import { NextResponse } from "next/server";

import { getProduct } from "@/lib/product/server";
import { getNumericShopifyId } from "@/lib/shopify/id/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE_RE = /^[a-z0-9][a-z0-9_-]*$/i;

const MAX_BODY_BYTES = 8 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep the map bounded
  return false;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Canonical site URL for the product link sent to Yotpo. Set NEXT_PUBLIC_SITE_URL in production. */
function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return bad("Request too large.", 413);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Invalid request.");
  }

  // Honeypot filled in: pretend it worked so bots don't adapt.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const handle = typeof body.handle === "string" ? body.handle : "";
  const score = body.score;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!HANDLE_RE.test(handle)) return bad("Invalid product.");
  if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
    return bad("Choose a star rating.");
  }
  if (name.length < 1 || name.length > 60) return bad("Enter your name.");
  if (!EMAIL_RE.test(email) || email.length > 254) return bad("Enter a valid email address.");
  if (title.length < 1 || title.length > 100) return bad("Enter a review title.");
  if (content.length < 10 || content.length > 2000) {
    return bad("Your review must be between 10 and 2000 characters.");
  }

  // Only well-formed requests count toward the limit, right before the expensive calls.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return bad("Too many submissions. Please try again later.", 429);

  try {
    const product = await getProduct({ handle });
    const productId = product ? getNumericShopifyId(product.id) : null;
    if (!product || !productId) return bad("Product not found.", 404);

    const ok = await submitReview({
      productId,
      productTitle: product.title,
      productUrl: `${siteOrigin(request)}/products/${product.handle}`,
      productImageUrl: product.featuredImage?.url,
      name,
      email,
      title,
      content,
      score,
    });
    if (!ok) return bad("We couldn't submit your review. Please try again later.", 502);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Yotpo review route error:", err);
    return bad("We couldn't submit your review. Please try again later.", 502);
  }
}
