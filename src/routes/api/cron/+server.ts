import { env } from '$env/dynamic/private';
import { isValidWord, shuffle, shuffleArray } from '$lib/logic';
import { bfsCipherSolver } from '$lib/logic/bfs-search.js';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
export const config = {
	runtime: 'nodejs20.x'
};

// No longer need this to be a cron
export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const puzzles = await db.select().from(cipherPuzzle).orderBy(desc(cipherPuzzle.date)).limit(1);

	const latestPuzzle = puzzles[0];

	const words = [''];

	const newWordList = shuffleArray(words.filter((word) => word.length === 8));

	const latestPuzzleDate = new Date(latestPuzzle.date as string);

	const startDate = new Date(latestPuzzleDate);
	startDate.setDate(latestPuzzleDate.getDate() + 1);
	const shuffledWords = await Promise.all(
		newWordList.map(async (word, i) => {
			if (!word) return null;
			const lWord = word.toLowerCase();
			if (!isValidWord(lWord)) {
				return null;
			}

			const foundWord = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.word, lWord));

			if (foundWord.length > 0) {
				console.error('Word already in use', foundWord[0]);
				return null;
			}

			const cipherWord = shuffle(lWord);

			const { minMoves, path } = bfsCipherSolver(cipherWord, lWord);

			console.log('MIN MOVES', minMoves, lWord, cipherWord);

			const puzzleDate = new Date(startDate);
			puzzleDate.setDate(startDate.getDate() + i);
			console.log('date?', puzzleDate.toISOString().split('T')[0]);
			return {
				word: lWord,
				cipherWord,
				minMoves,
				date: puzzleDate.toISOString().split('T')[0],
				solutionPath: path || []
			};
		})
	);

	const wordBatch = shuffledWords.filter((puzzle) => !!puzzle);
	console.log('Word batch', wordBatch);
	const newWords = await db
		.insert(cipherPuzzle)
		.values(wordBatch)
		.onConflictDoNothing()
		.returning();

	return json(newWords);
};
