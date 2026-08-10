ALTER TABLE `content_schedules` ADD `boss_tier` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `content_schedules` ADD `has_combat` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `content_schedules` ADD `combat_hours` real;