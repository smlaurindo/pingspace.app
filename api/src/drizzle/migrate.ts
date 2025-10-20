import { Pool } from "pg";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});
const db = drizzle(connection);

async function runMigrations() {
  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "drizzle" });

  console.log("Migrations applied successfully! ✅");
}

runMigrations()
  .catch((error) => {
    console.error("Error running migrations:", error);
  })
  .finally(async () => {
    await connection.end();
    process.exit();
  });
