import { CRON_SECRET, NODE_ENV } from '$env/static/private';
import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import type { Actions } from '@sveltejs/kit';
import { formatInTimeZone } from 'date-fns-tz';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';
export const prerender = false;
const PLAYER_COOKIE = 'playerId';

type PuzzleGuessesResponse = {
	cipherId: string;
	id: string;
	wordsGuessed: Record<string, number>;
};
export const load = async ({ setHeaders, cookies }) => {
	const playerCookie = cookies.get(PLAYER_COOKIE);

	if (!playerCookie) {
		const isProd = NODE_ENV === 'production';

		cookies.set(PLAYER_COOKIE, v4(), {
			path: '/',
			httpOnly: true,
			secure: isProd,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
			...(isProd && { domain: 'play-cipher.com' })
		});
	}

	setHeaders({
		'cache-control': 'no-store, max-age=0, must-revalidate',
		pragma: 'no-cache',
		expires: '0'
	});

	const today = new Date();
	const tzTime = formatInTimeZone(today, 'America/New_York', 'yyyy-MM-dd');

	const cipher = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.date, tzTime));

	console.log('cipher', cipher, tzTime);

	if (cipher.length === 0) {
		return null;
	}
	return { ...cipher[0] };
};

export const actions: Actions = {
	checkPuzzleGuesses: async ({
		request,
		cookies,
		fetch
	}): Promise<PuzzleGuessesResponse | { msg: string }> => {
		const formData = await request.formData();

		const playerCookie = cookies.get(PLAYER_COOKIE);

		if (!playerCookie) {
			return { msg: 'failed to add guesses, no player id' };
		}

		const puzzleData = formData.get('puzzleData');

		const res = await fetch('api/add-guess', {
			method: 'POST',
			body: JSON.stringify(puzzleData),
			headers: {
				'x-api-key': btoa(CRON_SECRET)
			}
		});

		return await res.json();
	}
};
