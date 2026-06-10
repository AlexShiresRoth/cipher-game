import { CRON_SECRET } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema';
import { validateWord } from '$lib/server/validate-word';
import { json } from '@sveltejs/kit';
import { asc, gte } from 'drizzle-orm';

export const POST = async ({ request, url }) => {
	try {
		const secret =
			url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

		const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

		if (!isAuthed) {
			return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
		}

		const { startId } = await request.json();

		// get puzzles from inputted start id
		const puzzles = await db
			.select()
			.from(cipherPuzzle)
			.where(gte(cipherPuzzle.id, startId))
			.orderBy(asc(cipherPuzzle.id));

		const validatedPuzzles = await Promise.all(
			puzzles.map(async (puzzle) => {
				if (!puzzle.word) return;

				const isValid = await validateWord(puzzle.word);
				if (!isValid) {
					console.log('puzzle is not valid', puzzle.word);
					return;
				}

				return puzzle;
			})
		);

		const validPuzzles = validatedPuzzles.filter((p) => !!p);

		const newPuzzles = await db
			.insert(cipherPuzzle)
			.values(
				validPuzzles.map((puzzle, index) => ({
					id: startId + index,
					word: puzzle.word,
					cipherWord: puzzle.cipherWord,
					date: puzzle.date,
					solutionPath: puzzle.solutionPath
				}))
			)
			.onConflictDoNothing()
			.returning();

		return json(newPuzzles);
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', {
			status: 500,
			statusText: 'Internal server error'
		});
	}
};
