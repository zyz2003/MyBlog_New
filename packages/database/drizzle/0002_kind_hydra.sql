CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_name` text,
	`path` text NOT NULL,
	`url` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`thumbnail_path` text,
	`folder_id` text,
	`uploaded_by` text,
	`uploaded_at` integer,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `media_uploaded_by_idx` ON `media` (`uploaded_by`);
--> statement-breakpoint
CREATE INDEX `media_mime_type_idx` ON `media` (`mime_type`);
--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folder_id`);
