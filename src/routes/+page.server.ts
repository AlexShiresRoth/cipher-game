import { db } from '$lib/server/db';
import { cipherPuzzle } from '$lib/server/db/schema';
import { format } from 'date-fns';
import { eq } from 'drizzle-orm';
export const load = async () => {
	const today = new Date();
	const dateString = format(today.toLocaleDateString(), 'yyyy-MM-dd');

	const cipher = await db.select().from(cipherPuzzle).where(eq(cipherPuzzle.date, dateString));

	if (cipher.length === 0) {
		return null;
	}
	return cipher[0];
};
