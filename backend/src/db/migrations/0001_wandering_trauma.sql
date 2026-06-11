CREATE TABLE `blogs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`summary` varchar(500),
	`content` text NOT NULL,
	`image_url` varchar(500),
	`author_id` bigint,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;