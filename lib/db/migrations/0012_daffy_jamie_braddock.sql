CREATE TABLE `bank_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`memo` text,
	`loot_id` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `guild_members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`loot_id`) REFERENCES `loots`(`id`) ON UPDATE no action ON DELETE set null
);
