"use client";

type UserLike = {
  id: string | number;
  name?: string;
  email?: string;
};

export async function resolveBackendUserId(user: UserLike): Promise<number> {
  const currentId = String(user.id);
  if (/^\d+$/.test(currentId)) {
    return Number(currentId);
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: user.name ?? user.email ?? "User",
      email: user.email ?? "",
      firebaseUid: currentId,
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

  return Number(backendUser.id);
}
