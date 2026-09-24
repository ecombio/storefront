import { handleShopifyRoutes } from "@shopify/hydrogen";
import {
  createCustomerAccountServerHandlers,
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
} from "@shopify/hydrogen/customer-account";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import {
  createCustomerRequestContext,
  createCustomerSessionManager,
  getCustomerRequestOrigin,
  getHydrogenCustomerSession,
} from "@/lib/auth/server";
import { cartHandlers, createCustomerCartHandlers } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";
import { routing } from "@/lib/i18n/routing";
import {
  appendVaryAccept,
  getMarkdownPath,
  negotiateRepresentation,
} from "@/lib/markdown/representation";
import { predictiveSearchHandlers } from "@/lib/search/server";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

const AUTH_PATHS = new Set<string>([
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
]);

const NOOP_SESSION_MANAGER = {
  getSessionItem: () => undefined,
  getSessionOrigin: () => "",
  removeSessionItem: () => {},
  setSessionItem: () => {},
};

const handleI18n = createMiddleware(routing);

// Routes that must never get a locale prefix.
const UNLOCALIZED_PREFIXES = ["/api", "/__shopify", "/md", "/sitemap", "/agent", "/.well-known"];
const SHOPIFY_CART_FILES = /^\/cart(?:\.(?:js|json)|\/(?:add|update|change|clear)\.(?:js|json))$/;

function isUnlocalizedPath(pathname: string): boolean {
  return (
    SHOPIFY_CART_FILES.test(pathname) ||
    UNLOCALIZED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

function normalizeRewrite(request: NextRequest, response: Response): Response {
  if (!response.ok) return response;
  const rewriteHeader = response.headers.get("x-middleware-rewrite");
  if (!rewriteHeader) return response;

  const rewriteTarget = new URL(rewriteHeader, request.url);
  const [, ...segments] = rewriteTarget.pathname.split("/");
  const normalized = new URL(`/${segments.filter(Boolean).join("/")}`, request.url);
  normalized.search = rewriteTarget.search;
  return NextResponse.rewrite(normalized, { headers: response.headers });
}

export async function proxy(request: NextRequest): Promise<Response> {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/.well-known/ucp") {
    // Hydrogen's well-known proxy does not yet include UCP.
    return NextResponse.rewrite(
      new URL(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/.well-known/ucp`),
    );
  }

  const requestContext = createCustomerRequestContext(request);

  const isAuthPath = shopConfig.auth.isEnabled && AUTH_PATHS.has(pathname);
  const usesCustomerCart = shopConfig.auth.isEnabled && (isAuthPath || pathname === "/api/cart");
  const customerSession = usesCustomerCart ? await getHydrogenCustomerSession() : undefined;
  const customerCartHandlers = customerSession
    ? createCustomerCartHandlers(customerSession)
    : undefined;
  const authHandlers =
    isAuthPath && customerSession && customerCartHandlers
      ? createCustomerAccountServerHandlers({
          cartServerHandlers: customerCartHandlers,
          customerSession,
          defaultPostLoginRedirectPathname: "/account",
          loginFailedRedirectPath: "/?auth_error=oauth_callback",
          origin: getCustomerRequestOrigin,
          postLogoutRedirectUri: "/",
        })
      : undefined;
  const handlers =
    authHandlers && customerCartHandlers
      ? [authHandlers, customerCartHandlers, predictiveSearchHandlers]
      : [customerCartHandlers ?? cartHandlers, predictiveSearchHandlers];
  const shopifyRoute = handleShopifyRoutes({
    handlers,
    request,
    requestContext,
    routeTemplates: SHOPIFY_ROUTE_TEMPLATES,
    sessionManager: usesCustomerCart ? createCustomerSessionManager(request) : NOOP_SESSION_MANAGER,
    storefrontClient: createRequestStorefrontClient(requestContext),
  });
  if (shopifyRoute) return shopifyRoute;

  const isDocumentRequest = request.method === "GET" || request.method === "HEAD";
  const markdownPath = isDocumentRequest ? getMarkdownPath(pathname) : null;
  if (markdownPath) {
    const representation = negotiateRepresentation(request.headers.get("Accept"));

    if (!representation) {
      return new Response(
        "Not Acceptable\n\nAvailable representations: text/html, text/markdown\n",
        {
          status: 406,
          headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept" },
        },
      );
    }

    if (representation === "text/markdown") {
      const url = request.nextUrl.clone();
      url.pathname = markdownPath;
      const response = NextResponse.rewrite(url, {
        request: { headers: requestContext.getForwardedRequestHeaders() },
      });
      appendVaryAccept(response.headers);
      requestContext.applyResponseHeaders(response.headers);
      return response;
    }
  }

  if (isUnlocalizedPath(pathname)) {
    const response = NextResponse.next({
      request: { headers: requestContext.getForwardedRequestHeaders() },
    });
    if (markdownPath) appendVaryAccept(response.headers);
    requestContext.applyResponseHeaders(response.headers);
    return response;
  }

  const i18nRequest = new NextRequest(request, {
    headers: requestContext.getForwardedRequestHeaders(),
  });
  const i18nResponse = handleI18n(i18nRequest);
  if (markdownPath) appendVaryAccept(i18nResponse.headers);
  requestContext.applyResponseHeaders(i18nResponse.headers);
  return normalizeRewrite(request, i18nResponse);
}

export const config = {
  matcher: [
    "/api/cart",
    "/api/predictive-search",
    "/api/mcp",
    "/api/ucp/mcp",
    "/api/:apiVersion(unstable|2\\d{3}-\\d{2})/graphql.json",
    "/__shopify/:path*",
    "/agent/:action(handoff|buyer-claims).:format",
    "/cart.:format(js|json)",
    "/cart/:operation(add|update|change|clear).:format(js|json)",
    "/:locale([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)/agent/:action(handoff|buyer-claims).:format",
    "/:locale([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)/cart.:format(js|json)",
    "/:locale([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)/cart/:operation(add|update|change|clear).:format(js|json)",
    "/((?!api|eve(?:/|$)|_eve_internal(?:/|$)|_next/static|_next/image|_next/data|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
    "/.well-known/:path*",
  ],
};
