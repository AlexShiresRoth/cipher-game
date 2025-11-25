import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const cipherPuzzle = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	maxAttempts: integer('maxAttempts'),
	dayOfWeek: text('dayOfWeek')
});

export const cipherPuzzleProd = pgTable('cipherPuzzleProd', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	date: text('date').unique(),
	dayOfWeek: text('dayOfWeek')
});
