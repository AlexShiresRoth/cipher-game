import { describe, expect, it } from 'vitest';
import {
	clearSelection,
	clearUsedLetters,
	defaultAlphaState,
	getMoveToIndex,
	isValidWord,
	onSelect,
	removeLetterFromSelection
} from './actions.svelte';
import { alpha, vowels } from './constants';

// 8-letter cipher used throughout
const CIPHER_STATE = 'firework'.split('');

describe('clearSelection', () => {
	it('returns empty selection and reset indices', () => {
		const result = clearSelection();
		expect(result.selected).toEqual([]);
		expect(result.indexToSwap).toBe(-1);
		expect(result.startIndex).toBe(-1);
		expect(result.allowChooseIndex).toBe(false);
	});
});

describe('clearUsedLetters', () => {
	it('resets usedLetters and increments replenishAmt', () => {
		const result = clearUsedLetters({ moveAmount: 4, replenishAmt: 1 });
		expect(result.usedLetters).toEqual([]);
		expect(result.replenishAmt).toBe(2);
		expect(result.moveAmount).toBe(4);
		expect(result.shouldAllowReplenish).toBe(false);
	});

	it('does not increment moveAmount', () => {
		const result = clearUsedLetters({ moveAmount: 7, replenishAmt: 0 });
		expect(result.moveAmount).toBe(7);
	});
});

describe('removeLetterFromSelection', () => {
	it('removes the last letter', () => {
		expect(removeLetterFromSelection(['f', 'i', 'r'])).toEqual(['f', 'i']);
	});

	it('returns empty array when one letter remains', () => {
		expect(removeLetterFromSelection(['f'])).toEqual([]);
	});

	it('returns a new array (does not return the original reference)', () => {
		const sel = ['f', 'i'];
		const result = removeLetterFromSelection(sel);
		expect(result).not.toBe(sel);
	});
});

describe('getMoveToIndex', () => {
	it('calculates move index with no wrap-around', () => {
		// startIndex=0, word length 3 → 0+3=3
		expect(getMoveToIndex({ selected: ['f', 'i', 'r'], startIndex: 0, cipherState: CIPHER_STATE })).toBe(3);
	});

	it('wraps once when index exceeds cipher length', () => {
		// startIndex=6, word length 4 → 6+4=10 → 10-8=2
		expect(getMoveToIndex({ selected: ['f', 'i', 'r', 'e'], startIndex: 6, cipherState: CIPHER_STATE })).toBe(2);
	});

	it('wraps multiple times', () => {
		// startIndex=5, word length 6 → 5+6=11 → 11-8=3
		expect(
			getMoveToIndex({ selected: ['a', 'b', 'c', 'd', 'e', 'f'], startIndex: 5, cipherState: CIPHER_STATE })
		).toBe(3);
	});
});

describe('isValidWord', () => {
	it('returns valid:true for a real dictionary word', () => {
		expect(isValidWord('fire').valid).toBe(true);
	});

	it('returns valid:false for a non-word', () => {
		expect(isValidWord('xyzq').valid).toBe(false);
	});

	it('returns valid:false for an empty string', () => {
		expect(isValidWord('').valid).toBe(false);
	});
});

describe('defaultAlphaState', () => {
	it('gives cipher letters Infinity uses', () => {
		const state = defaultAlphaState(alpha, CIPHER_STATE, vowels);
		// 'f', 'i', 'r', 'e', 'w', 'o', 'k' are all in 'firework'
		expect(state.get('f')).toBe(Infinity);
		expect(state.get('k')).toBe(Infinity);
		expect(state.get('w')).toBe(Infinity);
	});

	it('gives vowels not in the cipher 3 uses', () => {
		const state = defaultAlphaState(alpha, CIPHER_STATE, vowels);
		// 'a', 'u' are vowels absent from 'firework'
		expect(state.get('a')).toBe(3);
		expect(state.get('u')).toBe(3);
	});

	it('gives consonants not in the cipher 1 use', () => {
		const state = defaultAlphaState(alpha, CIPHER_STATE, vowels);
		// 'b', 'c', 'd' are consonants absent from 'firework'
		expect(state.get('b')).toBe(1);
		expect(state.get('c')).toBe(1);
		expect(state.get('d')).toBe(1);
	});

	it('covers every letter in the alphabet', () => {
		const state = defaultAlphaState(alpha, CIPHER_STATE, vowels);
		expect(state.size).toBe(26);
	});
});

describe('onSelect', () => {
	it('appends the letter to the selection', () => {
		const { selected } = onSelect('f', [], CIPHER_STATE, -1);
		expect(selected).toEqual(['f']);
	});

	it('sets startIndex to the cipher position of the first letter', () => {
		// 'f' is at index 0 in 'firework'
		const { startIndex } = onSelect('f', [], CIPHER_STATE, -1);
		expect(startIndex).toBe(0);
	});

	it('sets allowChooseIndex when the first letter appears more than once', () => {
		// 'r' is at indices 2 and 6 in 'firework'
		const { allowChooseIndex } = onSelect('r', [], CIPHER_STATE, -1);
		expect(allowChooseIndex).toBe(true);
	});

	it('does not set allowChooseIndex for a unique first letter', () => {
		// 'f' appears only once in 'firework'
		const { allowChooseIndex } = onSelect('f', [], CIPHER_STATE, -1);
		expect(allowChooseIndex).toBe(false);
	});

	it('clears allowChooseIndex once a second letter is added', () => {
		const { allowChooseIndex } = onSelect('i', ['r'], CIPHER_STATE, 2);
		expect(allowChooseIndex).toBe(false);
	});

	it('does not mutate the incoming selection array', () => {
		const original = ['f'];
		onSelect('i', original, CIPHER_STATE, 0);
		expect(original).toEqual(['f']);
	});
});
