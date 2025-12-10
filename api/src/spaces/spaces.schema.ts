import { users } from "@/auth/users.schema";
import { v7 as uuidv7 } from "uuid";
import {
  boolean,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const spaces = pgTable(
  "spaces",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description").notNull(),
    description: text("description"),
    ownerId: uuid("owner_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
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
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .notNull(),
    spaceId: uuid("space_id")
      .references(() => spaces.id)
      .notNull(),
    memberId: uuid("member_id")
      .references(() => users.id)
      .notNull(),
    role: spaceMemberRole("role").notNull().default(SPACE_ROLE_MEMBER),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
      precision: 0,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "space_members_pk_id",
      columns: [table.id],
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
    unique("space_members_unique_space_user").on(table.spaceId, table.memberId),
  ],
);

export const spaceApiKeys = pgTable(
  "space_api_keys",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .notNull(),
    keyHash: text("key_hash").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] })
      .notNull()
      .default("ACTIVE"),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => spaceMembers.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "date" }),
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
      name: "space_api_keys_fk_space_member",
      columns: [table.createdBy],
      foreignColumns: [spaceMembers.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
    index("space_api_keys_idx_fk_space").on(table.spaceId),
    index("space_api_keys_idx_fk_space_member").on(table.createdBy),
  ],
);

export const spacePins = pgTable(
  "space_pins",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .notNull(),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    primaryKey({ name: "space_pins_pk_id", columns: [table.id] }),
    foreignKey({
      name: "space_pins_fk_space",
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    foreignKey({
      name: "space_pins_fk_user",
      columns: [table.userId],
      foreignColumns: [users.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
    unique("space_pins_unique_space_user").on(table.spaceId, table.userId),
    index("space_pins_idx_fk_space").on(table.spaceId),
    index("space_pins_idx_fk_user").on(table.userId),
  ],
);
