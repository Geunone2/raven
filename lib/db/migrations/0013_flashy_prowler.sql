CREATE TABLE `boss_timers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`fixed_time` text,
	`respawn_minutes` integer,
	`last_killed_at` text,
	`memo` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
