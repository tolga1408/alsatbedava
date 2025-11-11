CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`filters` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`emailNotifications` int NOT NULL DEFAULT 1,
	`lastNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `listings` ADD `latitude` varchar(20);--> statement-breakpoint
ALTER TABLE `listings` ADD `longitude` varchar(20);