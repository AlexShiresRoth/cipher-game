CREATE TABLE "cipherPuzzleProd" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text,
	"cipherWord" text,
	"date" text,
	"dayOfWeek" text,
	CONSTRAINT "cipherPuzzleProd_word_unique" UNIQUE("word"),
	CONSTRAINT "cipherPuzzleProd_date_unique" UNIQUE("date")
);
--> statement-breakpoint
DROP TABLE "cipherPuzzle" CASCADE;