import { CRON_SECRET, DICTIONARY_API_KEY } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const config = {
	runtime: 'nodejs20.x'
};

async function validateWord(word: string) {
	const res = await fetch(
		`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${DICTIONARY_API_KEY}`
	);

	const data = await res.json();

	// If first entry is a string, this means it's suggestions
	if (typeof data[0] === 'string') {
		return new Response(JSON.stringify({ valid: false }), { status: 200 });
	}

	// if there are multiple meanings, the api provides example:1 as
	const id = data[0]?.meta?.id?.split(':')[0];

	return id === word || data[0]?.meta?.stems?.includes(word);
}

export const POST = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === CRON_SECRET || secret === `Bearer ${CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const { cipher, word, date } = (await request.json()) as {
		cipher: string;
		word: string;
		date: string;
	};

	if (!cipher || !word || !date) {
		throw new Error('Missing data');
	}

	if (cipher === word) {
		throw new Error('Whoops, looks like you forgot to shuffle');
	}

	if (!validateWord(word)) {
		throw new Error(`${word} is not valid`);
	}

	const foundWord = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.word, word));

	if (foundWord.length > 0) {
		throw new Error(`${word} already used`);
	}

	function checkPuzzleCorrectness(w: string, d: string) {
		const wArr = [];
		for (const l of d.split('')) {
			if (w.includes(l)) {
				wArr.push(l);
			}
		}

		return wArr.length === w.length;
	}

	const isValidCipher = checkPuzzleCorrectness(word, cipher);

	if (!isValidCipher) {
		throw new Error(`${word} does not match`);
	}

	const newPuzzle = {
		word: word.toLowerCase(),
		cipherWord: cipher.toLowerCase(),
		date,
		minMoves: 5,
		solutionPath: []
	};

	const customPuzzle = await db
		.insert(cipherPuzzle)
		.values({
			...newPuzzle
		})
		.onConflictDoUpdate({ target: cipherPuzzle.date, set: { ...newPuzzle } })
		.returning();

	return json(customPuzzle);
};
