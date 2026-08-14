CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"memo" text,
	"loot_id" integer,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_timers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"fixed_time" text,
	"respawn_minutes" integer,
	"last_killed_at" text,
	"memo" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"target_guild" text DEFAULT '전체' NOT NULL,
	"server_name" text,
	"notice_text" text,
	"boss_tier" text DEFAULT 'none' NOT NULL,
	"boss_points" integer,
	"has_combat" boolean DEFAULT false NOT NULL,
	"combat_hours" real,
	"has_abyss_ding" boolean DEFAULT false NOT NULL,
	"reward_settled_at" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_dungeon_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"difficulty" text DEFAULT 'normal' NOT NULL,
	"clear_result" text,
	"loot" text,
	"distribution_status" text DEFAULT 'undistributed' NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL,
	CONSTRAINT "guild_dungeon_runs_schedule_id_unique" UNIQUE("schedule_id")
);
--> statement-breakpoint
CREATE TABLE "guild_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"nickname" text NOT NULL,
	"guild_name" text,
	"server" text,
	"password_hash" text NOT NULL,
	"class_name" text DEFAULT '' NOT NULL,
	"character_type" text DEFAULT 'main' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"attack" integer DEFAULT 0 NOT NULL,
	"defense" integer DEFAULT 0 NOT NULL,
	"accuracy" integer DEFAULT 0 NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"memo" text,
	"boss_points_adjustment" integer DEFAULT 0 NOT NULL,
	"stats_updated_at" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL,
	CONSTRAINT "guild_members_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE "guild_treasury_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text,
	"note" text,
	"date" text,
	"loot_id" integer,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loot_bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"loot_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loots" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_name" text NOT NULL,
	"grade" text DEFAULT 'rare' NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"obtained_at" text NOT NULL,
	"distribution_method" text DEFAULT 'officer_assigned' NOT NULL,
	"asking_price" integer,
	"custody_guild" text,
	"bid_deadline" text,
	"receiver" text,
	"status" text DEFAULT 'undistributed' NOT NULL,
	"note" text,
	"settled_at" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_stat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"level" integer NOT NULL,
	"attack" integer NOT NULL,
	"defense" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"recorded_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participations" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"status" text,
	"ticket_status" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treasury_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_tax_rate" real DEFAULT 9 NOT NULL,
	"reserve_ratio" real DEFAULT 30 NOT NULL,
	"admin_fee_ratio" real DEFAULT 6 NOT NULL,
	"participation_reward_ratio" real DEFAULT 32 NOT NULL,
	"power_reward_ratio" real DEFAULT 32 NOT NULL,
	"updated_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_member_id_guild_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."guild_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_loot_id_loots_id_fk" FOREIGN KEY ("loot_id") REFERENCES "public"."loots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_dungeon_runs" ADD CONSTRAINT "guild_dungeon_runs_schedule_id_content_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."content_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_treasury_transactions" ADD CONSTRAINT "guild_treasury_transactions_loot_id_loots_id_fk" FOREIGN KEY ("loot_id") REFERENCES "public"."loots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_bids" ADD CONSTRAINT "loot_bids_loot_id_loots_id_fk" FOREIGN KEY ("loot_id") REFERENCES "public"."loots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_bids" ADD CONSTRAINT "loot_bids_member_id_guild_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."guild_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_stat_history" ADD CONSTRAINT "member_stat_history_member_id_guild_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."guild_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_schedule_id_content_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."content_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_member_id_guild_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."guild_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_checkins" ADD CONSTRAINT "schedule_checkins_schedule_id_content_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."content_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_checkins" ADD CONSTRAINT "schedule_checkins_member_id_guild_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."guild_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "loot_bids_loot_member_idx" ON "loot_bids" USING btree ("loot_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participations_schedule_member_idx" ON "participations" USING btree ("schedule_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_checkins_schedule_member_idx" ON "schedule_checkins" USING btree ("schedule_id","member_id");