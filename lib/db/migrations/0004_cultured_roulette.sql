CREATE TABLE `participations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL,
	`member_id` integer NOT NULL,
	`planned_status` text DEFAULT 'undecided' NOT NULL,
	`actual_status` text,
	`party_name` text,
	`role` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `content_schedules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `guild_members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participations_schedule_member_idx` ON `participations` (`schedule_id`,`member_id`);