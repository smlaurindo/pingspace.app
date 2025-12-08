CREATE TABLE "space_pins" (
	"id" text NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "space_pins_pk_id" PRIMARY KEY("id"),
	CONSTRAINT "space_pins_unique_space_user" UNIQUE("space_id","user_id")
);
--> statement-breakpoint

ALTER TABLE "space_pins" ADD CONSTRAINT "space_pins_fk_space" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_pins" ADD CONSTRAINT "space_pins_fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "space_pins_idx_fk_space" ON "space_pins" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "space_pins_idx_fk_user" ON "space_pins" USING btree ("user_id");