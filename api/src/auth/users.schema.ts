import { v7 as uuidv7 } from "uuid";
import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .notNull(),
    nickname: text("nickname").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [primaryKey({ name: "users_pk_id", columns: [table.id] })],
);
