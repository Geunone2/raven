CREATE TABLE `treasury_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sale_tax_rate` real DEFAULT 9 NOT NULL,
	`reserve_ratio` real DEFAULT 30 NOT NULL,
	`admin_fee_ratio` real DEFAULT 6 NOT NULL,
	`participation_reward_ratio` real DEFAULT 32 NOT NULL,
	`power_reward_ratio` real DEFAULT 32 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
