import { createId } from "@paralleldrive/cuid2";
import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .$defaultFn(() => createId())
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
