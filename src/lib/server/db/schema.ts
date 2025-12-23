import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const cipherPuzzle = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	minMoves: integer('minMoves'),
	solutionPath: text('solutionPath').array().notNull()
});

export const cipherPuzzleV2 = pgTable('cipherPuzzlePathUpdate', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	solutionPath: text('solutionPath').array().notNull()
});
