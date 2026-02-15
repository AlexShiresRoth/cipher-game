import { WORD_LIST } from '$lib/wordlists';
import { SvelteMap } from 'svelte/reactivity';
import { handleErrorOnGuess } from './errors.svelte';

/**
 * @clearSelection
 * @returns updated variables
 * @description clears whatever letters user has selected
 */
type ClearSelectionResponse = {
	selected: string[];
	indexToSwap: number;
	startIndex: number;
	allowChooseIndex: boolean;
};
export function clearSelection(): ClearSelectionResponse {
	return { selected: [], indexToSwap: -1, startIndex: -1, allowChooseIndex: false };
}

/**
 * @clearUsedLetters
 * @return updated variables
 */
type CULParams = {
	usedLetters: string[];
	moveAmount: number;
	replenishAmt: number;
	shouldAllowReplenish: boolean;
};
export function clearUsedLetters({
	moveAmount,
	replenishAmt
}: Omit<CULParams, 'usedLetters' | 'shouldAllowReplenish'>): CULParams {
	const prevMvAmt = moveAmount;
	const prevRepAmt = replenishAmt;
	return {
		usedLetters: [],
		moveAmount: prevMvAmt + 1,
		replenishAmt: prevRepAmt + 1,
		shouldAllowReplenish: false
	};
}

/**
 *
 * @param showUpdatePopup
 * @returns boolean
 */
export function toggleUpdatePopup(updateMap: Map<string, boolean>, key: string, value: boolean) {
	const newUpdates = new SvelteMap(updateMap);
	newUpdates.set(key, value);

	return newUpdates;
}

/**
 *
 * @param selected
 * @returns string array
 * @description remove one letter from selection array
 */
export function removeLetterFromSelection(selected: string[]) {
	selected.pop();
	const newSelection = [...selected];

	return { newSelection };
}

/**
 *
 * @param word
 * @description - checks dictionary api for valid words
 */
export function isValidWord(word: string) {
	return { valid: WORD_LIST[word.length].words.findIndex((w) => w === word) >= 0 };
}

/**
 *
 * @param selected, startIndex, cipherState
 * @returns index distant from starting point of selected letter
 */
// find index to swap with based on word guess
type GetMoveToParams = {
	selected: string[];
	startIndex: number;
	cipherState: string[];
};
export function getMoveToIndex({ selected, startIndex, cipherState }: GetMoveToParams) {
	const selectionLength = selected.length;

	let moveIndex: number = startIndex + selectionLength;

	(function getMoveAmount() {
		if (moveIndex >= cipherState.length) {
			moveIndex = moveIndex - cipherState.length;
			return getMoveAmount();
		}
	})();

	return moveIndex;
}

/**
 *
 * @params GuessParams
 * @returns
 */
type GuessParams = {
	guesses: string[];
	selected: string[];
	cipherState: string[];
	startIndex: number;
	errors: string[];
	word: string;
	correctPositions: number;
	swaps: boolean[];
	moveAmount: number;
	usedLetters: string[];
	getMoveToIndex: () => number;
};

export async function guess({
	guesses,
	selected,
	cipherState,
	startIndex,
	errors,
	word,
	correctPositions,
	getMoveToIndex,
	swaps,
	moveAmount,
	usedLetters
}: GuessParams) {
	// --- Basic derived values ---
	const joined = selected.join('');
	const moveIndex = getMoveToIndex();

	const conditions = {
		guessed: guesses.includes(joined),
		tooShort: selected.length < 3, // this should not really be called, extra precaution
		notInCipher: !cipherState.includes(selected[0]),
		samePosition: moveIndex === startIndex,
		sameLetter: cipherState[moveIndex] === cipherState[startIndex] && moveIndex !== startIndex
	};

	const { valid } = isValidWord(joined);
	const invalidGuess = !valid;

	// --- Error descriptors ---
	const possibleErrors = [
		{ condition: conditions.guessed, msg: 'Already guessed' },
		{ condition: conditions.tooShort, msg: 'Too short' },
		{ condition: conditions.notInCipher, msg: 'Not in cipher' },
		{
			condition: invalidGuess,
			msg: 'Not a valid guess'
		},
		{ condition: conditions.samePosition, msg: 'Same position' },
		{ condition: conditions.sameLetter, msg: 'Same letter swap' }
	];

	// --- Build newErrors ---
	let newErrors = [...errors];
	// don't add new errors if someone is spamming
	if (newErrors.length < 5) {
		for (const { condition, msg } of possibleErrors) {
			const handled = handleErrorOnGuess({ condition, newErrorMsg: msg, errors });

			if (handled) newErrors = [...handled];
		}
	}

	// --- If guess is invalid, reset selection and return early ---
	if (
		conditions.guessed ||
		conditions.tooShort ||
		conditions.notInCipher ||
		invalidGuess ||
		conditions.samePosition ||
		conditions.sameLetter
	) {
		const cleared = clearSelection();

		return {
			...cleared,
			errors: newErrors,
			swaps,
			correctPositions,
			guesses,
			usedLetters,
			moveAmount,
			cipherState
		};
	}

	// Swap letters
	const newCipherState = [...cipherState];
	[newCipherState[startIndex], newCipherState[moveIndex]] = [
		newCipherState[moveIndex],
		newCipherState[startIndex]
	];

	// Correctness tracking
	const newCorrectPositions = newCipherState.filter((l, i) => l === word[i]).length;
	const isCorrectGuess = newCorrectPositions > correctPositions;

	const newSwaps = [...swaps, isCorrectGuess];
	const newGuesses = [...guesses, joined];
	const newUsedLetters = [...usedLetters, ...selected];

	// Clear selection after guess
	const cleared = clearSelection();

	return {
		swaps: newSwaps,
		correctPositions: newCorrectPositions,
		guesses: newGuesses,
		usedLetters: newUsedLetters,
		selected: cleared.selected,
		indexToSwap: cleared.indexToSwap,
		startIndex: cleared.startIndex,
		allowChooseIndex: cleared.allowChooseIndex,
		moveAmount: moveAmount + 1,
		cipherState: newCipherState,
		errors
	};
}

export function defaultAlphaState(
	alpha: string[],
	cipherState: string[],
	vowels: string[]
): SvelteMap<string, number> {
	const alphaSet = new SvelteMap<string, number>();
	for (const l of alpha) {
		const lettersInCipher = cipherState.filter((c) => c === l);
		alphaSet.set(l, lettersInCipher.length > 0 ? Infinity : vowels.includes(l) ? 3 : 1);
	}
	return alphaSet;
}

/**
 *
 * @param letter
 * @param selected
 * @param cipherState
 * @param startIndex
 * @desc handle selection on the keyboard
 */
export function onSelect(
	letter: string,
	selected: string[],
	cipherState: string[],
	startIndex: number
) {
	let allowChooseIndex = false;

	selected = [...selected, letter];

	if (selected.length <= 1) {
		startIndex = cipherState.indexOf(selected[0]);
	}

	// we need to allow selecting starting index if there are duplicate letters
	if (selected[0] === letter) {
		if (cipherState.filter((l) => l === letter).length > 1) {
			allowChooseIndex = true;
		}
	}
	if (selected.length > 1) {
		allowChooseIndex = false;
	}

	return { selected, startIndex, allowChooseIndex };
}
