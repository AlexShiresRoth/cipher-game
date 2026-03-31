import { defaultAlphaState } from './actions.svelte';
import { alpha, vowels } from './constants';

export type Tier = { mistakes: number; emoji: string; phrase: string };

export type Tiers = Record<number, Tier>;

export const tiers: Tiers = {
	0: {
		mistakes: 0,
		emoji: '💎',
		phrase: 'Righteous solve! No mistakes — few crack this optimally 🤯'
	},
	1: {
		mistakes: 1,
		emoji: '🥇',
		phrase: 'Excellent! Just one point over perfect 😎'
	},
	2: {
		mistakes: 2,
		emoji: '🥈',
		phrase: 'Solid work — the cipher did not win today 👌'
	},
	3: {
		mistakes: 3,
		emoji: '🥉',
		phrase: 'You got there! That one fought back 🥹'
	},
	4: {
		mistakes: 5,
		emoji: '🤔',
		phrase: 'Ouch, that one was tougher than it seemed.'
	},
	5: {
		mistakes: 8,
		emoji: '🤯',
		phrase: `Hey, you didn't quit and that's great`
	},
	6: {
		mistakes: 10,
		emoji: '😢',
		phrase: `Woof`
	},
	7: {
		mistakes: 0,
		emoji: '⭐️🥷⭐️',
		phrase: `Your skill and technique led you here. Incredible. Cipher letters only.`
	}
};

/**
 *
 * @param moveAmt
 * @param replenishAmt
 * @param swaps
 * @param minMoves
 * @returns number to use when getting game tier rank
 */
export function getTierFactoring(
	moveAmt: number,
	replenishAmt: number,
	swaps: boolean[],
	minMoves: number
) {
	const diff = moveAmt + replenishAmt + swaps.filter((b) => !b).length - minMoves;
	return diff > 0 ? diff : 0;
}

/**
 *
 * @param alphaStateMap
 * @param cipherWordArr
 * @returns boolean; true if alpha state has been used
 */
export function checkAlphaStateIsDiminshed(
	alphaStateMap: Map<string, number>,
	cipherWordArr: string[]
) {
	const initialAlphaState = defaultAlphaState(alpha, cipherWordArr, vowels);

	return !alpha.every((letter) => {
		return initialAlphaState.get(letter) === alphaStateMap.get(letter);
	});
}

/**
 *
 * @param moveAmt
 * @param replenishAmt
 * @param swaps
 * @param alphaStateMap
 * @param isGameOver
 * @param minMoves
 * @param cipherWordArr
 * @returns a tier object to utilize fields, 'emoji', 'phrase' and 'mistakes'
 */
export function getTierByMoves(
	moveAmt: number,
	replenishAmt: number,
	swaps: boolean[],
	alphaStateMap: Map<string, number>,
	isGameOver: boolean,
	minMoves: number,
	cipherWordArr: string[]
): Tier {
	const factor = getTierFactoring(moveAmt, replenishAmt, swaps, minMoves);
	console.log('factor', factor);
	const usedOnlyCipherLetters =
		factor === 0 && !checkAlphaStateIsDiminshed(alphaStateMap, cipherWordArr);

	if (usedOnlyCipherLetters && isGameOver) {
		return tiers[7];
	}
	return tiers[factor || 0] || tiers[6];
}
