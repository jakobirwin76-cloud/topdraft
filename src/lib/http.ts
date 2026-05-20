import type { ZodSchema } from "zod";

export function json<T>(data: T, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export function badRequest(message: string, details?: unknown) {
  return json({ error: "bad_request", message, details }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return json({ error: "unauthorized", message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return json({ error: "forbidden", message }, { status: 403 });
}

export function serverError(message = "Internal server error") {
  return json({ error: "server_error", message }, { status: 500 });
}

/**
 * Parse and validate a JSON body against a Zod schema.
 * Returns either the validated data or a Response (which the caller should
 * return immediately).
 */
export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T | Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }
  return parsed.data;
}
