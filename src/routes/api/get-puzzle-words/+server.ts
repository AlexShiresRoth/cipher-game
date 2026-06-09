import { CRON_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const puzzles = await db.select().from(cipherPuzzle).orderBy(desc(cipherPuzzle.id));

	return json(puzzles.map((puzzle) => puzzle.word));
};
