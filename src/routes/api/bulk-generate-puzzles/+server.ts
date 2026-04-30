import { CRON_SECRET } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
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

	const { puzzles } = (await request.json()) as { puzzles: Omit<CipherPuzzle, 'id'>[] };

	if (!puzzles.length) {
		return new Response('No puzzles provided', { status: 400, statusText: 'No puzzles provided' });
	}

	console.log('Puzzles', puzzles);

	const newPuzzles = await db
		.insert(cipherPuzzle)
		.values(puzzles)
		.onConflictDoNothing()
		.returning();

	return json(newPuzzles);
};
