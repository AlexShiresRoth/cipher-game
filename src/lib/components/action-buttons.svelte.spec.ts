import {
	clearSelection,
	clearUsedLetters,
	getMoveToIndex,
	guess,
	isValidWord,
	toggleUpdatePopup
} from '$lib/logic';
import { defaultUpdatesState, updateNames } from '$lib/logic/updates';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ActionButtons from './action-buttons.svelte';

if (!Element.prototype.animate) {
	Element.prototype.animate = (() => {
		return () => {
			return {
				finished: Promise.resolve(),
				cancel: () => {},
				play: () => {},
				pause: () => {},
				reverse: () => {},
				currentTime: 0,
				effect: null,
				id: '',
				onfinish: null,
				oncancel: null,
				playState: 'idle'
			} as unknown as Animation; // assert as Animation safely
		};
	})();
}

vi.mock('../logic/actions.svelte.ts', async () => {
	const actual = await import('../logic/actions.svelte');
	return {
		...actual,
		isValidWord: vi.fn((word: string) => {
			if (word === 'trs' || word === 'turp') {
				return Promise.resolve({ valid: false, error: null });
			}
			return Promise.resolve({ valid: true, error: null });
		})
	};
});

const usedLetters: string[] = [];
const showUpdatePopup: boolean = false;
const toggleUpdatePopupMock = vi.fn(
	(updateMap: Map<string, boolean>, key: string, value: boolean) =>
		toggleUpdatePopup(updateMap, key, value)
);
const selected: string[] = [];
const removeLetterFromSelection = vi.fn();
const guessMock = vi.fn((args) => guess(args));
const clearSelectionMock = vi.fn(() => clearSelection());
const clearUsedLettersMock = vi.fn((args) => clearUsedLetters(args));
const isValidWordMock = vi.fn((args) => isValidWord(args));
const getMoveToIndexMock = vi.fn();
const getMoveToIndexMockWithArgs = vi.fn((args) => getMoveToIndex(args));
const guessParams = {
	errors: [],
	swaps: [],
	correctPositions: 0,
	guesses: [],
	usedLetters: [],
	moveAmount: 0,
	cipherState: [],
	selected: [],
	indexToSwap: 0,
	startIndex: 0,
	allowChooseIndex: 0,
	isValidWord: isValidWordMock,
	getMoveToIndex: getMoveToIndexMock,
	word: 'triangle'
};

