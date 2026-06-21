import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { DayRanking } from '$lib';
import Leaderboard from './leaderboard.svelte';

const mockDayRankings: DayRanking[] = [
	{ 'player-1': { mistakes: 0, emoji: '💎' } },
	{ 'player-2': { mistakes: 1, emoji: '🥇' } },
	{ 'player-3': { mistakes: 0, emoji: '💎' } }
];

describe('Leaderboard', () => {
	describe('table structure', () => {
		it('renders all 8 tier rows', () => {
			const { getAllByRole } = render(Leaderboard, {
				props: { dayRankings: [], playerId: '' }
			});
			// 1 header row + 8 tier rows
			expect(getAllByRole('row')).toHaveLength(9);
		});

		it('shows the ninja tier as the first body row', () => {
			const { getAllByRole } = render(Leaderboard, {
				props: { dayRankings: [], playerId: '' }
			});
			const rows = getAllByRole('row');
			expect(rows[1]).toHaveTextContent('⭐️🥷⭐️');
		});

		it('shows 0 for all tiers when no rankings exist', () => {
			const { getAllByRole } = render(Leaderboard, {
				props: { dayRankings: [], playerId: '' }
			});
			const bodyRows = getAllByRole('row').slice(1);
			bodyRows.forEach((row) => expect(row).toHaveTextContent('0'));
		});
	});

	describe('emoji counts', () => {
		it('counts a single player for 🥇', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: '' }
			});
			const emojiCell = getByText('🥇');
			expect(emojiCell.nextElementSibling).toHaveTextContent('1');
		});

		it('counts multiple players for the same tier', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: '' }
			});
			const emojiCell = getByText('💎');
			expect(emojiCell.nextElementSibling).toHaveTextContent('2');
		});

		it('shows 0 for a tier no player achieved', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: '' }
			});
			const emojiCell = getByText('😢');
			expect(emojiCell.nextElementSibling).toHaveTextContent('0');
		});
	});

	describe('player highlight', () => {
		it('applies amber border to the cell matching the player tier', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: 'player-1' }
			});
			// player-1 has emoji 💎
			expect(getByText('💎')).toHaveClass('border-orange-400');
		});

		it('does not apply amber border to non-matching rows', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: 'player-1' }
			});
			expect(getByText('🥇')).not.toHaveClass('border-orange-400');
		});

		it('shows a (you) label in the count cell of the matching row', () => {
			const { getByText } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: 'player-1' }
			});
			const countCell = getByText('💎').nextElementSibling;
			expect(countCell).toHaveTextContent('(you)');
		});

		it('does not highlight any row when the player has no ranking', () => {
			const { getAllByRole } = render(Leaderboard, {
				props: { dayRankings: mockDayRankings, playerId: 'unknown-player' }
			});
			getAllByRole('cell').forEach((cell) => expect(cell).not.toHaveClass('border-orange-400'));
		});
	});
});
