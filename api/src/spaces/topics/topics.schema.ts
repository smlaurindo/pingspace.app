import { createId } from "@paralleldrive/cuid2";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { spaces } from "../spaces.schema";
import { boolean } from "drizzle-orm/pg-core";

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
    isPinned: boolean("is_pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
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

export const topicTags = pgTable(
  "topic_tags",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    name: text("name").notNull(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ name: "topic_tags_pk_id", columns: [table.id] }),

    foreignKey({
      name: "topic_tags_fk_topic",
      columns: [table.topicId],
      foreignColumns: [topics.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),

    unique("topic_tags_unique_name_topic").on(table.name, table.topicId),

    index("topic_tags_idx_fk_topic").on(table.topicId),

    index("topic_tags_idx_name_fk_topic").on(table.name, table.topicId),
  ],
);
