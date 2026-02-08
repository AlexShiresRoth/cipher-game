import { defaultAlphaState } from './actions.svelte';
import { alpha, vowels } from './constants';

type Tier = Record<number, { mistakes: number; emoji: string; phrase: string }>;

export const tiers: Tier = {
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

function getTierFactoring(
	moveAmt: number,
	replenishAmt: number,
	swaps: boolean[],
	minMoves: number
) {
	const diff = moveAmt + replenishAmt + swaps.filter((b) => !b).length - minMoves;
	return diff > 0 ? diff : 0;
}

export function checkAlphaStateIsDiminshed(
	alphaStateMap: Map<string, number>,
	cipherWordArr: string[]
) {
	const initialAlphaState = defaultAlphaState(alpha, cipherWordArr, vowels);

	return !alpha.every((letter) => {
		return initialAlphaState.get(letter) === alphaStateMap.get(letter);
	});
}

export function getTierByMoves(
	moveAmt: number,
	replenishAmt: number,
	swaps: boolean[],
	alphaStateMap: Map<string, number>,
	isGameOver: boolean,
	minMoves: number,
	cipherWordArr: string[]
) {
	const factor = getTierFactoring(moveAmt, replenishAmt, swaps, minMoves);
	const usedOnlyCipherLetters =
		factor === 0 && !checkAlphaStateIsDiminshed(alphaStateMap, cipherWordArr);

	if (usedOnlyCipherLetters && isGameOver) {
		return tiers[7];
	}
	return tiers[factor || 0] || tiers[6];
}
