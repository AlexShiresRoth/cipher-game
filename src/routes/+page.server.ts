import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
	const today = new Date();
	const dateString = today.toISOString().split('T')[0];

	const cipher = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.date, dateString));

	if (cipher.length === 0) {
		return null;
	}
	return cipher[0];
};
