import { describe, expect, it } from 'vitest';
import {
	findSwappedLetters,
	getLetterIndex,
	getLetterKey,
	getLetterSwaps,
	isPathStepPart
} from './solution-path';

// 'firework' → swap positions 0 ('f') and 2 ('r') → 'rirework'... no, let's use clear examples
// 'firework' → swap positions 0 ('f') and 1 ('i') → 'ifrework'
// 'ifrework' → swap positions 2 ('r') and 3 ('e') → 'iferwork'
const PATHS = ['firework', 'ifrework', 'iferwork'];

describe('findSwappedLetters', () => {
	it('returns empty array for a single path with no transitions', () => {
		expect(findSwappedLetters(['firework'])).toEqual([]);
	});

	it('returns one entry for two paths', () => {
		const result = findSwappedLetters(['firework', 'ifrework']);
		expect(result).toHaveLength(1);
	});

	it('identifies the two positions that changed between states', () => {
		// 'firework' → 'ifrework': positions 0 ('f') and 1 ('i') are swapped
		const result = findSwappedLetters(['firework', 'ifrework']);
		expect(result[0]).toHaveLength(2);
		const letters = result[0].map((obj) => Object.keys(obj)[0]).sort();
		expect(letters).toEqual(['f', 'i'].sort());
	});

	it('returns one fewer entry than the number of paths', () => {
		const result = findSwappedLetters(PATHS);
		expect(result).toHaveLength(PATHS.length - 1);
	});

	it('captures the swapped indices correctly', () => {
		const result = findSwappedLetters(['firework', 'ifrework']);
		// 'f' was at index 0, 'i' was at index 1
		const fEntry = result[0].find((obj) => Object.keys(obj)[0] === 'f');
		const iEntry = result[0].find((obj) => Object.keys(obj)[0] === 'i');
		expect(fEntry?.['f']).toBe(0);
		expect(iEntry?.['i']).toBe(1);
	});
});

describe('isPathStepPart', () => {
	const swaps = [{ f: 0 }, { i: 1 }];

	it('returns true when the letter is at the given index', () => {
		expect(isPathStepPart(0, 'f', swaps)).toBe(true);
		expect(isPathStepPart(1, 'i', swaps)).toBe(true);
	});

	it('returns false when the index does not match', () => {
		expect(isPathStepPart(5, 'f', swaps)).toBe(false);
	});

	it('returns false when the letter is not in the swaps', () => {
		expect(isPathStepPart(0, 'z', swaps)).toBe(false);
	});

	it('returns false for empty swaps array', () => {
		expect(isPathStepPart(0, 'f', [])).toBe(false);
	});

	it('returns false when swappedLetters is falsy', () => {
		expect(isPathStepPart(0, 'f', null as never)).toBe(false);
	});
});

describe('getLetterKey', () => {
	it('returns the letter from a SwappedLetterPaths object', () => {
		expect(getLetterKey({ f: 0 })).toBe('f');
		expect(getLetterKey({ z: 7 })).toBe('z');
	});
});

describe('getLetterIndex', () => {
	it('returns the position index from a SwappedLetterPaths object', () => {
		expect(getLetterIndex({ f: 0 })).toBe(0);
		expect(getLetterIndex({ z: 7 })).toBe(7);
	});
});

describe('getLetterSwaps', () => {
	// step 0: 'firework' → 'ifrework' — 'f' at pos 0, 'i' at pos 1
	const swappedLettersPerPath = [
		[{ f: 0 }, { i: 1 }],
		[{ r: 2 }, { e: 3 }]
	];

	it('returns [letterA, letterB] when guesses is undefined', () => {
		expect(getLetterSwaps(0, swappedLettersPerPath, undefined)).toEqual(['f', 'i']);
	});

	it('returns [letterA, letterB] when guess starts with the first letter', () => {
		expect(getLetterSwaps(0, swappedLettersPerPath, ['fall', 'rise'])).toEqual(['f', 'i']);
	});

	it('returns [letterB, letterA] when guess starts with the second letter', () => {
		expect(getLetterSwaps(0, swappedLettersPerPath, ['igloo', 'rise'])).toEqual(['i', 'f']);
	});

	it('works for subsequent path steps', () => {
		expect(getLetterSwaps(1, swappedLettersPerPath, ['fall', 'rest'])).toEqual(['r', 'e']);
	});
});
