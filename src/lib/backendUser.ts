"use client";

type UserLike = {
  id: string | number;
  name?: string;
  email?: string;
};

// In-memory cache: clerkId → numeric backend DB id
const backendIdCache = new Map<string, number>();

/**
 * Resolves the numeric backend DB id for a user.
 * - If user.id is already a number string → return it directly.
 * - Otherwise (Clerk user id like "user_xxx") → call /api/auth/register to
 *   upsert the user in the backend and return the numeric id.
 *   Also handles migration: if a Firebase-era user logs in via Clerk with the
 *   same email, the backend links the clerkId to the existing account.
 */
export async function resolveBackendUserId(user: UserLike): Promise<number> {
  const currentId = String(user.id);

  // Already a numeric DB id
  if (/^\d+$/.test(currentId)) {
    return Number(currentId);
  }

  // Return from cache if available
  if (backendIdCache.has(currentId)) {
    return backendIdCache.get(currentId)!;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: user.name ?? user.email ?? "User",
      email: user.email ?? "",
      clerkId: currentId,
    }),
  });

  if (!registerRes.ok) {
    const details = await registerRes.text();
    throw new Error(
      `Failed to sync user with backend (${registerRes.status}): ${details}`,
    );
  }

  const backendUser = await registerRes.json();
  if (!backendUser?.id) {
    throw new Error("Backend user id missing in register response");
  }

  const numericId = Number(backendUser.id);
  backendIdCache.set(currentId, numericId);
  return numericId;
}
