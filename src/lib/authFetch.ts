"use client";

/**
 * Wrapper around fetch that automatically attaches the Clerk JWT token
 * as an Authorization: Bearer header.
 *
 * Usage (inside a component or hook where useAuth is available):
 *   import { useAuth } from "@clerk/nextjs";
 *   const { getToken } = useAuth();
 *   const res = await authFetch(getToken, "/api/tasks/1");
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
