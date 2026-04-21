import type { SwappedLetterPaths } from '$lib/types/store';

/**
 *
 * @param paths
 * @returns SwappedLetterPaths[][]
 * @description gets the letters in the cipher to swap for each step in solving the puzzle
 */
export function findSwappedLetters(paths: string[]) {
	const swappedLettersPerPath: SwappedLetterPaths[][] = [];

	paths.forEach((path, n) => {
		if (n + 1 < paths.length) {
			const swapped = path
				.split('')
				.map((p, i) => {
					if (p !== paths[n + 1][i]) {
						return { [p]: i };
					}
				})
				.filter(Boolean);

			swappedLettersPerPath.push(swapped as SwappedLetterPaths[]);
		}
	});

	return swappedLettersPerPath;
}

export function isPathStepPart(index: number, part: string, swappedLetters: SwappedLetterPaths[]) {
	if (!swappedLetters) return false;

	return !!swappedLetters.find((swap) => swap[part] === index);
}

export function getLetterKey(obj: SwappedLetterPaths) {
	return Object.keys(obj)[0];
}

export function getLetterIndex(obj: SwappedLetterPaths) {
	return Object.values(obj)[0];
}

export function getLetter(
	pathStep: number,
	index: number,
	swappedLettersPerPath: SwappedLetterPaths[][]
) {
	return getLetterKey(swappedLettersPerPath[pathStep][index]);
}

export function getLetterSwaps(
	pathStep: number,
	swappedLettersPerPath: SwappedLetterPaths[][],
	guesses: string[] | undefined
) {
	const letterA = getLetter(pathStep, 0, swappedLettersPerPath);
	const letterB = getLetter(pathStep, 1, swappedLettersPerPath);

	const guess = guesses?.[pathStep]?.[0];

	if (!guess) {
		return [letterA, letterB];
	}

	return guess === letterA ? [letterA, letterB] : [letterB, letterA];
}
