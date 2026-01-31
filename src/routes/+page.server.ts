import { NODE_ENV } from '$env/static/private';
import { db } from '$lib/server/db';
import { cipherGuesses, cipherPuzzle } from '$lib/server/db/schema';
import { formatInTimeZone } from 'date-fns-tz';
import { eq } from 'drizzle-orm';
import { v4 } from 'uuid';
export const prerender = false;
const PLAYER_COOKIE = 'playerId';

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

	const cipherPlayerData = await db
		.select()
		.from(cipherGuesses)
		.where(eq(cipherGuesses.cipherId, cipher[0].id))
		.limit(1);

	if (!cipherPlayerData[0]) {
		return { ...cipher[0] };
	}

	const { wordsGuessed, cipherId, date } = cipherPlayerData[0];

	return { ...cipher[0], cipherPlayerData: { wordsGuessed, cipherId, date } };
};
