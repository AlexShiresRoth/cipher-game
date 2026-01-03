import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle, cipherPuzzleV2 } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';

export const config = {
	runtime: 'nodejs20.x'
};

// just for migrating new column
export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const puzzles = await db.select().from(cipherPuzzleV2);

	const puzzleBatch = puzzles.filter((puzzle) => !!puzzle);
	console.log('Word batch', puzzleBatch);
	const newPuzzles = await db
		.insert(cipherPuzzle)
		.values(puzzleBatch)
		.onConflictDoNothing()
		.returning();

	return json(newPuzzles);
};
