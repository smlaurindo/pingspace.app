CREATE INDEX "ping_reads_idx_fk_ping" ON "ping_reads" USING btree ("ping_id");--> statement-breakpoint
CREATE INDEX "ping_reads_idx_fk_space_member" ON "ping_reads" USING btree ("space_member_id");