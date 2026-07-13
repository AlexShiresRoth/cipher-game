import { CRON_SECRET } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	try {
		const puzzles = await db.select().from(cipherPuzzle);

		const updatedPuzzles = await Promise.all(
			puzzles.map(async (p) => {
				return await db
					.update(cipherPuzzle)
					.set({
						minMoves: p.solutionPath.length - 1
					})
					.where(eq(cipherPuzzle.id, p.id))
					.returning({
						id: cipherPuzzle.id,
						minMoves: cipherPuzzle.minMoves,
						solutionPath: cipherPuzzle.solutionPath
					});
			})
		);
		return json(
			updatedPuzzles[0].map((p) => ({
				cipherId: p.id,
				minMoves: p.minMoves,
				solutionPath: p.solutionPath.length
			}))
		);
	} catch (error) {
		return json({ error }, { status: 500 });
	}
};
