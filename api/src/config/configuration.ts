import { z } from "zod";

import { type Configuration } from "./config.module";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().optional().default(3333),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_EXPIRATION: z.string(),
  DATABASE_URL: z.url(),
  HASH_SALT: z.coerce.number().default(13),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
});

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export function configuration(
  overrides?: RecursivePartial<Configuration>,
): Configuration {
  const { data, error } = envSchema.safeParse(process.env);

  if (error) {
    throw new Error(`Configuration error: ${error.message}`);
  }

  return {
    app: {
      port: overrides?.app?.port || data.PORT,
      environment: overrides?.app?.environment || data.NODE_ENV,
      cors: {
        origin: overrides?.app?.cors?.origin || data.CORS_ORIGIN || "",
      },
    },
    database: {
      url: overrides?.database?.url || data.DATABASE_URL,
    },
    jwt: {
      privateKey: overrides?.jwt?.privateKey || data.JWT_PRIVATE_KEY,
      publicKey: overrides?.jwt?.publicKey || data.JWT_PUBLIC_KEY,
      expiration: overrides?.jwt?.expiration || data.JWT_EXPIRATION,
    },
    cryptography: {
      hashSalt: overrides?.cryptography?.hashSalt || data.HASH_SALT,
    },
  };
}

export const overrideConfiguration = (
  overrideValues: RecursivePartial<Configuration>,
) => {
  return () => configuration(overrideValues);
};
