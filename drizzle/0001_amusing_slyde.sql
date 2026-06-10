ALTER TABLE "cipherPuzzleV3" RENAME TO "cipherPuzzleV2";--> statement-breakpoint
ALTER TABLE "cipherPuzzleV2" DROP CONSTRAINT "cipherPuzzleV3_word_unique";--> statement-breakpoint
ALTER TABLE "cipherPuzzleV2" DROP CONSTRAINT "cipherPuzzleV3_date_unique";--> statement-breakpoint
ALTER TABLE "cipherPuzzleV2" ADD CONSTRAINT "cipherPuzzleV2_word_unique" UNIQUE("word");--> statement-breakpoint
ALTER TABLE "cipherPuzzleV2" ADD CONSTRAINT "cipherPuzzleV2_date_unique" UNIQUE("date");