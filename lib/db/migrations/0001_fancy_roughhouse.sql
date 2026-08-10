CREATE TABLE `guild_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`server` text NOT NULL,
	`class_name` text NOT NULL,
	`level` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`play_time` text,
	`interests` text,
	`discord_available` integer DEFAULT false NOT NULL,
	`previous_guild` text,
	`introduction` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
