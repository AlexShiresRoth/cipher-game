import { OPENAI_API_KEY, SECRET_KEY } from '$env/static/private';
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
	const secret = request.url.searchParams.get('token');

	if (!secret) {
		return new Response();
	}
	if (secret.toString() !== SECRET_KEY) {
		return new Response();
	}

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
				- Estimate a reasonable number of maximum attempts (3–6) a player would need to solve it.
				This should roughly scale with how scrambled the word is (more jumbled → more attempts).
				- Do NOT include any explanation or reasoning — just return structured data.
				- Response should always be lowercase
				- Do not reuse words
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
	const cipherPuzzlePerDay = await Promise.all(
		DAYS_OF_THE_WEEK.map(async (day, i) => {
			const date = new Date(startOfWeek);
			date.setDate(startOfWeek.getDate() + i);
			const res = await getCipher(day);

			return {
				...res,
				dayOfWeek: day,
				date: date.toISOString().split('T')[0],
				index: i
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
