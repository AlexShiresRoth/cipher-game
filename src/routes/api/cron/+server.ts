import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { cipherPuzzleProd } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { Cipher } from '../../../types';

export const config = {
	runtime: 'nodejs20.x'
};

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const DAYS_OF_THE_WEEK = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

export const GET = async ({ request, url }) => {
	const secret = url.searchParams.get('token')?.toString() || request.headers.get('Authorization');

	const isAuthed = secret === env.CRON_SECRET || secret === `Bearer ${env.CRON_SECRET}`;

	if (!isAuthed) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const puzzles = (await db.select().from(cipherPuzzleProd)) || [];

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

					Rules:
					- Choose one real, common but clever 8 letter English word.
					- Generate a cipher that is a *derangement* of the word.
					A derangement means: **no letter may remain in the same index**.
					(For every index i: cipher[i] != word[i])
					- The cipher must contain exactly the same letters as the word.
					- Do NOT output any reasoning — only structured data.
					- Response must be lowercase.
					- Do not use any banned words:
					${usedWords.join(', ')}

					Example output:
					{
					"word": "function",
					"cipher": "tnucionf",
					"maxAttempts": 6,
					"date": "12/24/2025",
					"dayOfWeek": ${day}
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
	startOfWeek.setDate(today.getDate());

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
				.insert(cipherPuzzleProd)
				.values({
					...puzzle
				})
				.onConflictDoUpdate({ target: cipherPuzzleProd.date, set: { ...puzzle } });
		})
	);

	return json(cipherPuzzlePerDay);
};
