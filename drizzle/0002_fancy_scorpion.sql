CREATE TABLE `drops` (
	`drop_id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files` (
	`file_id` text PRIMARY KEY NOT NULL,
	`drop_id` text NOT NULL,
	`file_path` text NOT NULL,
	`metadata_json` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `drop_id_idx` ON `files` (`drop_id`);