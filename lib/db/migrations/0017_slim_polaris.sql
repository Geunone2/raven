ALTER TABLE `guild_members` ADD `character_type` text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE `guild_members` ADD `stats_updated_at` text;