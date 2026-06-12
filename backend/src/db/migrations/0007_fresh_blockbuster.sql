CREATE TABLE `contact_requests` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`topic` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_requests_id` PRIMARY KEY(`id`)
);
