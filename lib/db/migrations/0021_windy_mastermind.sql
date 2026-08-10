CREATE TABLE `member_stat_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`level` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`recorded_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `guild_members`(`id`) ON UPDATE no action ON DELETE cascade
);
