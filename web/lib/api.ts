import { env } from "@/env";
import axios from "axios";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});

if (env.NEXT_PUBLIC_API_DELAY) {
  api.interceptors.request.use(async (config) => {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.round(Math.random() * 2000)),
    );

    return config;
  });
}