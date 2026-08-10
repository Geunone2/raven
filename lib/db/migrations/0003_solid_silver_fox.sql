CREATE TABLE `content_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`gather_time` text,
	`start_time` text NOT NULL,
	`expected_end_time` text,
	`target_audience` text DEFAULT 'all' NOT NULL,
	`location` text,
	`required_item` text,
	`notice_text` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
