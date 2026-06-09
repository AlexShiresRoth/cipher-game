import { CRON_SECRET } from '$env/static/private';
import { shuffle } from '$lib';
import { bfsCipherSolver } from '$lib/logic/bfs-search.js';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { validateWord } from '$lib/server/validate-word.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { CipherPuzzle } from '../../../types.js';

export const config = {
	runtime: 'nodejs20.x'
};

export const POST = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}
	try {
		const { words } = (await request.json()) as { words: string[] };

		if (!words.length) {
			return new Response('No words provided', { status: 400, statusText: 'No words provided' });
		}

		const puzzles = await Promise.all(
			words.map(async (word) => {
				if (word.length !== 8) return null;

				const exists = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.word, word));
				console.log('exists', exists);
				if (!exists.length) {
					const isValid = await validateWord(word);
					const cipherWord = shuffle(word);
					const { minMoves, path } = bfsCipherSolver(cipherWord, word);
					if (isValid) {
						return {
							word,
							cipherWord,
							minMoves,
							solutionPath: path
						} as CipherPuzzle;
					}
				}
				return null;
			})
		);

		const filteredPuzzles = puzzles.filter(Boolean) as CipherPuzzle[];

		console.log('Puzzles', filteredPuzzles);

		return json(filteredPuzzles);
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', {
			status: 500,
			statusText: 'Internal server error'
		});
	}
};
