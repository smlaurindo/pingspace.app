import { spaces } from "@/spaces/spaces.schema";
import { createId } from "@paralleldrive/cuid2";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const topics = pgTable(
  "topics",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    spaceId: text("space_id")
      .notNull()
      .references(() => spaces.id),
    name: text("name").notNull(),
    emoji: text("emoji").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ name: "topics_pk_id", columns: [table.id] }),
    foreignKey({
      name: "topics_fk_space",
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    index("topics_idx_fk_space").on(table.spaceId),
    index("topics_idx_space_slug").on(table.spaceId, table.slug),
  ],
);
