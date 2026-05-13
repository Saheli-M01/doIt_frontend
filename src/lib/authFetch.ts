"use client";

/**
 * Wrapper around fetch that automatically attaches the Clerk JWT token
 * as an Authorization: Bearer header.
 */
export async function authFetch(
  getToken: (options?: { template?: string }) => Promise<string | null>,
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  // Get the raw JWT — no template needed, default Clerk session token works
  const token = await getToken();

  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("authFetch: no token available for", input);
  }

  return fetch(input, { ...init, headers });
}
