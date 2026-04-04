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
	const playerId = cookies.get('playerId');

	if (!playerId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const parsedData: CipherRequestBody = await request.json();

	if (!parsedData) {
		return new Response('Internal Server Error', { status: 500 });
	}

	const cipherId = parseInt(parsedData.cipherId);

	const found = await db
		.select()
		.from(cipherGuesses)
		.where(eq(cipherGuesses.cipherId, cipherId))
		.limit(1);

	const newGuessObj: Record<string, number> = {};

	// If no record exists → create it
	if (!found.length) {
		parsedData.guesses.forEach((guess) => {
			newGuessObj[guess] = 1;
		});

		const res = await db
			.insert(cipherGuesses)
			.values({
				date: parsedData.date,
				cipherId,
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

	// Existing record
	const existing = found[0];

	// ALWAYS increment guesses
	parsedData.guesses.forEach((guess) => {
		const prev = existing.wordsGuessed[guess] ?? 0;
		newGuessObj[guess] = prev + 1;
	});

	// Merge counts
	const mergedWords = {
		...existing.wordsGuessed,
		...newGuessObj
	};

	//  Only add contributor if not already there
	const contributors = existing.contributors.includes(playerId)
		? existing.contributors
		: [...existing.contributors, playerId];

	const res = await db
		.update(cipherGuesses)
		.set({
			wordsGuessed: mergedWords,
			contributors
		})
		.where(eq(cipherGuesses.cipherId, cipherId))
		.returning({
			cipherId: cipherGuesses.cipherId,
			wordsGuessed: cipherGuesses.wordsGuessed,
			id: cipherGuesses.id
		});

	return json(res[0]);
};
