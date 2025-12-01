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
};
export function clearUsedLetters({
	moveAmount,
	replenishAmt
}: Omit<CULParams, 'usedLetters'>): CULParams {
	const prevMvAmt = moveAmount;
	const prevRepAmt = replenishAmt;
	return { usedLetters: [], moveAmount: prevMvAmt + 1, replenishAmt: prevRepAmt + 1 };
}

/**
 *
 * @param showUpdatePopup
 * @returns boolean
 */
export function toggleUpdatePopup(showUpdatePopup: boolean) {
	const show = !showUpdatePopup;

	return show;
}

/**
 *
 * @param selected
 * @returns string array
 * @description remove one letter from selection array
 */
export function removeLetterFromSelection(selected: string[]) {
	const removedLetter = selected.pop();
	const newSelection = [...selected];

	return { newSelection, removedLetter };
}

/**
 *
 * @param word
 * @description - checks dictionary api for valid words
 */
export async function isValidWord(word: string) {
	try {
		const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
		return { valid: res.ok, error: null };
	} catch (error) {
		console.error(error);
		return { valid: false, error };
	}
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
	isValidWord: (val: string) => Promise<{ valid: boolean; error: unknown }>;
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
	isValidWord,
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
		samePosition: moveIndex === startIndex
	};

	const { valid, error } = await isValidWord(joined);
	const invalidGuess = !valid;
	const apiErrorMessage = `The dictionary service we rely on is temporarily down due to a global outage.
        Your game data is safe — this should be resolved soon!`;

	// --- Error descriptors ---
	const possibleErrors = [
		{ condition: conditions.guessed, msg: 'Already guessed' },
		{ condition: conditions.tooShort, msg: 'Too short' },
		{ condition: conditions.notInCipher, msg: 'Not in cipher' },
		{
			condition: invalidGuess,
			msg: !error ? 'Not a valid guess' : apiErrorMessage
		},
		{ condition: conditions.samePosition, msg: 'Same position' }
	];

	// --- Build newErrors ---
	let newErrors = [...errors];
	for (const { condition, msg } of possibleErrors) {
		const handled = handleErrorOnGuess({ condition, newErrorMsg: msg, errors });
		if (handled) newErrors = [...errors, ...handled];
	}

	// --- If guess is invalid, reset selection and return early ---
	if (
		conditions.guessed ||
		conditions.tooShort ||
		conditions.notInCipher ||
		invalidGuess ||
		conditions.samePosition
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
