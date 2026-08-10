CREATE TABLE `guild_dungeon_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL,
	`difficulty` text DEFAULT 'normal' NOT NULL,
	`clear_result` text,
	`loot` text,
	`distribution_status` text DEFAULT 'undistributed' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `content_schedules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guild_dungeon_runs_schedule_id_unique` ON `guild_dungeon_runs` (`schedule_id`);