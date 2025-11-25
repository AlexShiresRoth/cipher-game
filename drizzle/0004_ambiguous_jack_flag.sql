CREATE TABLE "cipherPuzzle" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text,
	"cipherWord" text,
	"date" text,
	"dayOfWeek" text,
	CONSTRAINT "cipherPuzzle_word_unique" UNIQUE("word"),
	CONSTRAINT "cipherPuzzle_date_unique" UNIQUE("date")
);