describe('Action Buttons', () => {
	describe('Replenish button', () => {
		it('should render replenish button', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 1, replenishAmt: 0 }),
					showUpdatePopup,
					toggleUpdatePopup,
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const repBtn = await result.findByTestId('replenish-keyboard');
			expect(repBtn).toBeInTheDocument();
		});

		it('should call clear used letters, with correct return value', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters: ['a', 'b', 'c'],
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 1, replenishAmt: 0 }),
					showUpdatePopup,
					toggleUpdatePopup,
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const repBtn = await result.findByTestId('replenish-keyboard');

			await fireEvent.click(repBtn);
			expect(clearUsedLettersMock).toHaveBeenCalled();
			expect(clearUsedLettersMock.mock.results[0].value).toEqual({
				usedLetters: [],
				moveAmount: 2,
				replenishAmt: 1
			});
		});

		it('should not call clear used letters if usedLetters is empty or undefined', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 1, replenishAmt: 0 }),
					showUpdatePopup,
					toggleUpdatePopup,
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const repBtn = await result.findByTestId('replenish-keyboard');

			await fireEvent.click(repBtn);
			expect(clearUsedLettersMock).not.toHaveBeenCalled();
		});
	});

	describe('key button', () => {
		it('should show the key modal when true', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup,
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const button = await result.findByTestId('key-button');
			expect(button).toBeInTheDocument();
			fireEvent.click(button);

			const modal = await result.findByTestId('key-modal');
			expect(modal).toBeInTheDocument();
		});
	});

	describe('Update poup', () => {
		it('should render update popup', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup,
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const updateBtn = await result.findByTestId('update-popup-reps');

			expect(updateBtn).toBeInTheDocument();
		});

		it('should call toggle update popup if popup is rendered', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection,
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: () =>
						toggleUpdatePopupMock(defaultUpdatesState(updateNames), 'replenish', true),
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const updateBtn = await result.findByTestId('update-popup-reps');

			fireEvent.click(updateBtn);

			expect(toggleUpdatePopupMock).toHaveBeenCalled();
			const updateMap = toggleUpdatePopupMock.mock.results[0].value;
			expect(updateMap.get('replenish')).toBe(true);
		});
	});

	describe('clear selection', () => {
		it('should call clear selection', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['t', 'e', 's', 't'],
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const clearSelectionBtn = await result.findByTestId('clear-selection');

			fireEvent.click(clearSelectionBtn);

			expect(clearSelectionMock).toHaveBeenCalled();
			expect(clearSelectionMock.mock.results[0].value).toEqual({
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false
			});
		});
		it('should not call clear selection if no selection', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: [],
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const clearSelectionBtn = await result.findByTestId('clear-selection');

			fireEvent.click(clearSelectionBtn);

			expect(clearSelectionMock).not.toHaveBeenCalled();
		});
	});

	describe('guess', () => {
		it('should call the guess button with invalid guess error', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['t', 'r', 's'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['t', 'r', 's'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);
			expect(guessBtn).toBeInTheDocument();
			expect(guessMock).toHaveBeenCalled();
			const results = await guessMock.mock.results[0].value;
			expect(results).toEqual({
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false,
				errors: ['Not a valid guess'],
				swaps: [],
				correctPositions: 0,
				guesses: [],
				usedLetters: [],
				moveAmount: 0,
				cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
			});
		});
		it('should not call guess if selected is too short', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['t', 'o'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['t', 'o'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
							getMoveToIndex: () =>
								getMoveToIndexMockWithArgs({
									selected: ['t', 'o'],
									cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
									startIndex: 0
								})
						}),

					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			expect(guessMock).not.toHaveBeenCalled();
		});

		it('should call guess button with a not in cipher error', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['z', 'e', 's', 't'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['z', 'e', 's', 't'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			const results = await guessMock.mock.results[0].value;
			expect(results).toEqual({
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false,
				errors: ['Not in cipher'],
				swaps: [],
				correctPositions: 0,
				guesses: [],
				usedLetters: [],
				moveAmount: 0,
				cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
			});
		});

		it('should call guess button with a not valid guess error', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['t', 'u', 'r', 'p'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['t', 'u', 'r', 'p'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			const results = await guessMock.mock.results[0].value;
			expect(results).toEqual({
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false,
				errors: ['Not a valid guess'],
				swaps: [],
				correctPositions: 0,
				guesses: [],
				usedLetters: [],
				moveAmount: 0,
				cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
			});
		});

		it('should call guess button with a same position error', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['t', 'r', 'i', 'a', 'n', 'g', 'l', 'e'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['t', 'r', 'i', 'a', 'n', 'g', 'l', 'e'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
							word: 'triangle',
							startIndex: 0,
							getMoveToIndex: () =>
								getMoveToIndexMockWithArgs({
									selected: ['t', 'r', 'i', 'a', 'n', 'g', 'l', 'e'],
									cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
									startIndex: 0
								})
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			const results = await guessMock.mock.results[0].value;

			expect(results).toEqual({
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false,
				errors: ['Same position'],
				swaps: [],
				correctPositions: 0,
				guesses: [],
				usedLetters: [],
				moveAmount: 0,
				cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g']
			});
		});
		it('should call guess button with success', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: ['r', 'e', 'a', 's', 'o', 'n', 's'],
					guess: () =>
						guessMock({
							...guessParams,
							selected: ['r', 'e', 'a', 's', 'o', 'n', 's'],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
							word: 'triangle',
							startIndex: 2,
							getMoveToIndex: () =>
								getMoveToIndexMockWithArgs({
									selected: ['r', 'e', 'a', 's', 'o', 'n', 's'],
									cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
									startIndex: 2
								})
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			const results = await guessMock.mock.results[0].value;

			expect(results).toEqual({
				swaps: [true],
				correctPositions: 4,
				guesses: ['reasons'],
				usedLetters: ['r', 'e', 'a', 's', 'o', 'n', 's'],
				selected: [],
				indexToSwap: -1,
				startIndex: -1,
				allowChooseIndex: false,
				moveAmount: 1,
				cipherState: ['t', 'r', 'i', 'a', 'l', 'e', 'n', 'g'],
				errors: []
			});
		});

		it('should not call guess button with selected as empty', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: vi.fn(),
					selected: [],
					guess: () =>
						guessMock({
							...guessParams,
							selected: [],
							cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
							word: 'triangle',
							startIndex: 0,
							getMoveToIndex: () =>
								getMoveToIndexMockWithArgs({
									selected: [],
									cipherState: ['t', 'i', 'r', 'a', 'l', 'e', 'n', 'g'],
									startIndex: 0
								})
						}),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);

			expect(guessMock).not.toHaveBeenCalled();
		});
	});
});
