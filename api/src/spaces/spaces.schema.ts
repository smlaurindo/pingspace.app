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
