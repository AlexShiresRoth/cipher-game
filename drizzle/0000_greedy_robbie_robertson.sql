CREATE TABLE "cipherPuzzle" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text,
	"cipherWord" text,
	"maxAttempts" integer,
	"date" date,
	"dayOfWeek" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"age" integer
);
