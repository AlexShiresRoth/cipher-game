import { CRON_SECRET, OPENAI_API_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { Cipher } from '../../../types';

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

const DAYS_OF_THE_WEEK = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

export const GET: RequestHandler = async (request) => {
	const secret = request.url.searchParams.get('token')?.toString() || CRON_SECRET;

	if (!secret || secret !== CRON_SECRET) {
		const blob = new Blob();

		return new Response(blob, { status: 400, statusText: 'Unauthorized' });
	}

	const puzzles = await db.select().from(cipherPuzzle);

	const usedWords = puzzles
		.map((p) => p.word)
		.slice(puzzles.length - 30 > 0 ? puzzles.length - 30 : 0, puzzles.length);

	async function getCipher(day: string) {
		const response = await client.responses.parse({
			model: 'gpt-4o-2024-08-06',
			input: [
				{
					role: 'system',
					content: `
				You are generating a daily puzzle for a word-based logic game.

				The rules:
				- Choose one real, common but clever 7-letter to 8-letter English word.
				- Shuffle its letters to create a new cipher that is not identical to the original word.
				- None of the letters in the cipher should be in the correct position when shuffled
				- Estimate a reasonable number of maximum attempts (3–6) a player would need to solve it.
				This should roughly scale with how scrambled the word is (more jumbled → more attempts).
				- Do NOT include any explanation or reasoning — just return structured data.
				- Response should always be lowercase
				- BANNED WORDS (do NOT use any of these):
				${usedWords.join(', ')}
				- The word and cipher MUST contain the same letters.
				Example:
				{
				"word": "function",
				"cipher": "tnucionf",
				"maxAttempts": 6,
                "date": 12/24/2025,
                "dayOfWeek": ${day},
				}`
				}
			],
			text: {
				format: zodTextFormat(Cipher, 'cipher')
			}
		});

		return response.output_parsed;
	}

	const today = new Date();
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() + 1);

	let dayIndex = today.getDay();
	const DAYS: typeof DAYS_OF_THE_WEEK = [];
	DAYS_OF_THE_WEEK.forEach(() => {
		today.setDate(today.getDate() + dayIndex);
		if (dayIndex < DAYS_OF_THE_WEEK.length - 1) {
			dayIndex++;
		} else {
			dayIndex = 0;
		}
		DAYS.push(DAYS_OF_THE_WEEK[dayIndex]);
	});

	const cipherPuzzlePerDay = await Promise.all(
		DAYS.map(async (day, i) => {
			const date = new Date(startOfWeek);
			date.setDate(startOfWeek.getDate() + i);
			const res = await getCipher(day);

			return {
				...res,
				dayOfWeek: day,
				cipherWord: res?.cipherWord
					.split('')
					.filter((l) => res.word.includes(l))
					.join(''),
				date: date.toISOString().split('T')[0]
			};
		})
	);

	await Promise.all(
		cipherPuzzlePerDay.map(async (puzzle) => {
			await db
				.insert(cipherPuzzle)
				.values({
					...puzzle
				})
				.onConflictDoUpdate({ target: cipherPuzzle.date, set: { ...puzzle } });
		})
	);

	return json(cipherPuzzlePerDay);
};
