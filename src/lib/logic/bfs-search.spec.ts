import { describe, expect, it } from 'vitest';
import { bfsCipherSolver } from './bfs-search';

describe('bfsCipherSolver', () => {
	it('returns 0 moves when cipher already equals target', () => {
		const result = bfsCipherSolver('firework', 'firework');
		expect(result.minMoves).toBe(0);
		expect(result.visitedCount).toBe(1);
		expect(result.path).toEqual(['firework']);
	});

	it('solves a single-swap puzzle in 1 move', () => {
		// 'ifrework' differs from 'firework' only at positions 0 ('i') and 1 ('f')
		// A window of size ≥2 starting at position 0 can swap them directly
		const result = bfsCipherSolver('ifrework', 'firework');
		expect(result.minMoves).toBe(1);
	});

	it('path starts with the cipher and ends with the target', () => {
		const cipher = 'ifrework';
		const target = 'firework';
		const result = bfsCipherSolver(cipher, target);
		expect(result.path![0]).toBe(cipher);
		expect(result.path![result.path!.length - 1]).toBe(target);
	});

	it('path length equals minMoves + 1', () => {
		const result = bfsCipherSolver('ifrework', 'firework');
		expect(result.path!.length).toBe(result.minMoves! + 1);
	});

	it('visitedCount grows for multi-step puzzles', () => {
		// A 4-letter subset puzzle — use short guess lengths to keep BFS fast
		const result = bfsCipherSolver('ifrework', 'firework', [3, 4]);
		expect(result.visitedCount).toBeGreaterThan(1);
	});

	it('returns null minMoves when no solution exists', () => {
		// A cipher whose characters are entirely disjoint from the target cannot reach it
		// e.g. 'aaaaaaaa' cannot become 'bbbbbbbb' by swapping its own letters
		const result = bfsCipherSolver('aaaaaaaa', 'bbbbbbbb');
		expect(result.minMoves).toBeNull();
	});

	it('each step in the path differs by exactly one swap', () => {
		const result = bfsCipherSolver('ifrework', 'firework');
		const path = result.path!;
		for (let i = 0; i < path.length - 1; i++) {
			const from = path[i].split('');
			const to = path[i + 1].split('');
			const diffs = from.filter((c, idx) => c !== to[idx]).length;
			expect(diffs, `step ${i} should change exactly 2 positions`).toBe(2);
		}
	});
});
