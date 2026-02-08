import { describe, expect, it } from 'vitest';
import { defaultAlphaState } from './actions.svelte';
import { alpha, vowels } from './constants';
import { checkAlphaStateIsDiminshed, getTierByMoves, tiers } from './tiers';

const mockCipherWord = 'audience';
const mockCipherState = 'eacenidu'.split('');

function getAlphaState(cipherState: string[]) {
	return defaultAlphaState(alpha, cipherState, vowels);
}

describe('getTiersByMoves', () => {
	it('should return tier 1 with no mistakes', () => {
		const tier = getTierByMoves(
			5,
			0,
			[true, true, true, true, true],
			getAlphaState(mockCipherState),
			false,
			5,
			mockCipherWord.split('')
		);

		expect(tier.mistakes).toEqual(tiers[0].mistakes);
		expect(tier.emoji).toBe(tiers[0].emoji);
		expect(tier.phrase).toEqual(tiers[0].phrase);
	});

	it('should return the secret 🥷 win screen', () => {
		const tier = getTierByMoves(
			5,
			0,
			[true, true, true, true, true],
			getAlphaState(mockCipherState),
			true,
			5,
			mockCipherWord.split('')
		);

		expect(tier.mistakes).toEqual(tiers[7].mistakes);
		expect(tier.emoji).toBe(tiers[7].emoji);
		expect(tier.phrase).toEqual(tiers[7].phrase);
	});

	it('should return the lowest tier', () => {
		const tier = getTierByMoves(
			9,
			3,
			[true, false, false, true, true, false, false, false],
			getAlphaState(mockCipherState),
			true,
			5,
			mockCipherState
		);

		expect(tier.mistakes).toEqual(tiers[6].mistakes);
		expect(tier.emoji).toBe(tiers[6].emoji);
		expect(tier.phrase).toEqual(tiers[6].phrase);
	});
});

describe('checkAlphaStateIsDiminished', () => {
	it('should return false that alpha state has not been used', () => {
		const state = getAlphaState(mockCipherState);

		const isAlphaStateUsed = checkAlphaStateIsDiminshed(state, mockCipherState);

		expect(isAlphaStateUsed).toBe(false);
	});

	it('should return true, that alphaState should be used', () => {
		const state = getAlphaState(mockCipherState);
		state.set('b', 0);
		const isAlphaStateUsed = checkAlphaStateIsDiminshed(state, mockCipherState);
		expect(isAlphaStateUsed).toBe(true);
	});
});
