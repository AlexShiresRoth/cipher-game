import { db } from '$lib/server/db';
import { cipherPuzzleProd } from '$lib/server/db/schema';
import { formatInTimeZone } from 'date-fns-tz';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const load = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'no-store, max-age=0, must-revalidate',
		pragma: 'no-cache',
		expires: '0'
	});

	const today = new Date();
	const tzTime = formatInTimeZone(today, 'America/New_York', 'yyyy-MM-dd');

	const cipher = await db.select().from(cipherPuzzleProd).where(eq(cipherPuzzleProd.date, tzTime));

	console.log('cipher', cipher, tzTime);

	if (cipher.length === 0) {
		return null;
	}
	return { ...cipher[0] };
};
