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
ALTER TABLE "spaces" ALTER COLUMN "short_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_fk_space" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "topics_idx_fk_space" ON "topics" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "topics_idx_space_slug" ON "topics" USING btree ("space_id","slug");