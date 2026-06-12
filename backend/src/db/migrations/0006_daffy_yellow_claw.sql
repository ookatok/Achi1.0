CREATE TABLE `product_tags` (
	`product_id` bigint NOT NULL,
	`tag_id` bigint NOT NULL,
	CONSTRAINT `product_tags_product_id_tag_id_pk` PRIMARY KEY(`product_id`,`tag_id`)
);
--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `tags_id`;