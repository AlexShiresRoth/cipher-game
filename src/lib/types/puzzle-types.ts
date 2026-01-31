export type PuzzleGuessesResponse = {
	cipherId: string;
	id: string;
	wordsGuessed: Record<string, number>;
};
