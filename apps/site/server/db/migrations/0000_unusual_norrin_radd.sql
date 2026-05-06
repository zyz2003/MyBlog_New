CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`parent_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`title` text,
	`alt` text,
	`caption` text,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`extension` text NOT NULL,
	`storage_type` text DEFAULT 'local' NOT NULL,
	`storage_path` text NOT NULL,
	`url` text NOT NULL,
	`cdn_url` text,
	`width` integer,
	`height` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plugin_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`plugin_name` text NOT NULL,
	`config` text,
	`enabled` integer DEFAULT false NOT NULL,
	`version` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plugin_settings_plugin_name_unique` ON `plugin_settings` (`plugin_name`);--> statement-breakpoint
CREATE TABLE `post_categories` (
	`post_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`post_id`, `category_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`cover_image` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`scheduled_at` integer,
	`view_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`is_top` integer DEFAULT false NOT NULL,
	`allow_comment` integer DEFAULT true NOT NULL,
	`password` text,
	`author_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`category` text,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_settings_key_unique` ON `system_settings` (`key`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `theme_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`theme_name` text NOT NULL,
	`config` text,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `theme_settings_theme_name_unique` ON `theme_settings` (`theme_name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`display_name` text,
	`avatar` text,
	`bio` text,
	`role` text DEFAULT 'author' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);