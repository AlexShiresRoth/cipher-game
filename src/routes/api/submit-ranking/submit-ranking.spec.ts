import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './+server';

const mocks = vi.hoisted(() => ({
	selectLimit: vi.fn(),
	insertValues: vi.fn(),
	insertReturning: vi.fn(),
	updateReturning: vi.fn()
}));

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({ limit: mocks.selectLimit }))
			}))
		})),
		insert: vi.fn(() => ({ values: mocks.insertValues })),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => ({ returning: mocks.updateReturning }))
			}))
		}))
	}
}));

vi.mock('$lib/server/db/schema', () => ({ dayRankings: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

const mockTier = { mistakes: 0, emoji: '💎', phrase: 'Righteous solve!' };

const existingRanking = {
	id: 1,
	cipherId: 1,
	rankings: [{ 'player-2': { mistakes: 1, emoji: '🥇' } }]
};

function makeEvent(options: { playerId?: string; body?: object }) {
	return {
		request: { json: vi.fn().mockResolvedValue(options.body ?? { cipherId: '1', tier: mockTier }) },
		cookies: { get: vi.fn().mockReturnValue(options.playerId) }
	} as Parameters<typeof POST>[0];
}

describe('POST /api/submit-ranking', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.insertValues.mockReturnValue({ returning: mocks.insertReturning });
	});

	describe('authentication', () => {
		it('returns 401 when no playerId cookie is present', async () => {
			const response = await POST(makeEvent({ playerId: undefined }));
			expect(response.status).toBe(401);
		});
	});

	describe('validation', () => {
		it('returns 400 when cipherId is missing', async () => {
			const response = await POST(makeEvent({ playerId: 'player-1', body: { tier: mockTier } }));
			expect(response.status).toBe(400);
		});

		it('returns 400 when tier is missing', async () => {
			const response = await POST(makeEvent({ playerId: 'player-1', body: { cipherId: '1' } }));
			expect(response.status).toBe(400);
		});
	});

	describe('insert — no existing ranking', () => {
		beforeEach(() => {
			mocks.selectLimit.mockResolvedValue([]);
		});

		it('returns 200', async () => {
			mocks.insertReturning.mockResolvedValue([{ ...existingRanking, rankings: [{ 'player-1': { mistakes: 0, emoji: '💎' } }] }]);

			const response = await POST(makeEvent({ playerId: 'player-1' }));

			expect(response.status).toBe(200);
		});

		it('returns the inserted rankings array', async () => {
			const rankings = [{ 'player-1': { mistakes: 0, emoji: '💎' } }];
			mocks.insertReturning.mockResolvedValue([{ ...existingRanking, rankings }]);

			const response = await POST(makeEvent({ playerId: 'player-1' }));
			const data = await response.json();

			expect(data).toEqual(rankings);
		});

		it('inserts the correct player entry', async () => {
			mocks.insertReturning.mockResolvedValue([{ ...existingRanking, rankings: [] }]);

			await POST(makeEvent({ playerId: 'player-99', body: { cipherId: '42', tier: mockTier } }));

			expect(mocks.insertValues).toHaveBeenCalledWith({
				cipherId: 42,
				rankings: [{ 'player-99': { mistakes: 0, emoji: '💎' } }]
			});
		});
	});

	describe('update — existing ranking', () => {
		beforeEach(() => {
			mocks.selectLimit.mockResolvedValue([existingRanking]);
		});

		it('returns 200', async () => {
			mocks.updateReturning.mockResolvedValue([existingRanking]);

			const response = await POST(makeEvent({ playerId: 'player-1' }));

			expect(response.status).toBe(200);
		});

		it('returns the updated rankings array', async () => {
			const updatedRankings = [
				...existingRanking.rankings,
				{ 'player-1': { mistakes: 0, emoji: '💎' } }
			];
			mocks.updateReturning.mockResolvedValue([{ ...existingRanking, rankings: updatedRankings }]);

			const response = await POST(makeEvent({ playerId: 'player-1' }));
			const data = await response.json();

			expect(data).toEqual(updatedRankings);
		});

		it('does not call insert when a ranking already exists', async () => {
			mocks.updateReturning.mockResolvedValue([existingRanking]);

			await POST(makeEvent({ playerId: 'player-1' }));

			expect(mocks.insertValues).not.toHaveBeenCalled();
		});
	});
});
