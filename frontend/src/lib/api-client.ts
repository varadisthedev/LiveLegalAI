import axios from "axios";
import { getSession } from "next-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  console.error("[api] NEXT_PUBLIC_BACKEND_URL is not set — API calls will fail.");
}

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  console.log(`[api] → ${(config.method || "get").toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[api] ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.error || error.message;
    console.error(`[api] ✗ ${status ?? "network error"} ${url} — ${message}`);
    return Promise.reject(error);
  },
);
