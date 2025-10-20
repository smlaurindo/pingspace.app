import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_API_DELAY: z.coerce.boolean().default(false),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_DELAY: process.env.NEXT_PUBLIC_API_DELAY,
});