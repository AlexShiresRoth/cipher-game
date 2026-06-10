import { CRON_SECRET } from '$env/static/private';
import { validateWord } from '$lib/server/validate-word.js';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, url }) => {
	try {
		const secret =
			url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

		const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

		if (!isAuthed) {
			return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
		}

		const { words } = (await request.json()) as { words: string[] };

		if (!words.length) {
			return new Response('No words provided', { status: 400, statusText: 'No words provided' });
		}

		const validWords = await Promise.all(
			words.map(async (word) => {
				const isValid = await validateWord(word);
				return { word, isValid };
			})
		);

		return json(validWords);
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', {
			status: 500,
			statusText: 'Internal server error'
		});
	}
};
