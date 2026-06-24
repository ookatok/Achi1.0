ALTER TABLE `products` ADD `allow_on_order` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `on_order_quantity` int DEFAULT 0 NOT NULL;