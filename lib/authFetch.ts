"use client";

/**
 * Wrapper around fetch that automatically attaches the Clerk JWT token
 * as an Authorization: Bearer header.
 */
export async function authFetch(
  getToken: () => Promise<string | null>,
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
