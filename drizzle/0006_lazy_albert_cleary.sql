DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "cipherPuzzle" ADD COLUMN "minMoves" integer;--> statement-breakpoint
ALTER TABLE "cipherPuzzle" DROP COLUMN "maxAttempts";--> statement-breakpoint
ALTER TABLE "cipherPuzzle" DROP COLUMN "dayOfWeek";