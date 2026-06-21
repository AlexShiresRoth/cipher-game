import { integer, jsonb, pgTable, serial, text } from 'drizzle-orm/pg-core';
import type { DayRanking } from '$lib/types';

export const cipherPuzzle = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	solutionPath: text('solutionPath').array().notNull(),
	minMoves: integer('minMoves')
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

export const dayRankings = pgTable('dayRankings', {
	id: serial('id').primaryKey(),
	rankings: jsonb('rankings')
		.$type<DayRanking>()
		.array()
		.notNull()
		.default([]),
	cipherId: integer('cipher_id')
		.notNull()
		.references(() => cipherPuzzle.id, { onDelete: 'cascade' })
});
