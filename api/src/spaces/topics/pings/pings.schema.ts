import { createId } from "@paralleldrive/cuid2";
import { unique } from "drizzle-orm/pg-core";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { topics, topicTags } from "../topics.schema";
import { spaceApiKeys } from "../../spaces.schema";

export const pings = pgTable(
  "pings",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    title: text("title").notNull(),
    contentType: text("content_type", { enum: ["MARKDOWN", "JSON"] }).notNull(),
    content: text("content").notNull(),
    apiKeyId: text("api_key_id")
      .notNull()
      .references(() => spaceApiKeys.id),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ name: "pings_pk_id", columns: [table.id] }),
    foreignKey({
      name: "pings_fk_topic",
      columns: [table.topicId],
      foreignColumns: [topics.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    foreignKey({
      name: "pings_fk_api_key",
      columns: [table.apiKeyId],
      foreignColumns: [spaceApiKeys.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
    index("pings_idx_fk_topic").on(table.topicId),
    index("pings_idx_created_at").on(table.createdAt),
  ],
);

export const pingActions = pgTable(
  "ping_actions",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    type: text("type", { enum: ["HTTP", "LINK"] }).notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    method: text("method", { enum: ["GET", "POST", "PATCH", "PUT", "DELETE"] }),
    headers: text("headers"),
    body: text("body"),
    pingId: text("ping_id")
      .notNull()
      .references(() => pings.id),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ name: "ping_actions_pk_id", columns: [table.id] }),
    foreignKey({
      name: "ping_actions_fk_ping",
      columns: [table.pingId],
      foreignColumns: [pings.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    index("ping_actions_idx_fk_ping").on(table.pingId),
  ],
);

export const pingTags = pgTable(
  "pings_topic_tags",
  {
    pingId: text("ping_id")
      .notNull()
      .references(() => pings.id),
    tagId: text("tag_id")
      .notNull()
      .references(() => topicTags.id),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "pings_topic_tags_pk_id",
      columns: [table.pingId, table.tagId],
    }),
    foreignKey({
      name: "pings_topic_tags_fk_ping",
      columns: [table.pingId],
      foreignColumns: [pings.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    foreignKey({
      name: "pings_topic_tags_fk_tag",
      columns: [table.tagId],
      foreignColumns: [topicTags.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    unique("pings_topic_tags_unique_ping_tag").on(table.pingId, table.tagId),
    index("pings_topic_tags_idx_fk_ping").on(table.pingId),
    index("pings_topic_tags_idx_fk_tag").on(table.tagId),
  ],
);
