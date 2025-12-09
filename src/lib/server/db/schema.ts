import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const cipherPuzzle = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	minMoves: integer('minMoves')
});

export const cipherPuzzleProd = pgTable('cipherPuzzleProd', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	dayOfWeek: text('dayOfWeek')
});
