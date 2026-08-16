import { apiClient } from "@/lib/api-client";
import { unwrap } from "@/lib/api-envelope";
import type { UserProfile } from "@/types/user";

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await apiClient.get("/api/auth/me");
  return unwrap(res);
}
