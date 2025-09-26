CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `username_idx` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `loxone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`active` integer DEFAULT false,
	`label` text,
	`host` text NOT NULL,
	`port` integer NOT NULL,
	`listen_port` integer NOT NULL,
	`remote_id` text(8) NOT NULL,
	`own_id` text(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loxone_variables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loxone_id` integer NOT NULL,
	`label` text,
	`direction` text NOT NULL,
	`packet_id` text(8) NOT NULL,
	`value` text DEFAULT '{"type":"null","value":null}',
	`suffix` text,
	`forced` integer DEFAULT false NOT NULL,
	`forced_value` text DEFAULT '{"type":"null","value":null}',
	`type` integer NOT NULL,
	FOREIGN KEY (`loxone_id`) REFERENCES `loxone`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text,
	`type` text NOT NULL,
	`config` text
);
--> statement-breakpoint
CREATE TABLE `integration_variable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`integration_id` integer NOT NULL,
	`label` text,
	`direction` text NOT NULL,
	`value` text DEFAULT '{"type":"null","value":null}',
	`config` text NOT NULL,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loxone_variable_id` integer NOT NULL,
	`integration_variable_id` integer NOT NULL,
	FOREIGN KEY (`loxone_variable_id`) REFERENCES `loxone_variables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`integration_variable_id`) REFERENCES `integration_variable`(`id`) ON UPDATE no action ON DELETE cascade
);
