import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzleProd } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { format } from 'date-fns';

export const config = {
	runtime: 'nodejs20.x'
};

function getDayName(date = new Date()) {
	return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
		date.getDay()
	];
}

/// TODO we need to test to make sure we can add words via request from last puzzle date

export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const WORD_LIST: { wordList: { word: string; cipherWord: string }[] } = await request.json();

	if (WORD_LIST.wordList.length === 0) {
		throw new Error('Please provide word list');
	}

	const puzzles = (await db.select().from(cipherPuzzleProd)) || [];

	const mostRecentPuzzle = puzzles[puzzles.length - 1];
	if (!mostRecentPuzzle.date) {
		throw new Error('Need a most recent puzzle date');
	}
	const usedWords = puzzles
		.map((p) => p.word)
		.slice(puzzles.length - 30 > 0 ? puzzles.length - 30 : 0, puzzles.length);

	const today = new Date(mostRecentPuzzle.date);
	const newDay = new Date(today);
	newDay.setDate(today.getDate() + 1);
	console.log('new day?', newDay);
	function checkPuzzleCorrectNess(w: string, d: string) {
		const wArr = [];
		for (const l of d.split('')) {
			if (w.includes(l)) {
				wArr.push(l);
			}
		}
		console.log('Shuffled:', d.length);
		console.log('Word', w.length);
		return wArr.length === w.length;
	}

	const customPuzzles = await Promise.all(
		WORD_LIST.wordList.map(async (puzzle, i) => {
			const day = new Date(newDay);
			const isValidCipher = checkPuzzleCorrectNess(puzzle.word, puzzle.cipherWord);
			if (!isValidCipher) {
				throw new Error(`${puzzle.word} does not match`);
			}
			if (usedWords.includes(puzzle.word)) {
				throw new Error(`${puzzle.word} has been used recently`);
			}
			const newDate = day.setDate(day.getDate() + i);
			const newPuzzle = {
				...puzzle,
				date: format(newDate, 'yyyy-MM-dd'),
				maxAttempts: 6,
				dayOfWeek: getDayName(new Date(day))
			};
			return await db
				.insert(cipherPuzzleProd)
				.values({
					...newPuzzle
				})
				.onConflictDoUpdate({ target: cipherPuzzleProd.date, set: { ...newPuzzle } })
				.returning();
		})
	);

	return json(customPuzzles);
};
