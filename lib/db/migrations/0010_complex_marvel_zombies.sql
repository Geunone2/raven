CREATE TABLE `loot_bids` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loot_id` integer NOT NULL,
	`member_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`loot_id`) REFERENCES `loots`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `guild_members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loot_bids_loot_member_idx` ON `loot_bids` (`loot_id`,`member_id`);--> statement-breakpoint
ALTER TABLE `guild_applications` ADD `password_hash` text NOT NULL;--> statement-breakpoint
ALTER TABLE `guild_members` ADD `password_hash` text NOT NULL;