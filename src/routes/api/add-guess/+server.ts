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

export const POST = async ({ request, cookies }) => {
	const secret = request.headers.get('x-api-key');
	const playerId = cookies.get('playerId');
	if (!secret || !playerId) {
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
		.where(eq(cipherGuesses.cipherId, parseInt(parsedData.cipherId)))
		.limit(1);

	const newGuessObj: Record<string, number> = {};

	if (!foundPuzzleGuessData.length) {
		parsedData.guesses.forEach((guess) => (newGuessObj[guess] = 1));

		const res = await db
			.insert(cipherGuesses)
			.values({
				date: parsedData.date,
				cipherId: parseInt(parsedData.cipherId),
				wordsGuessed: newGuessObj,
				contributors: [playerId]
			})
			.returning({
				cipherId: cipherGuesses.cipherId,
				wordsGuessed: cipherGuesses.wordsGuessed,
				id: cipherGuesses.id
			});

		return json(res[0]);
	}

	if (!foundPuzzleGuessData[0].contributors.includes(playerId)) {
		parsedData.guesses.forEach((guess) => {
			const prev = foundPuzzleGuessData[0].wordsGuessed[guess] ?? 0;
			newGuessObj[guess] = prev + 1;
		});

		const updatedGuessData = {
			date: parsedData.date,
			cipherId: parseInt(parsedData.cipherId),
			wordsGuessed: { ...foundPuzzleGuessData[0].wordsGuessed, ...newGuessObj },
			contributors: [...foundPuzzleGuessData[0].contributors, playerId]
		};

		const res = await db
			.update(cipherGuesses)
			.set({
				wordsGuessed: updatedGuessData.wordsGuessed,
				contributors: updatedGuessData.contributors
			})
			.where(eq(cipherGuesses.cipherId, parseInt(parsedData.cipherId)))
			.returning({
				cipherId: cipherGuesses.cipherId,
				wordsGuessed: cipherGuesses.wordsGuessed,
				id: cipherGuesses.id
			});

		return json(res[0]);
	}

	const { id, cipherId, wordsGuessed } = foundPuzzleGuessData[0];

	return json({ id, wordsGuessed, cipherId });
};
