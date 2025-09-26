PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_integration_variable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`integration_id` integer NOT NULL,
	`label` text,
	`direction` text NOT NULL,
	`value` text DEFAULT '{"type":"null","value":null}',
	`config` text NOT NULL,
	`store` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_integration_variable`("id", "integration_id", "label", "direction", "value", "config", "store") SELECT "id", "integration_id", "label", "direction", "value", "config", "store" FROM `integration_variable`;--> statement-breakpoint
DROP TABLE `integration_variable`;--> statement-breakpoint
ALTER TABLE `__new_integration_variable` RENAME TO `integration_variable`;--> statement-breakpoint
PRAGMA foreign_keys=ON;