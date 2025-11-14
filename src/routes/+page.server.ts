import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import { formatInTimeZone } from 'date-fns-tz';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const load = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'no-store'
	});

	const today = new Date();
	const tzTime = formatInTimeZone(today, 'America/New_York', 'yyyy-MM-dd');

	const cipher = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.date, tzTime));

	if (cipher.length === 0) {
		return null;
	}
	return cipher[0];
};
