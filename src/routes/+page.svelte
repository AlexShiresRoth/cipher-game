<script lang="ts">
	import { type PrefMap, type PuzzleGuessesResponse } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import GameOverModal from '$lib/components/game-over-modal.svelte';
	import HowTo from '$lib/components/how-to.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Nav from '$lib/components/nav.svelte';
	import Selection from '$lib/components/selection.svelte';
	import {
		alpha,
		checkAlphaStateIsDiminshed,
		checkStorageForPreferences,
		clearSelection,
		clearUsedLetters,
		defaultAlphaState,
		getMoveToIndex,
		getTierByMoves,
		guess,
		PreferenceKeys,
		removeLetterFromSelection,
		toggleUpdatePopup,
		vowels
	} from '$lib/logic';
	import { defaultUpdatesState, getUpdateMapValue, updateNames } from '$lib/logic/updates';
	import { format } from 'date-fns';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	const StorageKeys = {
		usedLetters: 'usedLetters',
		moves: 'moves',
		replenishAmt: 'replenishAmt',
		guesses: 'guesses',
		cipher: 'cipher',
		swaps: 'swaps',
		gameStatus: 'gameStatus',
		puzzle: 'puzzle',
		viewed: 'viewedV5',
		date: 'date'
	};

	const maxWordLength = 12;

	const date = new Date();

	export let data: CipherPuzzle & { id: string } & { cipherPlayerData: PuzzleGuessesResponse };
	export let word = data.word;
	export let cipher = data.cipherWord;
	export let cipherState = cipher.split('');
	export let cipherPlayerData = data.cipherPlayerData;

	let win = false;
	let lose = false;

	let moveAmount = 0;
	let modalOpen = false;
	let showNavModal = false;
	let guesses: string[] = [];
	let usedLetters: string[] = [];
	let swaps: boolean[] = [];
	let indexToSwap: number;
	let startIndex: number = -1;
	let allowChooseIndex = false;
	let showLetters = false;
	let showTutorial = false;
	let replenishAmt = 0;

	let correctPositions = cipherState.filter((l, i) => l === word[i]).length;
	let formattedDate = format(date.toLocaleDateString(), 'yyyy-MM-dd');

	$: alphaState = new Map<string, number>();
	$: updatesState = defaultUpdatesState(updateNames);
	$: preferences = new Map() as PrefMap;
	$: shouldAllowReplenish = false;
	$: selected = [] as string[];
	$: hydrated = false;
	$: loading = true;
	$: errors = [] as string[];
	$: gameOver = false;

	function toggleModalOpen(val: boolean) {
		modalOpen = val;
	}

	function onSelect(letter: string) {
		if (gameOver) return;
		if (selected.length >= maxWordLength) return;

		selected = [...selected, letter];

		if (selected.length <= 1) {
			startIndex = cipherState.indexOf(selected[0]);
		}

		// we need to allow selecting starting index if there are duplicate letters
		if (selected[0] === letter) {
			if (cipherState.filter((l) => l === letter).length > 1) {
				allowChooseIndex = true;
			}
		}
		if (selected.length > 1) {
			allowChooseIndex = false;
		}
	}

	// remove all stored data
	function resetStorage() {
		win = false;
		lose = false;
		gameOver = false;
		modalOpen = false;
		const cleared = clearSelection();
		selected = cleared.selected;
		indexToSwap = cleared.indexToSwap;
		startIndex = cleared.startIndex;
		allowChooseIndex = cleared.allowChooseIndex;
		guesses = [];
		moveAmount = 0;
		cipherState = data.cipherWord.split('');
		usedLetters = [];
		replenishAmt = 0;
		swaps = [];
		alphaState = defaultAlphaState(alpha, cipherState, vowels);
		Object.entries(StorageKeys).forEach(([key, value]) => {
			if (value !== StorageKeys.viewed) {
				localStorage.removeItem(key);
			}
		});
	}

	// handle if user has already completed todays game
	function checkTodaysPuzzle() {
		const savedGuesses = localStorage.getItem(StorageKeys.guesses);
		const moves = localStorage.getItem(StorageKeys.moves);
		const puzzle = localStorage.getItem(StorageKeys.puzzle);
		const storedCipher = localStorage.getItem(StorageKeys.cipher);
		const lettersUsed = localStorage.getItem(StorageKeys.usedLetters);
		const correctGuesses = localStorage.getItem(StorageKeys.swaps);
		const replenishAmount = localStorage.getItem(StorageKeys.replenishAmt);

		if (savedGuesses && moves) {
			guesses = JSON.parse(savedGuesses);
			moveAmount = parseInt(moves);
		}
		if (puzzle !== word) {
			resetStorage();
			return;
		}
		if (localStorage.getItem(StorageKeys.gameStatus) === 'win') {
			win = true;
			gameOver = true;
			modalOpen = true;
		}
		if (moves) {
			moveAmount = parseInt(moves);
		}
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}

		if (replenishAmount) {
			replenishAmt = JSON.parse(replenishAmount);
		}
		if (correctGuesses) {
			swaps = JSON.parse(correctGuesses);
		}
		if (lettersUsed) {
			usedLetters = JSON.parse(lettersUsed);
			alphaState = handleUpdateAlphaMap(
				alpha,
				usedLetters,
				defaultAlphaState(alpha, cipherState, vowels)
			);
			shouldAllowReplenish = checkAlphaStateIsDiminshed(alphaState, data.cipherWord.split(''));
		} else {
			alphaState = defaultAlphaState(alpha, cipherState, vowels);
		}
	}

	function addTodaysPuzzleToStorage(newWord: string) {
		const storedPuzzle = localStorage.getItem(StorageKeys.puzzle);
		if (storedPuzzle !== newWord) {
			localStorage.setItem(StorageKeys.puzzle, newWord);
		}
	}

	function shouldShowTutorial() {
		const hasViewedGame = localStorage.getItem(StorageKeys.viewed);
		if (hasViewedGame) {
			return;
		} else {
			showTutorial = true;
			// show all updates on load
			const updatesMap = new Map(updatesState);

			updatesMap.forEach((_, key) => {
				updatesMap.set(key, true);
			});

			updatesState = updatesMap;
			localStorage.setItem(StorageKeys.viewed, 'true');
		}
	}

	async function submitPlayerUsedWords(
		playerGuesses: string[],
		cipherId: string,
		date: string
	): Promise<PuzzleGuessesResponse> {
		const res = await fetch('api/add-guess', {
			method: 'POST',
			body: JSON.stringify({ guesses: playerGuesses, cipherId, date })
		});

		return await res.json();
	}

	// check for when user has either won or lost game
	async function checkForGameStatus() {
		win = true;
		gameOver = true;
		modalOpen = true;
		localStorage.setItem(StorageKeys.gameStatus, 'win');
		localStorage.setItem(StorageKeys.moves, String(moveAmount));
		localStorage.setItem(StorageKeys.cipher, word);
		localStorage.setItem(StorageKeys.date, formattedDate);
		// add the words players used to solve the cipher to the db, on win
		cipherPlayerData = await submitPlayerUsedWords(guesses, data.id, data.date);
	}

	// render any errors & remove after set time
	function checkForErrors() {
		setTimeout(() => {
			const newErrors = [...errors];
			newErrors.pop();
			errors = newErrors.slice(0, 5);
		}, 3000);
	}

	// handle user selection & interaction
	function checkSelection() {
		if (selected.length > 0) {
			const moveIndex = handleGetMoveToIndex();
			indexToSwap = moveIndex;
		}
		if (selected.length === 0) {
			const cleared = clearSelection();
			selected = cleared.selected;
			indexToSwap = cleared.indexToSwap;
			startIndex = cleared.startIndex;
			allowChooseIndex = cleared.allowChooseIndex;
		}
	}

	// this only happens if there are duplicate letters
	// the user can then click on the letter
	function chooseStartingIndex(index: number) {
		if (cipherState[index] === selected[0]) {
			startIndex = index;
			allowChooseIndex = false;
			const moveIndex = handleGetMoveToIndex();
			indexToSwap = moveIndex;
		}
	}

	function handleGetMoveToIndex() {
		return getMoveToIndex({ selected, startIndex, cipherState });
	}

	function handleUpdateAlphaMap(
		alpha: string[],
		usedLetters: string[],
		defaultState: SvelteMap<string, number>
	) {
		const newAlphaState = new SvelteMap<string, number>();
		alpha.forEach((l) => {
			const hasUsedLetters = usedLetters.filter((ul) => l === ul).length;
			const currentKey = defaultState.get(l) as number;
			newAlphaState.set(
				l,
				hasUsedLetters > 0
					? currentKey - hasUsedLetters > 0
						? currentKey - hasUsedLetters
						: 0
					: currentKey
			);
		});
		return newAlphaState;
	}

	async function handleGuess() {
		const result = await guess({
			errors,
			swaps,
			selected,
			startIndex,
			moveAmount,
			usedLetters,
			cipherState,
			getMoveToIndex: handleGetMoveToIndex,
			guesses,
			word,
			correctPositions
		});
		errors = result.errors;
		swaps = result.swaps;
		selected = result.selected;
		startIndex = result.startIndex;
		indexToSwap = result.indexToSwap;
		guesses = result.guesses;
		correctPositions = result.correctPositions;
		cipherState = result.cipherState;
		moveAmount = result.moveAmount;
		usedLetters = result.usedLetters;
		allowChooseIndex = result.allowChooseIndex;

		// We need to update map of letters based on their usage
		alphaState = handleUpdateAlphaMap(
			alpha,
			usedLetters,
			defaultAlphaState(alpha, cipherState, vowels)
		);

		shouldAllowReplenish = checkAlphaStateIsDiminshed(alphaState, data.cipherWord.split(''));

		localStorage.setItem(StorageKeys.guesses, JSON.stringify(guesses));
		localStorage.setItem(StorageKeys.moves, JSON.stringify(moveAmount));
		localStorage.setItem(StorageKeys.cipher, cipherState.join(''));
		localStorage.setItem(StorageKeys.usedLetters, JSON.stringify(usedLetters));
		localStorage.setItem(StorageKeys.swaps, JSON.stringify(swaps));
	}

	// social results game sharing
	async function shareResults() {
		function getRows() {
			let rows: boolean[][] = [];
			for (let i = 0; i < swaps.length; i += 4) {
				rows.push(swaps.slice(i, i + 4));
			}
			return rows;
		}

		const rows = getRows();
		const rowsText = rows
			.map((row) => {
				return row.map((b) => (b ? '🧩' : '❌')).join('');
			})
			.join('\n');
		const shareText =
			`Cipher #${data.id} ${getTierByMoves(moveAmount, replenishAmt, swaps, alphaState, gameOver, data.minMoves, data.cipherWord.split('')).emoji}
${moveAmount} moves
${rowsText}
${replenishAmt} reps used`.trim();

		const shareData = {
			text: shareText,
			title: `Cipher #${data.id}`,
			url: 'https://play-cipher.com'
		};

		const canNativeShare =
			typeof navigator !== 'undefined' &&
			'navigator' in window &&
			typeof navigator.share === 'function';

		try {
			if (canNativeShare) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareData.text);
				alert('copied to clipboard!');
			}
		} catch (error) {
			console.info('Player aborted share');
		}
	}

	function checkIfPreferenceSettingExist(preferences: PrefMap) {
		return preferences && Array.from(preferences.values()).some((val) => val.show);
	}

	onMount(() => {
		if (word) {
			checkTodaysPuzzle();
			addTodaysPuzzleToStorage(word);
			shouldShowTutorial();
			preferences = checkStorageForPreferences(PreferenceKeys);
			hydrated = true;
			loading = false;
		}
	});

	$: if (cipherState.join('') === word && !gameOver) {
		checkForGameStatus();
	}

	$: if (errors.length > 0) {
		checkForErrors();
	}

	$: (() => {
		if (typeof window === 'undefined') return;

		showLetters = false;

		tick().then(() => {
			setTimeout(() => (showLetters = true), 200);
		});
	})();

	// reactive effects
	$: (() => {
		selected;

		checkSelection();
	})();
