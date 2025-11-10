ALTER TABLE "cipherPuzzle" ALTER COLUMN "date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cipherPuzzle" ADD CONSTRAINT "cipherPuzzle_date_unique" UNIQUE("date");