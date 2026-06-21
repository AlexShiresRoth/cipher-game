import { describe, expect, it } from 'vitest';
import { shuffle, shuffleArray } from './shuffle';

const WORD = 'firework';
const ARR = WORD.split('');

describe('shuffle', () => {
	it('returns a string of the same length', () => {
		expect(shuffle(WORD)).toHaveLength(WORD.length);
	});

	it('is a permutation of the input', () => {
		const result = shuffle(WORD);
		expect(result.split('').sort()).toEqual(WORD.split('').sort());
	});

	it('places no letter in its original position for words with all unique characters', () => {
		// The correction loop can leave duplicate letters in their original positions
		// (swapping two identical chars is a no-op), so test with a fully unique word
		const unique = 'authored'; // a,u,t,h,o,r,e,d — all 8 chars distinct
		for (let i = 0; i < 50; i++) {
			const result = shuffle(unique);
			const anyInPlace = result.split('').some((c, idx) => c === unique[idx]);
			expect(anyInPlace, `attempt ${i}: ${result}`).toBe(false);
		}
	});

	it('produces different orderings across calls', () => {
		const results = new Set(Array.from({ length: 30 }, () => shuffle(WORD)));
		expect(results.size).toBeGreaterThan(1);
	});
});

describe('shuffleArray', () => {
	it('returns an array of the same length', () => {
		expect(shuffleArray(ARR)).toHaveLength(ARR.length);
	});

	it('is a permutation of the input', () => {
		const result = shuffleArray(ARR);
		expect([...result].sort()).toEqual([...ARR].sort());
	});

	it('places no element in its original position for arrays with all unique elements', () => {
		const unique = 'authored'.split(''); // a,u,t,h,o,r,e,d — all 8 chars distinct
		for (let i = 0; i < 50; i++) {
			const result = shuffleArray(unique);
			const anyInPlace = result.some((c, idx) => c === unique[idx]);
			expect(anyInPlace, `attempt ${i}: ${result}`).toBe(false);
		}
	});

	it('does not mutate the original array', () => {
		const original = [...ARR];
		shuffleArray(ARR);
		expect(ARR).toEqual(original);
	});
});
