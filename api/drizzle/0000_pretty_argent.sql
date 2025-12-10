CREATE TYPE "space_member_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "space_api_keys" (
	"id" uuid NOT NULL,
	"key_hash" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"space_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "space_api_keys_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "space_members" (
	"id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role" "space_member_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "space_members_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "space_members_unique_space_user" UNIQUE("space_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "space_pins" (
	"id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "space_pins_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "space_pins_unique_space_user" UNIQUE("space_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text,
	"owner_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "spaces_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "spaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_tags" (
	"id" uuid NOT NULL,
	"name" text NOT NULL,
	"topic_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topic_tags_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "topic_tags_unique_name_topic" UNIQUE("name","topic_id")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"name" text NOT NULL,
	"emoji" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "topics_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "ping_actions" (
	"id" uuid NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"method" text,
	"headers" text,
	"body" text,
	"ping_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ping_actions_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "ping_reads" (
	"id" uuid NOT NULL,
	"timestamp" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"space_member_id" uuid NOT NULL,
	"ping_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ping_reads_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "ping_reads_unique_member_ping" UNIQUE("space_member_id","ping_id")
);
--> statement-breakpoint
CREATE TABLE "pings_topic_tags" (
	"ping_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pings_topic_tags_pk_id" PRIMARY KEY("ping_id","tag_id"),
	CONSTRAINT "pings_topic_tags_unique_ping_tag" UNIQUE("ping_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "pings" (
	"id" uuid NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"api_key_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "pings_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "space_api_keys" ADD CONSTRAINT "space_api_keys_fk_space" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_api_keys" ADD CONSTRAINT "space_api_keys_fk_space_member" FOREIGN KEY ("created_by") REFERENCES "space_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_fk_space" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_fk_user" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_pins" ADD CONSTRAINT "space_pins_fk_space" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_pins" ADD CONSTRAINT "space_pins_fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_fk_user" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tags" ADD CONSTRAINT "topic_tags_fk_topic" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_fk_space" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_actions" ADD CONSTRAINT "ping_actions_fk_ping" FOREIGN KEY ("ping_id") REFERENCES "pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_reads" ADD CONSTRAINT "ping_reads_fk_ping" FOREIGN KEY ("ping_id") REFERENCES "pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_reads" ADD CONSTRAINT "ping_reads_fk_space_member" FOREIGN KEY ("space_member_id") REFERENCES "space_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_fk_ping" FOREIGN KEY ("ping_id") REFERENCES "pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_fk_tag" FOREIGN KEY ("tag_id") REFERENCES "topic_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_fk_topic" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_fk_api_key" FOREIGN KEY ("api_key_id") REFERENCES "space_api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "space_api_keys_idx_fk_space" ON "space_api_keys" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "space_api_keys_idx_fk_space_member" ON "space_api_keys" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "space_pins_idx_fk_space" ON "space_pins" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "space_pins_idx_fk_user" ON "space_pins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spaces_idx_fk_user" ON "spaces" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "spaces_idx_slug" ON "spaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topic_tags_idx_fk_topic" ON "topic_tags" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topic_tags_idx_name_fk_topic" ON "topic_tags" USING btree ("name","topic_id");--> statement-breakpoint
CREATE INDEX "topics_idx_fk_space" ON "topics" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "topics_idx_space_slug" ON "topics" USING btree ("space_id","slug");--> statement-breakpoint
CREATE INDEX "ping_actions_idx_fk_ping" ON "ping_actions" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "ping_reads_idx_fk_ping" ON "ping_reads" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "ping_reads_idx_fk_space_member" ON "ping_reads" USING btree ("space_member_id");--> statement-breakpoint
CREATE INDEX "pings_topic_tags_idx_fk_ping" ON "pings_topic_tags" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "pings_topic_tags_idx_fk_tag" ON "pings_topic_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "pings_idx_fk_topic" ON "pings" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "pings_idx_created_at" ON "pings" USING btree ("created_at");