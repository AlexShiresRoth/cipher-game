import type { TutorialState } from '$lib/types/store';
import { findSwappedLetters } from './solution-path';

/** Smallest guess length ≥ 3 so a word starting at `start` swaps with index `end` (wraps). */
function minGuessLengthFromTo(start: number, end: number, n: number): number {
	let d = (end - start + n) % n;
	if (d === 0) d = n;
	if (d >= 3) return d;
	return d + n * Math.ceil((3 - d) / n);
}

/**
 *
 * @param solutionPath
 * @param n
 * @returns list of tutorial steps with dynamic content based on current game
 */
export function createTutorialSteps(solutionPath: string[], n: number): TutorialState['steps'] {
	return findSwappedLetters(solutionPath).map((path, i) => {
		const path0Index = Object.values(path[0])[0];
		const path1Index = Object.values(path[1])[0];

		const d01 = (path1Index - path0Index + n) % n;
		const d10 = (path0Index - path1Index + n) % n;

		let start: (typeof path)[0];
		let end: (typeof path)[1];
		let wordLength: number;

		if (d01 >= 3) {
			start = path[0];
			end = path[1];
			wordLength = d01;
		} else if (d10 >= 3) {
			start = path[1];
			end = path[0];
			wordLength = d10;
		} else {
			const L0 = minGuessLengthFromTo(path0Index, path1Index, n);
			const L1 = minGuessLengthFromTo(path1Index, path0Index, n);
			if (L0 <= L1) {
				start = path[0];
				end = path[1];
				wordLength = L0;
			} else {
				start = path[1];
				end = path[0];
				wordLength = L1;
			}
		}

		const firstLetter = Object.keys(start)[0].toUpperCase();
		const secondLetter = Object.keys(end)[0].toUpperCase();

		return {
			start,
			end,
			wordLength,
			currentStepNode: `
				${i === 0 ? `<p class="text-sm">Swap letters, with real words, to decipher the scrambled word.</p>` : ''}

				<p class="text-sm">
					Swap <span class="text-amber-500 uppercase">${firstLetter}</span>
					with <span class="text-amber-500 uppercase">${secondLetter}</span>.
				</p>
				`
		};
	});
}
