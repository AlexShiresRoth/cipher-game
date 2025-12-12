import { env } from '$env/dynamic/private';
import { isValidWord, shuffle } from '$lib/logic';
import { bfsCipherSolver } from '$lib/logic/bfs-search.js';
import { db } from '$lib/server/db/index.js';
import { cipherPuzzle } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { format } from 'date-fns';
import { desc } from 'drizzle-orm';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.js';
import z from 'zod';
export const config = {
	runtime: 'nodejs20.x'
};

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const openAIResponse = z.object({
	words: z.array(z.string())
});

// TODO - figure out how to retry if a word is already in the database
// OR instead of chatgpt should we just shuffle the 8 letter words and then
// just upload them all to the database?
export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	async function getWordList() {
		const response = await client.responses.parse({
			model: 'gpt-4o-2024-08-06',
			input: [
				{
					role: 'system',
					content: `
					You are generating a word list of 7 words.
					Rules:
					- Choose real, common but clever 8 letter English words.
					- Do NOT output any reasoning — only structured data.
					- Response must be lowercase.

					Example output:
					{
					  "words": ["generate", "radiance", "firewood"]
					}`
				}
			],
			text: {
				format: zodTextFormat(openAIResponse, 'wordArray')
			}
		});

		return response.output_parsed;
	}

	const newWordList = await getWordList();

	if (!newWordList) {
		throw new Error('Wordlist failed to generate');
	}

	const puzzles = await db.select().from(cipherPuzzle).orderBy(desc(cipherPuzzle.date)).limit(1);

	const latestPuzzle = puzzles[0];

	newWordList.words.forEach((word) => {
		if (!isValidWord(word)) {
			throw new Error(`${word}: Invalid Word`);
		}
	});

	const latestPuzzleDate = new Date(latestPuzzle.date as string);

	const startDate = new Date(latestPuzzleDate);
	startDate.setDate(latestPuzzleDate.getDate() + 1);
	const shuffledWords = newWordList.words.map((word, i) => {
		const cipherWord = shuffle(word);

		const { minMoves } = bfsCipherSolver(cipherWord, word);

		console.log('MIN MOVES', minMoves);

		const puzzleDate = new Date(startDate);
		puzzleDate.setDate(startDate.getDate() + i);
		console.log('date?', i);
		return {
			word,
			cipherWord,
			minMoves,
			date: format(puzzleDate, 'yyyy-MM-dd')
		};
	});

	return json(shuffledWords);
};
