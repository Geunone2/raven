PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_loots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer,
	`item_name` text NOT NULL,
	`grade` text DEFAULT 'rare' NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`obtained_at` text NOT NULL,
	`distribution_method` text DEFAULT 'officer_assigned' NOT NULL,
	`asking_price` integer,
	`custody_guild` text,
	`bid_deadline` text,
	`receiver` text,
	`status` text DEFAULT 'undistributed' NOT NULL,
	`note` text,
	`settled_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `content_schedules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_loots`("id", "schedule_id", "item_name", "grade", "category", "obtained_at", "distribution_method", "asking_price", "custody_guild", "bid_deadline", "receiver", "status", "note", "settled_at", "created_at") SELECT "id", "schedule_id", "item_name", "grade", "category", "obtained_at", "distribution_method", "asking_price", "custody_guild", "bid_deadline", "receiver", "status", "note", "settled_at", "created_at" FROM `loots`;--> statement-breakpoint
DROP TABLE `loots`;--> statement-breakpoint
ALTER TABLE `__new_loots` RENAME TO `loots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;