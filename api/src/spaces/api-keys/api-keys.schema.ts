import { createId } from "@paralleldrive/cuid2";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { spaces } from "../spaces.schema";
import { users } from "@/auth/users.schema";

export const spaceApiKeys = pgTable(
  "space_api_keys",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    keyHash: text("key_hash").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] })
      .notNull()
      .default("ACTIVE"),
    spaceId: text("space_id")
      .notNull()
      .references(() => spaces.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ name: "space_api_keys_pk_id", columns: [table.id] }),
    foreignKey({
      name: "space_api_keys_fk_space",
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    index("space_api_keys_idx_fk_space").on(table.spaceId),
  ],
);
