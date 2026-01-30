CREATE TABLE "cipherGuesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text,
	"words_guessed" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "cipherGuesses_date_unique" UNIQUE("date")
);
