import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ConfigService } from "@/config/config.service";

export type DrizzleDatabase = NodePgDatabase<typeof schema>;
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

      return drizzle(pool, { schema }) as DrizzleDatabase;
    },
  },
];
