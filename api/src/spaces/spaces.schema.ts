import { users } from "@/auth/users.schema";
import { createId } from "@paralleldrive/cuid2";
import {
  foreignKey,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const spaces = pgTable(
  "spaces",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description").notNull(),
    description: text("description"),
    ownerId: text("owner_id").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    primaryKey({ name: "spaces_pk_id", columns: [table.id] }),
    foreignKey({
      name: "spaces_fk_user",
      columns: [table.ownerId],
      foreignColumns: [users.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
    index("spaces_idx_fk_user").on(table.ownerId),
    index("spaces_idx_slug").on(table.slug),
  ],
);

export const SPACE_ROLE_OWNER = "OWNER";
export const SPACE_ROLE_ADMIN = "ADMIN";
export const SPACE_ROLE_MEMBER = "MEMBER";

export const spaceMemberRole = pgEnum("space_member_role", [
  SPACE_ROLE_OWNER,
  SPACE_ROLE_ADMIN,
  SPACE_ROLE_MEMBER,
]);

export const spaceMembers = pgTable(
  "space_members",
  {
    spaceId: text("space_id")
      .references(() => spaces.id)
      .notNull(),
    memberId: text("member_id")
      .references(() => users.id)
      .notNull(),
    role: spaceMemberRole("role").notNull().default("MEMBER"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "space_members_pk_space_user",
      columns: [table.spaceId, table.memberId],
    }),
    foreignKey({
      name: "space_members_fk_space",
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    foreignKey({
      name: "space_members_fk_user",
      columns: [table.memberId],
      foreignColumns: [users.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
  ],
);

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
    foreignKey({
      name: "space_api_keys_fk_user",
      columns: [table.createdBy],
      foreignColumns: [users.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
    index("space_api_keys_idx_fk_space").on(table.spaceId),
  ],
);
