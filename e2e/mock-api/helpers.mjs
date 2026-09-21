/** Shared plumbing for the mock API: envelopes, paging, auth, body parsing. */

export function json(res, status, payload) {
  const body = payload === undefined ? "" : JSON.stringify(payload);

  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

/** Mirrors `ErrorResponseDto` — the only error body the real API produces. */
export function fail(res, statusCode, error, message, details = []) {
  json(res, statusCode, {
    statusCode,
    error,
    message,
    details,
    requestId: `mock-${Math.random().toString(16).slice(2, 10)}`,
  });
}

export function validationFailed(res, details) {
  fail(res, 400, "VALIDATION_FAILED", "Validation failed", details);
}

export function unauthorized(res, message = "Access token is required.") {
  fail(res, 401, "UNAUTHORIZED", message);
}

export function forbidden(res) {
  fail(
    res,
    403,
    "FORBIDDEN",
    "You do not have permission to access this resource.",
  );
}

export function notFound(res, message = "Resource not found.") {
  fail(res, 404, "NOT_FOUND", message);
}

/** `{ pagination, data }` — the list envelope every collection endpoint uses. */
export function page(res, rows, query) {
  const pageSize = Number(query.get("pageSize") ?? 20) || 20;
  const pageIndex = Number(query.get("pageIndex") ?? 0) || 0;
  const start = pageIndex * pageSize;

  json(res, 200, {
    pagination: {
      totalItems: rows.length,
      totalPages: Math.max(Math.ceil(rows.length / pageSize), 1),
      pageSize,
      pageIndex,
    },
    data: rows.slice(start, start + pageSize),
  });
}

export function byKeyword(rows, keyword, fields = ["name"]) {
  if (!keyword) return rows;

  const needle = keyword.toLowerCase();

  return rows.filter((row) =>
    fields.some((field) => String(row[field] ?? "").toLowerCase().includes(needle)),
  );
}

export function sortRows(rows, orderBy, order) {
  if (!orderBy) return rows;

  const direction = order === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const a = left[orderBy];
    const b = right[orderBy];

    if (a === b) return 0;

    return a > b ? direction : -direction;
  });
}

export async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) chunks.push(chunk);

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { __raw: raw };
  }
}

export function bearer(req) {
  const header = req.headers.authorization ?? "";

  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

/**
 * Resolves the caller. Access tokens look like `at:<userId>:<nonce>`; a token
 * in `revokedAccessTokens` answers 401 so the refresh path can be exercised.
 */
export function currentUser(state, req) {
  const token = bearer(req);

  if (!token) return { error: "missing" };
  if (state.revokedAccessTokens.has(token)) return { error: "expired" };
  if (!token.startsWith("at:")) return { error: "invalid" };

  const [, userId] = token.split(":");
  const user = state.users.find((item) => item.id === userId);

  return user ? { user } : { error: "invalid" };
}

/** Guards a handler behind authentication and, optionally, a permission key. */
export function authed(handler, permissionKey) {
  return (context) => {
    const { user, error } = currentUser(context.state, context.req);

    if (error === "expired") {
      return unauthorized(context.res, "Access token has expired.");
    }

    if (!user) return unauthorized(context.res);

    if (permissionKey) {
      const owned = new Set(user.role.permissions.map((item) => item.key));

      if (!owned.has(permissionKey)) return forbidden(context.res);
    }

    return handler({ ...context, user });
  };
}

export function timestamps() {
  const now = new Date().toISOString();

  return { createdAt: now, updatedAt: now };
}

export function uid(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
}
