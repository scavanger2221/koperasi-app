CREATE TABLE `angsuran` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pinjaman_id` integer NOT NULL,
	`installment_number` integer NOT NULL,
	`due_date` integer NOT NULL,
	`principal_amount` real NOT NULL,
	`interest_amount` real NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`paid_date` integer,
	`late_days` integer DEFAULT 0 NOT NULL,
	`penalty_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`pinjaman_id`) REFERENCES `pinjaman`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jenis_pinjaman` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`interest_rate` real NOT NULL,
	`tenor_months` integer,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_pinjaman_code_unique` ON `jenis_pinjaman` (`code`);--> statement-breakpoint
CREATE TABLE `jenis_simpanan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_mandatory` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_simpanan_code_unique` ON `jenis_simpanan` (`code`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`nik` text,
	`address` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_code_unique` ON `members` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_nik_unique` ON `members` (`nik`);--> statement-breakpoint
CREATE TABLE `pinjaman` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`jenis_pinjaman_id` integer NOT NULL,
	`principal` real NOT NULL,
	`interest_rate` real NOT NULL,
	`tenor_months` integer NOT NULL,
	`total_interest` real NOT NULL,
	`total_payment` real NOT NULL,
	`installment_amount` real NOT NULL,
	`application_date` integer NOT NULL,
	`approval_date` integer,
	`disbursement_date` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_by` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`jenis_pinjaman_id`) REFERENCES `jenis_pinjaman`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `simpanan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`jenis_simpanan_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`date` integer NOT NULL,
	`notes` text,
	`created_by` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`jenis_simpanan_id`) REFERENCES `jenis_simpanan`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'teller' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);