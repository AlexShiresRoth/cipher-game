import type { PrefMap, Tier } from '$lib/logic';

export type GameLogicState = {
	isGameStarted: boolean;
	moveAmount: number;
	guesses: string[];
	usedLetters: string[];
	swaps: boolean[];
	indexToSwap: number;
	startIndex: number;
	allowChooseIndex: boolean;
	replenishAmt: number;
	shouldAllowReplenish: boolean;
	selected: string[];
	cipherState: string[];
	alphaState: Map<string, number>;
	tier: Tier;
};

export type GameUIState = {
	modalOpen: boolean;
	showTutorial: boolean;
	showMySolution: boolean;
	showLetters: boolean;
	showNavModal: boolean;
};

export type GameSystemState = {
	win: boolean;
	hydrated: boolean;
	gameOver: boolean;
	internalError: boolean;
	errors: string[];
	cipherStateHistory: string[];
	updatesState: Map<string, boolean>;
	loading: boolean;
	preferences: PrefMap;
	complimentIndex: number;
};

export type SwappedLetterPaths = { [key: string]: number };

export type TutorialState = {
	isTutorialMode: boolean;
	currentStep: number;
	steps?: Array<{
		start: SwappedLetterPaths;
		end: SwappedLetterPaths;
		wordLength: number;
		currentStepNode: string;
	}>;
};
