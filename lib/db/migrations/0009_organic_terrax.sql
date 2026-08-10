CREATE TABLE `loots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer,
	`item_name` text NOT NULL,
	`grade` text DEFAULT 'rare' NOT NULL,
	`obtained_at` text NOT NULL,
	`obtained_by` text,
	`distribution_method` text DEFAULT 'point' NOT NULL,
	`receiver` text,
	`status` text DEFAULT 'undistributed' NOT NULL,
	`note` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `content_schedules`(`id`) ON UPDATE no action ON DELETE set null
);
