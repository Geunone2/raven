DROP TABLE `guild_applications`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_guild_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`guild_name` text,
	`password_hash` text NOT NULL,
	`class_name` text DEFAULT '' NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`attack` integer DEFAULT 0 NOT NULL,
	`defense` integer DEFAULT 0 NOT NULL,
	`accuracy` integer DEFAULT 0 NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`last_login_at` text,
	`memo` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_guild_members`("id", "nickname", "guild_name", "password_hash", "class_name", "level", "attack", "defense", "accuracy", "role", "last_login_at", "memo", "created_at") SELECT "id", "nickname", "guild_name", "password_hash", "class_name", "level", "attack", "defense", "accuracy", "role", "last_login_at", "memo", "created_at" FROM `guild_members`;--> statement-breakpoint
DROP TABLE `guild_members`;--> statement-breakpoint
ALTER TABLE `__new_guild_members` RENAME TO `guild_members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `guild_members_nickname_unique` ON `guild_members` (`nickname`);