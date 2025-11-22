CREATE TABLE "space_api_keys" (
	"id" text NOT NULL,
	"key_hash" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"space_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "space_api_keys_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "topic_tags" (
	"id" text NOT NULL,
	"name" text NOT NULL,
	"topic_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topic_tags_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "topic_tags_unique_name_topic" UNIQUE("name","topic_id")
);
--> statement-breakpoint
CREATE TABLE "ping_actions" (
	"id" text NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"method" text,
	"headers" text,
	"body" text,
	"ping_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ping_actions_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "pings_topic_tags" (
	"ping_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pings_topic_tags_pk_id" PRIMARY KEY("ping_id","tag_id"),
	CONSTRAINT "pings_topic_tags_unique_ping_tag" UNIQUE("ping_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "pings" (
	"id" text NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"api_key_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pings_pk_id" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "space_api_keys" ADD CONSTRAINT "space_api_keys_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_api_keys" ADD CONSTRAINT "space_api_keys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_api_keys" ADD CONSTRAINT "space_api_keys_fk_space" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tags" ADD CONSTRAINT "topic_tags_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tags" ADD CONSTRAINT "topic_tags_fk_topic" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_actions" ADD CONSTRAINT "ping_actions_ping_id_pings_id_fk" FOREIGN KEY ("ping_id") REFERENCES "public"."pings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_actions" ADD CONSTRAINT "ping_actions_fk_ping" FOREIGN KEY ("ping_id") REFERENCES "public"."pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_ping_id_pings_id_fk" FOREIGN KEY ("ping_id") REFERENCES "public"."pings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_tag_id_topic_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."topic_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_fk_ping" FOREIGN KEY ("ping_id") REFERENCES "public"."pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings_topic_tags" ADD CONSTRAINT "pings_topic_tags_fk_tag" FOREIGN KEY ("tag_id") REFERENCES "public"."topic_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_api_key_id_space_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."space_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_fk_topic" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_fk_api_key" FOREIGN KEY ("api_key_id") REFERENCES "public"."space_api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "space_api_keys_idx_fk_space" ON "space_api_keys" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "topic_tags_idx_fk_topic" ON "topic_tags" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topic_tags_idx_name_fk_topic" ON "topic_tags" USING btree ("name","topic_id");--> statement-breakpoint
CREATE INDEX "ping_actions_idx_fk_ping" ON "ping_actions" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "pings_topic_tags_idx_fk_ping" ON "pings_topic_tags" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "pings_topic_tags_idx_fk_tag" ON "pings_topic_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "pings_idx_fk_topic" ON "pings" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "pings_idx_created_at" ON "pings" USING btree ("created_at");