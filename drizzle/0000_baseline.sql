CREATE TABLE "cipherGuesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text,
	"words_guessed" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cipher_id" integer NOT NULL,
	"contributors" text[] NOT NULL,
	CONSTRAINT "cipherGuesses_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "cipherPuzzle" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text,
	"cipherWord" text,
	"date" text,
	"solutionPath" text[] NOT NULL,
	"minMoves" integer,
	CONSTRAINT "cipherPuzzle_word_unique" UNIQUE("word"),
	CONSTRAINT "cipherPuzzle_date_unique" UNIQUE("date")
);
--> statement-breakpoint
ALTER TABLE "cipherGuesses" ADD CONSTRAINT "cipherGuesses_cipher_id_cipherPuzzle_id_fk" FOREIGN KEY ("cipher_id") REFERENCES "public"."cipherPuzzle"("id") ON DELETE cascade ON UPDATE no action;