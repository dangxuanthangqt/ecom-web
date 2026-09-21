import { createServer } from "node:http";

import { createState } from "./fixtures.mjs";
import { json, notFound, readJson } from "./helpers.mjs";
import { authRoutes } from "./routes/auth.mjs";
import { catalogRoutes } from "./routes/catalog.mjs";
import { i18nRoutes } from "./routes/i18n.mjs";
import { shopRoutes } from "./routes/shop.mjs";
import { orderRoutes } from "./routes/orders.mjs";
import { manageRoutes } from "./routes/manage.mjs";
import { adminRoutes } from "./routes/admin.mjs";
import { mediaRoutes } from "./routes/media.mjs";

/**
 * A stand-in for the Nest API, good enough for the frontend's whole surface.
 *
 * It exists because the real backend cannot serve an authenticated session on
 * a developer machine (unseeded database, mail provider key required to send
 * an OTP), and because E2E runs want a fixed, resettable world.
 */
const PORT = Number(process.env.MOCK_API_PORT ?? 4010);

const routes = [
  ...authRoutes,
  ...catalogRoutes,
  ...i18nRoutes,
  ...shopRoutes,
  ...orderRoutes,
  ...manageRoutes,
  ...adminRoutes,
  ...mediaRoutes,
].map((route) => ({ ...route, matcher: toMatcher(route.path) }));

let state = createState();

function toMatcher(path) {
  const names = [];
  const pattern = path
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment;

      names.push(segment.slice(1));

      return "([^/]+)";
    })
    .join("/");

  return { regex: new RegExp(`^${pattern}$`), names };
}

function match(method, pathname) {
  for (const route of routes) {
    if (route.method !== method) continue;

    const found = route.matcher.regex.exec(pathname);

    if (!found) continue;

    const params = Object.fromEntries(
      route.matcher.names.map((name, index) => [name, decodeURIComponent(found[index + 1])]),
    );

    return { route, params };
  }

  return null;
}

/** Endpoints the specs drive directly — never part of the real API. */
async function handleTestControl(req, res, pathname) {
  if (pathname === "/__test__/reset" && req.method === "POST") {
    state = createState();
    json(res, 200, { message: "reset" });

    return true;
  }

  if (pathname === "/__test__/expire-access-tokens" && req.method === "POST") {
    // Everything minted so far now answers 401, which is what makes the
    // proxy's refresh-and-replay path observable from a spec.
    for (const token of state.issuedAccessTokens) {
      state.revokedAccessTokens.add(token);
    }

    json(res, 200, { message: "expired" });

    return true;
  }

  if (pathname === "/__test__/seed" && req.method === "POST") {
    const body = await readJson(req);

    for (const [key, rows] of Object.entries(body)) {
      if (Array.isArray(state[key])) state[key] = rows;
    }

    json(res, 200, { message: "seeded" });

    return true;
  }

  if (pathname === "/__test__/echo" && req.method === "GET") {
    // Lets a spec see exactly what the proxy forwarded.
    json(res, 200, {
      authorization: req.headers.authorization ?? null,
      xLang: req.headers["x-lang"] ?? null,
      cookie: req.headers.cookie ?? null,
    });

    return true;
  }

  if (pathname === "/__test__/state" && req.method === "GET") {
    json(res, 200, {
      users: state.users.map((user) => ({ id: user.id, email: user.email })),
      cartItems: state.cartItems.length,
      orders: state.orders.map((order) => ({ id: order.id, status: order.status })),
      brands: state.brands.map((brand) => brand.name),
      languages: state.languages.map((language) => language.id),
      products: state.products.map((product) => product.name),
      reviews: state.reviews.length,
      roles: state.roles.map((role) => role.name),
    });

    return true;
  }

  if (pathname === "/__test__/google-consent") {
    // Stands in for Google, then bounces back the way Nest's callback does.
    const redirect = `${process.env.APP_URL ?? "http://localhost:3100"}/vi/oauth/google?accessToken=at:user-client:google&refreshToken=rt:user-client:google`;

    state.sessions.set("rt:user-client:google", "user-client");
    res.writeHead(302, { location: redirect });
    res.end();

    return true;
  }

  if (pathname === "/__test__/google-consent-failure") {
    const redirect = `${process.env.APP_URL ?? "http://localhost:3100"}/vi/oauth/google?errorMessage=Failed%20to%20google%20login.`;

    res.writeHead(302, { location: redirect });
    res.end();

    return true;
  }

  return false;
}

createServer(async (req, res) => {
  const baseUrl = `http://${req.headers.host}`;
  const url = new URL(req.url, baseUrl);

  if (await handleTestControl(req, res, url.pathname)) return;
  if (res.writableEnded) return;

  const found = match(req.method, url.pathname);

  if (!found) {
    return notFound(res, `No mock route for ${req.method} ${url.pathname}`);
  }

  try {
    await found.route.handler({
      state,
      req,
      res,
      params: found.params,
      query: url.searchParams,
      baseUrl,
    });
  } catch (error) {
    json(res, 500, {
      statusCode: 500,
      error: "MOCK_FAILURE",
      message: error instanceof Error ? error.message : String(error),
      details: [],
    });
  }
}).listen(PORT, () => {
  process.stdout.write(`mock api listening on http://localhost:${PORT}\n`);
});
