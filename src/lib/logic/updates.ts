export const updateNames = {
	keyboard: 'keyboard',
	replenish: 'replenish',
	solution: 'solution',
	playerGuesses: 'playerGuesses'
};

export function defaultUpdatesState(updateNames: Record<string, string>): Map<string, boolean> {
	const updateMap = new Map();
	for (const item in updateNames) {
		updateMap.set(item, false);
	}
	return updateMap;
}

export function getUpdateMapValue(key: string, updatesMap: Map<string, boolean>) {
	return !!updatesMap.get(key);
}
