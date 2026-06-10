import { integer, jsonb, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const cipherPuzzleDeprecated = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	minMoves: integer('minMoves'),
	solutionPath: text('solutionPath').array().notNull()
});

export const cipherPuzzle = pgTable('cipherPuzzleV2', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	solutionPath: text('solutionPath').array().notNull()
});

export const cipherGuesses = pgTable('cipherGuesses', {
	id: serial('id').primaryKey(),
	date: text('date').unique(),
	wordsGuessed: jsonb('words_guessed').$type<Record<string, number>>().notNull().default({}),
	cipherId: integer('cipher_id')
		.notNull()
		.references(() => cipherPuzzle.id, { onDelete: 'cascade' }),
	contributors: text('contributors').array().notNull()
});
