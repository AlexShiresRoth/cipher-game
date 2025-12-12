export type SolverResult = {
	minMoves: number | null;
	visitedCount: number;
	path?: string[];
};

function getNeighbors(state: string, guessLengths: number[]): string[] {
	const neighbors: string[] = [];
	const n = state.length; // always 8
	const letters = state.split('');

	for (const gLen of guessLengths) {
		// Window size = guess length
		const winSize = gLen;

		for (let matchIndex = 0; matchIndex < n; matchIndex++) {
			// Letter at matchIndex acts as "guess[0]"
			// Player can always choose any matching letter
			const windowIndices: number[] = [];

			for (let k = 0; k < winSize; k++) {
				windowIndices.push((matchIndex + k) % n);
			}

			// For any two indices in the window, generate swap
			for (let a = 0; a < windowIndices.length; a++) {
				for (let b = a + 1; b < windowIndices.length; b++) {
					const i = windowIndices[a];
					const j = windowIndices[b];

					const arr = [...letters];
					const tmp = arr[i];
					arr[i] = arr[j];
					arr[j] = tmp;

					neighbors.push(arr.join(''));
				}
			}
		}
	}

	return neighbors;
}

export function bfsCipherSolver(
	cipher: string,
	target: string,
	guessLengths: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
): SolverResult {
	if (cipher === target) {
		return { minMoves: 0, visitedCount: 1, path: [cipher] };
	}

	const queue: string[] = [cipher];
	const visited = new Set<string>([cipher]);
	const parent = new Map<string, string>();

	while (queue.length > 0) {
		const curr = queue.shift()!;

		const neighbors = getNeighbors(curr, guessLengths);

		for (const next of neighbors) {
			if (visited.has(next)) continue;

			visited.add(next);
			parent.set(next, curr);

			if (next === target) {
				// Build path
				const path = [];
				let x: string | undefined = next;
				while (x) {
					path.push(x);
					x = parent.get(x);
				}
				path.reverse();

				return {
					minMoves: path.length - 1,
					visitedCount: visited.size,
					path
				};
			}

			queue.push(next);
		}
	}

	return { minMoves: null, visitedCount: visited.size };
}
