ALTER TABLE "cipherPuzzleTest" RENAME TO "cipherPuzzlePathUpdate";--> statement-breakpoint
ALTER TABLE "cipherPuzzlePathUpdate" DROP CONSTRAINT "cipherPuzzleTest_word_unique";--> statement-breakpoint
ALTER TABLE "cipherPuzzlePathUpdate" DROP CONSTRAINT "cipherPuzzleTest_date_unique";--> statement-breakpoint
ALTER TABLE "cipherPuzzle" ADD COLUMN "solutionPath" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "cipherPuzzlePathUpdate" DROP COLUMN "dayOfWeek";--> statement-breakpoint
ALTER TABLE "cipherPuzzlePathUpdate" ADD CONSTRAINT "cipherPuzzlePathUpdate_word_unique" UNIQUE("word");--> statement-breakpoint
ALTER TABLE "cipherPuzzlePathUpdate" ADD CONSTRAINT "cipherPuzzlePathUpdate_date_unique" UNIQUE("date");