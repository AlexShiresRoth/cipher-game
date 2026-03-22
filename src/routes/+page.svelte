<script lang="ts">
	import { type PrefMap, type PuzzleGuessesResponse } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import GameOverModal from '$lib/components/game-over-modal.svelte';
	import HowTo from '$lib/components/how-to.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Nav from '$lib/components/nav.svelte';
	import Selection from '$lib/components/selection.svelte';
	import SolutionPath from '$lib/components/solution-path.svelte';
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
		maxWordLength,
		onSelect,
		PreferenceKeys,
		removeLetterFromSelection,
		StorageKeys,
		toggleUpdatePopup,
		vowels
	} from '$lib/logic';
	import { defaultUpdatesState, getUpdateMapValue, updateNames } from '$lib/logic/updates';
	import clsx from 'clsx';
	import { format } from 'date-fns';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	type GameLogicState = {
		moveAmount: number;
		guesses: string[];
		usedLetters: string[];
		swaps: boolean[];
		indexToSwap: number;
		startIndex: number;
		allowChooseIndex: boolean;
		replenishAmt: number;
	};

	type GameUIState = {
		modalOpen: boolean;
		showTutorial: boolean;
		showMySolution: boolean;
		showLetters: boolean;
		showNavModal: boolean;
	};

	type GameSystemState = {
		win: boolean;
		hydrated: boolean;
		gameOver: boolean;
		internalError: boolean;
		errors: string[];
		cipherStateHistory: string[];
		updatesState: Map<string, boolean>;
		loading: boolean;
	};

	/*** Init Vars ***/
	const date = new Date();
	export let data: CipherPuzzle & { id: number } & { cipherPlayerData: PuzzleGuessesResponse };
	export let word = data.word;
	export let cipher = data.cipherWord;
	export let cipherState = cipher.split('');
	export let cipherPlayerData = data.cipherPlayerData;

	const defaultGameLogic: GameLogicState = {
		moveAmount: 0,
		guesses: [],
		usedLetters: [],
		swaps: [],
		indexToSwap: -1,
		startIndex: -1,
		allowChooseIndex: false,
		replenishAmt: 0
	};

	const defaultUIState: GameUIState = {
		showLetters: false,
		showMySolution: false,
		showNavModal: false,
		showTutorial: false,
		modalOpen: false
	};

	const defaultGameSystemState: GameSystemState = {
		win: false,
		cipherStateHistory: [],
		hydrated: false,
		loading: true,
		updatesState: defaultUpdatesState(updateNames),
		internalError: false,
		gameOver: false,
		errors: []
	};

	const gameLogicStore = writable<GameLogicState>(defaultGameLogic);
	const gameUIStore = writable<GameUIState>(defaultUIState);
	const gameSystemStore = writable<GameSystemState>(defaultGameSystemState);

	$: gameLogic = $gameLogicStore;
	$: gameUI = $gameUIStore;
	$: gameSystem = $gameSystemStore;

	let win = false;
	let moveAmount = 0;
	let modalOpen = false;
	let showNavModal = false;
	let guesses: string[] = [];
	let usedLetters: string[] = [];
	let swaps: boolean[] = [];
	let indexToSwap: number;
	let startIndex: number = -1;
	let allowChooseIndex = false;
	let showTutorial = false;
	let replenishAmt = 0;
	let cipherStateHistory: string[] = [];

	// TODO - handle derived states separately
	const formattedDate = format(date.toLocaleDateString(), 'yyyy-MM-dd');
	$: correctPositions = cipherState.filter((l, i) => l === word[i]).length;

	$: alphaState = new Map<string, number>();
	$: updatesState = defaultUpdatesState(updateNames);
	$: preferences = new Map() as PrefMap;
	$: shouldAllowReplenish = false;
	$: selected = [] as string[];
	$: hydrated = false;
	$: loading = true;
	$: errors = [] as string[];
	$: gameOver = false;
	$: showLetters = false;
	$: showMySolution = false;
	$: internalError = false;

	function toggleModalOpen(val: boolean) {
		// TODO - remove this variable once store is being read
		modalOpen = val;

		gameUIStore.update((state) => ({
			...state,
			modalOpen: val
		}));
	}

	/**
	 *
	 * @param exceptions
	 * @desc resets local storage to default game state but
	 * keeps some params that should persist across games
	 */
	function removeLocalStorageItemsWithExceptions(exceptions: string[]) {
		return Object.entries(StorageKeys).forEach(([key, value]) => {
			if (!exceptions.includes(value)) {
				localStorage.removeItem(key);
			}
		});
	}

	/**
	 * @desc resets game to initial state
	 */
	function resetGame() {
		// TODO - GET RID OF LOCAL VARIABLES
		win = false;
		gameOver = false;
		modalOpen = false;
		// I don't think we will need this anymore
		const cleared = clearSelection();
		selected = cleared.selected;
		indexToSwap = cleared.indexToSwap;
		startIndex = cleared.startIndex;
		allowChooseIndex = cleared.allowChooseIndex;
		guesses = [];
		moveAmount = 0;
		cipherStateHistory = [];
		usedLetters = [];
		replenishAmt = 0;
		swaps = [];

		// TODO - these should be moved
		cipherState = data.cipherWord.split('');
		alphaState = defaultAlphaState(alpha, cipherState, vowels);

		gameLogicStore.set(defaultGameLogic);
		gameUIStore.set(defaultUIState);
		gameSystemStore.set(defaultGameSystemState);

		removeLocalStorageItemsWithExceptions([StorageKeys.viewed]);
	}

	/**
	 * @param keys
	 * @desc get a list of things from local storage based on provided keys
	 */
	function getItemsFromStorage(keys: string[]) {
		return keys.map((key) => localStorage.getItem(key));
	}

	function parseJSON(json: string) {
		return JSON.parse(json);
	}

	// TODO - need to refactor for using gamestores
	// handle if user has already completed todays game
	function checkTodaysPuzzle() {
		const [
			savedGuesses,
			moves,
			puzzle,
			storedCipher,
			lettersUsed,
			correctGuesses,
			replenishAmount,
			cipherStateHistoryStored,
			gameStatus
		] = getItemsFromStorage([
			StorageKeys.guesses,
			StorageKeys.moves,
			StorageKeys.puzzle,
			StorageKeys.cipher,
			StorageKeys.usedLetters,
			StorageKeys.swaps,
			StorageKeys.replenishAmt,
			StorageKeys.cipherStateHistory,
			StorageKeys.gameStatus
		]);

		if (puzzle !== word) {
			resetGame();
			return;
		}

		// TODO should probably make a key 'win'
		const winGame = gameStatus === 'win';

		gameSystemStore.update((state) => ({
			...state,
			cipherStateHistory: cipherStateHistoryStored
				? parseJSON(cipherStateHistoryStored)
				: state.cipherStateHistory,
			win: winGame,
			gameOver: winGame
		}));

		gameLogicStore.update((state) => ({
			...state,
			guesses: savedGuesses ? parseJSON(savedGuesses) : state.guesses,
			moves: moves ? parseInt(moves) : state.moveAmount,
			replenishAmt: replenishAmount ? parseJSON(replenishAmount) : state.replenishAmt,
			swaps: correctGuesses ? parseJSON(correctGuesses) : state.swaps
		}));

		gameUIStore.update((state) => ({
			...state,
			modalOpen: winGame
		}));

		// done
		if (cipherStateHistoryStored) {
			cipherStateHistory = JSON.parse(cipherStateHistoryStored);
		}
		//done
		if (savedGuesses && moves) {
			guesses = JSON.parse(savedGuesses);
			moveAmount = parseInt(moves);
		}
		// done
		if (localStorage.getItem(StorageKeys.gameStatus) === 'win') {
			win = true;
			gameOver = true;
			modalOpen = true;
		}
		// done
		if (moves) {
			moveAmount = parseInt(moves);
		}
		// TODO - idk how to handle this
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}
		// done
		if (replenishAmount) {
			replenishAmt = JSON.parse(replenishAmount);
		}
		// done
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

	// TODO - refactor this too
	// check for when user has either won or lost game
	async function checkForGameStatus() {
		if (!internalError) return;
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

	// TODO - refactor this monstrosity
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

		if (!result.invalidGuess) {
			if (cipherStateHistory.length === 0) {
				cipherStateHistory = [data.cipherWord];
			}
			cipherStateHistory = [...cipherStateHistory, result.cipherState.join('')];
		}

		gameLogicStore.update((state) => ({
			...state,
			guesses: result.guesses,
			startIndex: result.startIndex,
			indexToSwap: result.indexToSwap,
			swaps: result.swaps
		}));

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
		localStorage.setItem(StorageKeys.cipherStateHistory, JSON.stringify(cipherStateHistory));
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

	function checkForInternalErrors(id: number) {
		return id < 0;
	}

	onMount(() => {
		// there seems to be some missing dates in DB, we need a fallback
		// besides fixing the data
		internalError = checkForInternalErrors(data.id);

		if (internalError) return;

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
		modalOpen;

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
	<title>Play CIPHER {`#`}{data.id || 'Uh oh :('} - Daily Word-Shuffle Puzzle</title>
	<meta
		name="description"
		content="Play Cipher, the daily interactive word-shuffle puzzle game. Decipher the shuffled word using clever moves, swapping mechanics, and logic-based strategy."
	/>
	<meta
		property="og:title"
		content={`CIPHER #${data.id || 'Uh oh :('} – Daily Word-Shuffle Puzzle`}
	/>
	<meta
		property="og:description"
		content="Decipher shuffled words and challenge yourself with the daily brain-teaser."
	/>
	<meta property="og:type" content="game" />
	<meta property="og:url" content="https://play-cipher.com" />
	<meta property="og:image" content="https://play-cipher.com/og-image.png" />
	<link rel="canonical" href="https://play-cipher.com/" />
</svelte:head>

{#if internalError}
	<div><p>Uh oh</p></div>
{/if}

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

	<!-- GAME OVER STATE -->
	{#if gameOver && modalOpen}
		<!-- Game over share modal -->
		<GameOverModal
			{word}
			{shareResults}
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

	<!-- PLAY STATE UI-->
	<div class="absolute top-10 flex flex-col gap-2">
		{#each errors.slice(0, 5) as error, i (`${error}-${i}`)}
			<button transition:fly={{ y: -100 }} class="bg-black p-2 text-sm text-white shadow-lg"
				>{error}</button
			>
		{/each}
	</div>

	<div class="flex w-11/12 flex-col items-center md:w-2/3 lg:w-1/2">
		<!-- PREFERENCES UI -->
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

		{#if showMySolution && gameOver}
			<div class="flex w-full flex-col">
				<div class="w-full pt-4">
					<h2 class="text-3xl uppercase">My Solution</h2>
				</div>
				<SolutionPath {word} solutionPath={cipherStateHistory} {guesses} />
			</div>
		{/if}

		{#if !showMySolution}
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
				handleSelect={(l: string) => {
					if (gameOver) return;
					if (selected.length >= maxWordLength) return;

					const data = onSelect(l, selected, cipherState, startIndex);

					selected = data.selected;
					startIndex = data.startIndex;
					allowChooseIndex = data.allowChooseIndex;
				}}
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
		{/if}

		<!-- TOGGLE PLAYER SOLUTION AND ENDGAME STATE -->
		{#if gameOver}
			<div class="flex items-center gap-2 py-8">
				<button
					on:click={() => {
						showMySolution = !showMySolution;
						window.scrollTo({
							behavior: 'smooth',
							top: 0
						});
					}}
					class={clsx('rounded px-4 py-2 uppercase dark:text-black', {
						'bg-black text-white dark:bg-emerald-500': showMySolution,
						'bg-black text-white dark:bg-indigo-500': !showMySolution
					})}>{showMySolution ? 'View Game' : 'View solution'}</button
				>
			</div>
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
