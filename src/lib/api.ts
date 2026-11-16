import { fetch } from "expo/fetch";
import { createApi } from "./api-core";
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8500"
).replace(/\/$/, "");
export const api = createApi(API_URL, fetch as typeof globalThis.fetch);
