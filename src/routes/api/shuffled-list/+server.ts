import { CRON_SECRET } from '$env/static/private';
import { shuffleArray } from '$lib';
import { WORD_LIST } from '$lib/wordlists';
import { json } from '@sveltejs/kit';

export const config = {
	runtime: 'nodejs20.x'
};

export const POST = async ({ request, url }) => {
	try {
		const secret =
			url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

		const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

		if (!isAuthed) {
			return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
		}

		const body = (await request.json()) as {
			wordLength: string;
			listLength: string;
			startIndex: string;
		};

		const { wordLength = '8', listLength = '50', startIndex = '0' } = body;

		console.log(body);

		const parsedWordLength = parseInt(wordLength);

		const parsedListLength = parseInt(listLength);

		const parsedStartIndex = parseInt(startIndex);

		if (parsedWordLength < 3 || parsedWordLength > 12) {
			return new Response('Invalid word length', {
				status: 400,
				statusText: 'Invalid word length'
			});
		}

		const shuffledWords = shuffleArray(WORD_LIST[parseInt(wordLength)].words).slice(
			parsedStartIndex,
			parsedStartIndex + parsedListLength
		);

		return json(shuffledWords);
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', {
			status: 500,
			statusText: 'Internal server error'
		});
	}
};
