import { API_BASE_URL } from "./constants";

export interface SubscriptionResponse {
  plan: "free" | "pro";
  limits: Record<string, unknown>;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  return fetchApi<SubscriptionResponse>("/api/v1/subscription");
}
