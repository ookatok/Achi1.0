CREATE TABLE `collection_products` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`collection_id` bigint,
	`product_id` bigint,
	CONSTRAINT `collection_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` varchar(1000),
	`image_url` varchar(500),
	`publish_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `status` varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `collection_products` ADD CONSTRAINT `collection_products_collection_id_collections_id_fk` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_products` ADD CONSTRAINT `collection_products_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;