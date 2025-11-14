import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const cipherPuzzle = pgTable('cipherPuzzle', {
	id: serial('id').primaryKey(),
	word: text('word').unique(),
	cipherWord: text('cipherWord'),
	maxAttempts: integer('maxAttempts'),
	date: text('date').unique(),
	dayOfWeek: text('dayOfWeek')
});
