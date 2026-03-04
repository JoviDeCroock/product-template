DROP INDEX `subscription_user_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_user_unique_idx` ON `subscription` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_polar_customer_unique_idx` ON `subscription` (`polar_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_polar_subscription_unique_idx` ON `subscription` (`polar_subscription_id`);