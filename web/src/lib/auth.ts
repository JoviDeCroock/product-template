import { createAuthClient } from "better-auth/client";
import { API_BASE_URL } from "./constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});
