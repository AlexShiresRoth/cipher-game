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
	return { usedLetters: [], moveAmount: moveAmount++, replenishAmt: replenishAmt++ };
}
