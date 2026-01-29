import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const puzzles = await db.select().from(cipherPuzzle).orderBy(desc(cipherPuzzle.date));

	return json(puzzles);
};
