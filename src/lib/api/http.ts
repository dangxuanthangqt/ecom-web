export type ApiErrorDetail = {
  field?: string;
  message?: string;
  [key: string]: unknown;
};

/** Mirrors `ErrorResponseDto` — the only error body the API ever produces. */
export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
  requestId?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];
  readonly requestId?: string;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.code = body.error;
    this.details = body.details ?? [];
    this.requestId = body.requestId;
  }

  /** `{ email: "Email already taken" }` — ready for `setError` in react-hook-form. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};

    for (const detail of this.details) {
      if (detail.field && detail.message) out[detail.field] = detail.message;
    }

    return out;
  }
}

export type QueryValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Array<string | number>;

export function buildPath(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else {
      params.append(key, String(value));
    }
  }

  const qs = params.toString();

  return qs ? `${path}?${qs}` : path;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload: unknown = text ? safeJson(text) : null;

  if (response.ok) return payload as T;

  throw new ApiError(toErrorBody(payload, response.status));
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toErrorBody(payload: unknown, status: number): ApiErrorBody {
  if (
    payload &&
    typeof payload === "object" &&
    "statusCode" in payload &&
    "message" in payload
  ) {
    return payload as ApiErrorBody;
  }

  return {
    statusCode: status,
    error: "UNKNOWN_ERROR",
    message: typeof payload === "string" && payload ? payload : "Request failed",
    details: [],
  };
}

export type ListResponse<T> = {
  data: T[];
  pagination: {
    totalPages: number;
    totalItems: number;
    pageSize: number;
    pageIndex: number;
  };
};
