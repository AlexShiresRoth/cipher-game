export type PreferenceLayout = Record<string, string>;

export type PrefItem = {
	show: boolean;
	description: string;
	title: string;
};

export type PrefMap = Map<string, PrefItem>;

export const PreferenceStorageKeys = {
	preferences: 'preferences'
};

export const PreferenceKeys = {
	showRank: 'showRank',
	showMistakes: 'showMistakes',
	showMoves: 'showMoves',
	showReps: 'showReps',
	showSolvable: 'showSolvable'
};

export const PreferenceItems: Record<string, PrefItem> = {
	[PreferenceKeys.showMoves]: {
		title: 'Moves Display',
		description: 'Display or hide your current move amount in the game interface',
		show: true
	},
	[PreferenceKeys.showMistakes]: {
		title: 'Mistakes Display',
		description: 'Display or hide your current mistakes amount in the game interface',
		show: true
	},
	[PreferenceKeys.showReps]: {
		title: 'Replenishes Display',
		description: 'Display or hide your current replenishes amount in the game interface',
		show: true
	},
	[PreferenceKeys.showSolvable]: {
		title: 'Puzzle Complexity',
		description: 'Display or hide the puzzle"\'"s minimum moves to solve in game interface',
		show: true
	},
	[PreferenceKeys.showRank]: {
		title: 'Rank Display',
		description: 'Display or hide your current rank emoji in game interface',
		show: true
	}
};

export function checkStorageForPreferences(prefKeys: Record<string, string>) {
	const raw = localStorage.getItem(PreferenceStorageKeys.preferences) || '';

	const prefMap: PrefMap = new Map();
	const prefStorageObject = raw ? new Map(JSON.parse(atob(raw)) as PrefMap) : prefMap;

	Object.entries(prefKeys).forEach(([key]) => {
		prefMap.set(key, prefStorageObject.get(key) || PreferenceItems[key]);
	});

	return prefMap;
}

export function addPrefToStorage(key: string, preferences: PrefMap) {
	const newPrefMap: PrefMap = new Map([...preferences]);
	const item = newPrefMap.get(key);
	if (!item) return newPrefMap;
	newPrefMap.set(key, { ...item, show: !item.show });
	return newPrefMap;
}
