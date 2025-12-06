import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ConfigService } from "@/config/config.service";
import { TransactionalAdapterDrizzleOrm as TransactionalAdapter } from "@nestjs-cls/transactional-adapter-drizzle-orm";

export type DrizzleDatabase = NodePgDatabase<typeof schema>;
export type TransactionalAdapterDrizzleORM =
  TransactionalAdapter<DrizzleDatabase>;
export const DrizzleAsyncProvider = "DrizzleAsyncProvider";

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const connectionString = configService.get("database.url", {
        infer: true,
      });

      const pool = new Pool({
        connectionString,
      });

      const isDevelopment = configService.isDevelopment;

      if (isDevelopment) {
        return drizzle(pool, {
          schema,
          logger: {
            logQuery: (query, params) => {
              console.log("[Drizzle Query]", query, params);
            },
          },
        }) as DrizzleDatabase;
      }

      return drizzle(pool, { schema }) as DrizzleDatabase;
    },
  },
];
