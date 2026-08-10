CREATE TABLE `guild_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`class_name` text NOT NULL,
	`level` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`last_login_at` text,
	`abyss_ticket_status` text DEFAULT 'needs_check' NOT NULL,
	`memo` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
