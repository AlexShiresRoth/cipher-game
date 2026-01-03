CREATE TABLE "cipherPuzzleTest" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text,
	"cipherWord" text,
	"date" text,
	"dayOfWeek" text,
	"solutionPath" text[] NOT NULL,
	CONSTRAINT "cipherPuzzleTest_word_unique" UNIQUE("word"),
	CONSTRAINT "cipherPuzzleTest_date_unique" UNIQUE("date")
);
--> statement-breakpoint
DROP TABLE "cipherPuzzleProd" CASCADE;