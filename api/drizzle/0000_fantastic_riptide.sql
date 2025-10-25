CREATE TYPE "public"."space_member_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text NOT NULL,
	"nickname" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "space_members" (
	"space_id" text NOT NULL,
	"member_id" text NOT NULL,
	"role" "space_member_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "space_members_pk_space_user" PRIMARY KEY("space_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text,
	"owner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "spaces_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "spaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text NOT NULL,
	"space_id" text NOT NULL,
	"name" text NOT NULL,
	"emoji" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "topics_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_fk_space" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_fk_user" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_fk_user" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_fk_space" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spaces_idx_fk_user" ON "spaces" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "spaces_idx_slug" ON "spaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topics_idx_fk_space" ON "topics" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "topics_idx_space_slug" ON "topics" USING btree ("space_id","slug");