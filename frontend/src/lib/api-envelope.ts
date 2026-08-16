import type { AxiosResponse } from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: string | null;
}

/** Unwraps the backend's { success, data, error } envelope, throwing on failure. */
export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  const { success, data, error } = response.data;
  if (!success) {
    throw new Error(error || "Request failed");
  }
  return data;
}
