ALTER TABLE `loots` ADD `category` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `loots` ADD `asking_price` integer;--> statement-breakpoint
ALTER TABLE `loots` ADD `custody_guild` text;--> statement-breakpoint
ALTER TABLE `loots` ADD `bid_deadline` text;