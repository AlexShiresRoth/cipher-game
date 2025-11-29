import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ActionButtons from './action-buttons.svelte';
const clearUsedLetters = vi.fn();
const usedLetters: string[] = [];
const showUpdatePopup: boolean = false;
const toggleUpdatePopup = vi.fn();
const selected: string[] = [];
const removeLetterFromSelection = vi.fn();
const guess = vi.fn();
const clearSelection = vi.fn();

describe('Action Buttons', () => {
	it('should render replenish button', async () => {
		const result = render(ActionButtons, {
			props: {
				clearSelection,
				usedLetters,
				clearUsedLetters,
				showUpdatePopup,
				toggleUpdatePopup,
				selected,
				guess,
				removeLetterFromSelection
			}
		});

		const repBtn = await result.findByTestId('replenish-keyboard');
		expect(repBtn).toBeInTheDocument();
	});

	it('should call clear selection', async () => {
		const result = render(ActionButtons, {
			props: {
				clearSelection,
				usedLetters,
				clearUsedLetters,
				showUpdatePopup,
				toggleUpdatePopup,
				selected,
				guess,
				removeLetterFromSelection
			}
		});

		const repBtn = await result.findByTestId('replenish-keyboard');

		await fireEvent.click(repBtn);
		expect(clearUsedLetters).toHaveBeenCalled();
		console.log('clear selec', clearUsedLetters.mock.calls);
	});
});
