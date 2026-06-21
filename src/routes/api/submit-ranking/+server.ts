import type { DayRanking, Tier } from '$lib';
import { db } from '$lib/server/db';
import { dayRankings } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, cookies }) => {
	const playerId = cookies.get('playerId');

	if (!playerId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const parsedData = await request.json();

	if (!parsedData) {
		return new Response('Internal Server Error', { status: 500 });
	}

	const { cipherId, tier } = parsedData as {
		cipherId: string;
		tier: Tier;
	};

	if (!cipherId || !tier) {
		return new Response('Bad Request', { status: 400 });
	}

	const dayRanking = await db
		.select()
		.from(dayRankings)
		.where(eq(dayRankings.cipherId, parseInt(cipherId)))
		.limit(1);

	const entry: DayRanking = { [playerId]: { mistakes: tier.mistakes, emoji: tier.emoji } };

	if (!dayRanking.length) {
		const playerRanking = await db
			.insert(dayRankings)
			.values({
				cipherId: parseInt(cipherId),
				rankings: [entry]
			})
			.returning();

		return json(playerRanking[0].rankings);
	} else {
		const playerRanking = await db
			.update(dayRankings)
			.set({
				rankings: [...dayRanking[0].rankings, entry]
			})
			.where(eq(dayRankings.cipherId, parseInt(cipherId)))
			.returning();

		return json(playerRanking[0].rankings);
	}
};
