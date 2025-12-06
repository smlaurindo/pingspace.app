import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool, type PoolConfig } from "pg";
import * as schema from "@/drizzle/schema";
import { randomUUID } from "node:crypto";
import { ClsModule } from "nestjs-cls";
import {
  ClsPluginTransactional,
  TransactionHost,
} from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleOrm } from "@nestjs-cls/transactional-adapter-drizzle-orm";
import { Test } from "@nestjs/testing";
import { Module } from "@nestjs/common";

function generateRandomSchemaName() {
  return `test_schema_${randomUUID().replace(/-/g, "_")}`;
}

async function executeMigrations(
  db: NodePgDatabase<typeof schema>,
  schemaName: string,
) {
  await migrate(db, {
    migrationsFolder: "drizzle",
    migrationsSchema: schemaName,
  });
}

export async function setupTestDatabase(
  config: PoolConfig & { connectionString: string },
) {
  const schemaName = generateRandomSchemaName();
  const setupPool = new Pool(config);

  try {
    await setupPool.query(`CREATE SCHEMA "${schemaName}"`);
  } finally {
    await setupPool.end();
  }

  const pool = new Pool({
    ...config,
    options: `-c search_path=${schemaName}`,
  });

  const db = drizzle(pool, { schema });

  await executeMigrations(db, schemaName);

  return {
    pool,
    db,
    schemaName,
    cleanupFn: async () => {
      await pool.end();

      const cleanupPool = new Pool(config);

      try {
        await cleanupPool.query(`DROP SCHEMA "${schemaName}" CASCADE`);
      } finally {
        await cleanupPool.end();
      }
    },
  };
}

export async function getTestTransactionHost(
  db: NodePgDatabase<typeof schema>,
) {
  const drizzleInstanceToken = "TestDrizzleInstanceToken";

  const drizzleProvider = {
    provide: drizzleInstanceToken,
    useFactory: () => db,
  };

  @Module({
    providers: [drizzleProvider],
    exports: [drizzleInstanceToken],
  })
  class TestDrizzleModule {}

  const clsModule = ClsModule.forRoot({
    plugins: [
      new ClsPluginTransactional({
        imports: [TestDrizzleModule],
        adapter: new TransactionalAdapterDrizzleOrm({
          drizzleInstanceToken,
        }),
      }),
    ],
  });

  const testModule = await Test.createTestingModule({
    imports: [clsModule],
  }).compile();

  return testModule.get(TransactionHost);
}
