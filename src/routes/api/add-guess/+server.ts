import { CRON_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { cipherGuesses } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const config = {
	runtime: 'nodejs20.x'
};

type CipherRequestBody = {
	guesses: string[];
	cipherId: string;
	date: string;
};

// just for migrating new column
export const POST = async ({ request, cookies }) => {
	const secret = request.headers.get('x-api-key');

	if (!secret || !cookies.get('playerId')) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const decryptedSecret = atob(secret);

	const isAuthed = decryptedSecret === CRON_SECRET;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const data = await request.json();

	if (!data) {
		return new Response('Internal Server Error', { status: 500, statusText: 'Server Error' });
	}

	const parsedData: CipherRequestBody = JSON.parse(data);

	const foundPuzzleGuessData = await db
		.select()
		.from(cipherGuesses)
		.where(eq(cipherGuesses.cipherId, parseInt(parsedData.cipherId)));

	console.log('puzzle data', foundPuzzleGuessData);

	// TODO need to determine if user already added guesses
	if (!foundPuzzleGuessData.length) {
		await db.insert(cipherGuesses).values({
			date: parsedData.date
		});
	}

	return json({ msg: 'hi' });
};
