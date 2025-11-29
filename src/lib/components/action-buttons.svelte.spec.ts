import {
	clearSelection,
	clearUsedLetters,
	guess,
	isValidWord,
	toggleUpdatePopup
} from '$lib/logic';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ActionButtons from './action-buttons.svelte';

const usedLetters: string[] = [];
const showUpdatePopup: boolean = false;
const toggleUpdatePopupMock = vi.fn((args) => toggleUpdatePopup(args));
const selected: string[] = [];
const removeLetterFromSelection = vi.fn();
const guessMock = vi.fn((args) => guess(args));
const clearSelectionMock = vi.fn(() => clearSelection());
const clearUsedLettersMock = vi.fn((args) => clearUsedLetters(args));
const isValidWordMock = vi.fn((args) => isValidWord(args));
const getMoveToIndexMock = vi.fn();
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
	getMoveToIndex: getMoveToIndexMock
};

describe('Action Buttons', () => {
	describe('Replenish buttons', () => {
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
					toggleUpdatePopup: () => toggleUpdatePopupMock(true),
					selected,
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const updateBtn = await result.findByTestId('update-popup-reps');

			fireEvent.click(updateBtn);

			expect(toggleUpdatePopupMock).toHaveBeenCalled();
			expect(toggleUpdatePopupMock.mock.results[0].value).toBe(false);
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
					toggleUpdatePopup: () => toggleUpdatePopupMock(true),
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
					toggleUpdatePopup: () => toggleUpdatePopupMock(true),
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
		it('should call the guess button', async () => {
			const result = render(ActionButtons, {
				props: {
					clearSelection: () => clearSelectionMock(),
					usedLetters,
					clearUsedLetters: () => clearUsedLettersMock({ moveAmount: 10, replenishAmt: 0 }),
					showUpdatePopup: true,
					toggleUpdatePopup: () => toggleUpdatePopupMock(true),
					selected: [],
					guess: () => guessMock(guessParams),
					removeLetterFromSelection
				}
			});

			const guessBtn = await result.findByTestId('guess-btn');

			fireEvent.click(guessBtn);
			expect(guessBtn).toBeInTheDocument();
			expect(guessMock).toHaveBeenCalled();
			console.log('plop', guessMock.mock.results);
		});
	});
});
