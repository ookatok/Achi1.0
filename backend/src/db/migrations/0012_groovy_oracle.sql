CREATE TABLE `faqs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`question_en` text NOT NULL,
	`question_th` text NOT NULL,
	`answer_en` text NOT NULL,
	`answer_th` text NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
