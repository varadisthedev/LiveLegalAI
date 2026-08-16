import { apiClient } from "@/lib/api-client";
import { unwrap } from "@/lib/api-envelope";
import type { AccountStats } from "@/types/user";

export async function getAccountStats(): Promise<AccountStats> {
  const res = await apiClient.get("/api/user/profile");
  return unwrap(res);
}
