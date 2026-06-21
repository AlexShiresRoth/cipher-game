export type DayRanking = Record<string, { mistakes: number; emoji: string }>;

export type PuzzleGuessesResponse = {
	cipherId: string;
	id: string;
	wordsGuessed: Record<string, number>;
};

export type GuessParams = {
	guesses: string[];
	selected: string[];
	cipherState: string[];
	startIndex: number;
	errors: string[];
	word: string;
	correctPositions: number;
	swaps: boolean[];
	moveAmount: number;
	usedLetters: string[];
	getMoveToIndex: () => number;
};

export type GuessReturnValues = {
	swaps: boolean[];
	correctPositions: number;
	guesses: string[];
	usedLetters: string[];
	selected: string[];
	indexToSwap: number;
	startIndex: number;
	allowChooseIndex: boolean;
	moveAmount: number;
	cipherState: string[];
	errors: string[];
	invalidGuess: boolean;
};