</script>

<svelte:head>
	<title>Play CIPHER {`#`}{data.id} - Daily Word-Shuffle Puzzle</title>
	<meta
		name="description"
		content="Play Cipher, the daily interactive word-shuffle puzzle game. Decipher the shuffled word using clever moves, swapping mechanics, and logic-based strategy."
	/>
	<meta property="og:title" content={`CIPHER #${data.id} – Daily Word-Shuffle Puzzle`} />
	<meta
		property="og:description"
		content="Decipher shuffled words and challenge yourself with the daily brain-teaser."
	/>
	<meta property="og:type" content="game" />
	<meta property="og:url" content="https://play-cipher.com" />
	<meta property="og:image" content="https://play-cipher.com/og-image.png" />
	<link rel="canonical" href="https://play-cipher.com/" />
</svelte:head>

<div class:hidden={!hydrated && loading} class="flex w-full flex-col items-center">
	<Nav
		{word}
		solutionPath={data.solutionPath}
		{gameOver}
		{showNavModal}
		{toggleModalOpen}
		{replenishAmt}
		{moveAmount}
		{guesses}
		solvableAmt={data.minMoves}
		puzzleData={cipherPlayerData}
		emoji={(() => {
			const alphaStateMap =
				alphaState.size === 0 ? defaultAlphaState(alpha, cipherState, vowels) : alphaState;
			return getTierByMoves(
				moveAmount,
				replenishAmt,
				swaps,
				alphaStateMap,
				gameOver,
				data.minMoves,
				data.cipherWord.split('')
			).emoji;
		})()}
		mistakeAmount={swaps.filter((b) => !b).length}
		showPlayerGuessUpdate={getUpdateMapValue(updateNames.playerGuesses, updatesState)}
		toggleUpdatePopup={() => {
			updatesState = toggleUpdatePopup(
				updatesState,
				updateNames.playerGuesses,
				!getUpdateMapValue(updateNames.playerGuesses, updatesState)
			);
		}}
	/>

	{#if showTutorial}
		<div
			class="fixed top-0 z-20 flex max-h-full w-screen flex-col items-end gap-4 overflow-y-scroll bg-white/40 px-4 pt-10 dark:bg-black/40"
		>
			<button
				on:click={() => (showTutorial = false)}
				out:fly={{ y: -200 }}
				class="fly-in-down bg-white p-4 text-black dark:bg-black dark:text-white">close</button
			>
			<div class="fly-in-up bg-white dark:bg-black" out:fly={{ y: 200 }}>
				<HowTo />
			</div>
		</div>
	{/if}

	{#if gameOver && modalOpen}
		<GameOverModal
			{word}
			{shareResults}
			{win}
			{showLetters}
			tier={getTierByMoves(
				moveAmount,
				replenishAmt,
				swaps,
				alphaState,
				gameOver,
				data.minMoves,
				data.cipherWord.split('')
			)}
			{toggleModalOpen}
			solvableAmt={data.minMoves}
			{replenishAmt}
			{moveAmount}
			mistakeAmount={swaps.filter((b) => !b).length}
		/>
	{/if}

	<div class="absolute top-10 flex flex-col gap-2">
		{#each errors.slice(0, 5) as error, i (`${error}-${i}`)}
			<button transition:fly={{ y: -100 }} class="bg-black p-2 text-sm text-white shadow-lg"
				>{error}</button
			>
		{/each}
	</div>

	<div class="flex w-11/12 flex-col items-center md:w-2/3 lg:w-1/2">
		{#if checkIfPreferenceSettingExist(preferences)}
			<div class="my-4 flex w-full flex-wrap justify-between gap-4 text-sm">
				{#if preferences.get(PreferenceKeys.showRank)?.show}
					<div class="flex items-center gap-1">
						<p>
							Status <span
								>{getTierByMoves(
									moveAmount,
									replenishAmt,
									swaps,
									alphaState,
									gameOver,
									data.minMoves,
									data.cipherWord.split('')
								).emoji}</span
							>
						</p>
					</div>
				{/if}
				{#if preferences.get(PreferenceKeys.showMistakes)?.show}
					<div class="flex items-center gap-1">
						<p>Mistakes <span>{swaps.filter((b) => !b).length}</span></p>
					</div>
				{/if}
				{#if preferences.get(PreferenceKeys.showMoves)?.show}
					<div class="flex items-center gap-1"><p>Moves <span>{moveAmount}</span></p></div>
				{/if}
				{#if preferences.get(PreferenceKeys.showReps)?.show}
					<div class="flex items-center gap-1"><p>Reps <span>{replenishAmt}</span></p></div>
				{/if}
				{#if preferences.get(PreferenceKeys.showSolvable)?.show}
					<div class="flex items-center gap-1"><p>Solvable <span>{data.minMoves}</span></p></div>
				{/if}
			</div>
		{/if}
		<!-- Current user selection row -->
		<Selection {selected} shouldHaveMargin={!checkIfPreferenceSettingExist(preferences)} />
		<!-- Cipher blocks row -->
		<Cipher
			{word}
			{cipherState}
			{allowChooseIndex}
			{selected}
			{startIndex}
			{indexToSwap}
			chooseStartingIndex={(index: number) => {
				if (allowChooseIndex) {
					chooseStartingIndex(index);
				}
			}}
		/>

		<!-- Letter selection box -->
		<Keyboard
			{selected}
			handleSelect={(l: string) => onSelect(l)}
			{alpha}
			{alphaState}
			guess={handleGuess}
			removeLetterFromSelection={() => {
				const { newSelection } = removeLetterFromSelection(selected);
				selected = newSelection;
			}}
		/>

		<!-- Action buttons -->
		{#if !gameOver}
			<ActionButtons
				clearSelection={() => {
					const cleared = clearSelection();
					selected = cleared.selected;
					indexToSwap = cleared.indexToSwap;
					startIndex = cleared.startIndex;
					allowChooseIndex = cleared.allowChooseIndex;
				}}
				clearUsedLetters={() => {
					const clearedLetters = clearUsedLetters({ moveAmount, replenishAmt });
					usedLetters = clearedLetters.usedLetters;
					replenishAmt = clearedLetters.replenishAmt;
					shouldAllowReplenish = clearedLetters.shouldAllowReplenish;
					alphaState = defaultAlphaState(alpha, cipherState, vowels);
					localStorage.removeItem(StorageKeys.usedLetters);
					localStorage.setItem(StorageKeys.moves, JSON.stringify(moveAmount));
					localStorage.setItem(StorageKeys.replenishAmt, JSON.stringify(replenishAmt));
				}}
				removeLetterFromSelection={() => {
					const { newSelection } = removeLetterFromSelection(selected);
					selected = newSelection;
				}}
				guess={handleGuess}
				{selected}
				{shouldAllowReplenish}
			/>
		{/if}
	</div>
</div>

<div class:hidden={hydrated && !loading}>
	<div class="flex h-screen items-center justify-center gap-2">
		<img src="/logo.svg" alt="logo" height="300" width="300" />
	</div>
</div>

<style>
	@keyframes fly-in-up {
		0% {
			opacity: 0;
			transform: translateY(200px);
		}
		100% {
			opacity: 1;
			transform: translateY(0px);
		}
	}

	@keyframes fly-in-down {
		0% {
			opacity: 0;
			transform: translateY(-200px);
		}
		100% {
			opacity: 1;
			transform: translateY(0px);
		}
	}

	.fly-in-up {
		animation: fly-in-up 500ms forwards ease-in-out;
	}
	.fly-in-down {
		animation: fly-in-down 500ms forwards ease-in-out;
	}
</style>
