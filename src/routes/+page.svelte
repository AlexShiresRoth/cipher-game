<script lang="ts">
	import { type GuessReturnValues, type PrefMap, type PuzzleGuessesResponse } from '$lib';
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
		getItemsFromStorage,
		getMoveToIndex,
		getTierByMoves,
		guess,
		maxWordLength,
		onSelect,
		parseJSON,
		PreferenceKeys,
		removeItemsInStorage,
		removeLetterFromSelection,
		removeLocalStorageItemsWithExceptions,
		setItemsInStorage,
		shareResultsAction,
		StorageKeys,
		stringifyJSON,
		toggleUpdatePopup,
		vowels
	} from '$lib/logic';
	import { defaultUpdatesState, getUpdateMapValue, updateNames } from '$lib/logic/updates';
	import clsx from 'clsx';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { get, writable } from 'svelte/store';
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
		shouldAllowReplenish: boolean;
		selected: string[];
		cipherState: string[];
		alphaState: Map<string, number>;
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
		preferences: PrefMap;
	};

	// incosistent state update
	// TODO - add popup notif for swapping 2 letters into correct position

	/*** Init Vars ***/
	export let data: CipherPuzzle & { id: number } & { cipherPlayerData: PuzzleGuessesResponse };
	export let word = data.word;
	export let cipher = data.cipherWord;
	export let cipherPlayerData = data.cipherPlayerData;

	const defaultGameLogic: GameLogicState = {
		moveAmount: 0,
		guesses: [],
		usedLetters: [],
		swaps: [],
		indexToSwap: -1,
		startIndex: -1,
		allowChooseIndex: false,
		replenishAmt: 0,
		shouldAllowReplenish: false,
		selected: [],
		cipherState: cipher.split(''),
		alphaState: defaultAlphaState(alpha, cipher.split(''), vowels)
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
		cipherStateHistory: [data.cipherWord],
		hydrated: false,
		loading: true,
		updatesState: defaultUpdatesState(updateNames),
		internalError: false,
		gameOver: false,
		errors: [],
		preferences: new Map()
	};

	const gameLogicStore = writable<GameLogicState>(defaultGameLogic);
	const gameUIStore = writable<GameUIState>(defaultUIState);
	const gameSystemStore = writable<GameSystemState>(defaultGameSystemState);

	$: game = $gameLogicStore;
	$: ui = $gameUIStore;
	$: system = $gameSystemStore;

	// GAME LOGIC VARIABLES
	$: allowChooseIndex = game.allowChooseIndex;
	$: startIndex = game.startIndex;
	$: swaps = game.swaps;
	$: indexToSwap = game.indexToSwap;
	$: replenishAmt = game.replenishAmt;
	$: usedLetters = game.usedLetters;
	$: guesses = game.guesses;
	$: selected = game.selected;
	$: shouldAllowReplenish = game.shouldAllowReplenish;
	$: cipherState = game.cipherState;
	$: moveAmount = game.moveAmount;
	$: alphaState = game.alphaState;

	// GAME UI VARIABLES
	$: showLetters = ui.showLetters;
	$: showMySolution = ui.showMySolution;
	$: showNavModal = ui.showNavModal;
	$: showTutorial = ui.showTutorial;
	$: modalOpen = ui.modalOpen;

	// GAME SYSTEM VARIABLES
	$: errors = system.errors;
	$: internalError = system.internalError;
	$: gameOver = system.gameOver;
	$: updatesState = system.updatesState;
	$: hydrated = system.hydrated;
	$: cipherStateHistory = system.cipherStateHistory;
	$: loading = system.loading;
	$: win = system.win;
	$: preferences = system.preferences;

	$: correctPositions = $gameLogicStore.cipherState.filter((l, i) => l === word[i]).length;

	/**
	 *
	 * @param updates
	 * @description utility for game logic state updates
	 */
	function updateGameLogicStore(updates: Partial<GameLogicState>) {
		return gameLogicStore.update((state) => ({
			...state,
			...updates
		}));
	}

	/**
	 *
	 * @param updates
	 * @description utility for game system state updates
	 */
	function updateGameSystemStore(updates: Partial<GameSystemState>) {
		return gameSystemStore.update((state) => ({
			...state,
			...updates
		}));
	}

	/**
	 *
	 * @param updates
	 * @description utility for game UI state updates
	 */
	function updateGameUIStore(updates: Partial<GameUIState>) {
		return gameUIStore.update((state) => ({
			...state,
			...updates
		}));
	}

	/**
	 *
	 * @param val
	 * @description toggle the WHAT
	 */
	function toggleModalOpen(val: boolean) {
		return updateGameUIStore({ modalOpen: val });
	}

	/**
	 * @description resets game to initial state
	 */
	function resetGame() {
		gameLogicStore.set(defaultGameLogic);
		gameUIStore.set(defaultUIState);
		gameSystemStore.set(defaultGameSystemState);

		removeLocalStorageItemsWithExceptions([StorageKeys.viewed]);
	}

	/**
	 * @description getting game data from local storage to persist game state
	 */
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

		updateGameUIStore({
			modalOpen: winGame
		});

		gameSystemStore.update((state) => ({
			...state,
			cipherStateHistory: cipherStateHistoryStored
				? parseJSON(cipherStateHistoryStored)
				: cipherStateHistory,
			win: winGame,
			gameOver: winGame
		}));

		gameLogicStore.update((state) => ({
			...state,
			guesses: savedGuesses ? parseJSON(savedGuesses) : state.guesses,
			moveAmount: moves ? parseInt(moves) : state.moveAmount,
			replenishAmt: replenishAmount ? parseJSON(replenishAmount) : state.replenishAmt,
			swaps: correctGuesses ? parseJSON(correctGuesses) : state.swaps,
			usedLetters: lettersUsed ? parseJSON(lettersUsed) : state.usedLetters,
			shouldAllowReplenish: checkAlphaStateIsDiminshed(state.alphaState, data.cipherWord.split('')),
			cipherState: storedCipher ? storedCipher.split('') : state.cipherState,
			alphaState: lettersUsed
				? handleUpdateAlphaMap(
						alpha,
						lettersUsed.split('') || [],
						defaultAlphaState(alpha, state.cipherState, vowels)
					)
				: defaultAlphaState(alpha, state.cipherState, vowels)
		}));
	}

	/**
	 *
	 * @param newWord
	 * @description set puzzle word to storage
	 */
	function addTodaysPuzzleToStorage(newWord: string) {
		const [storedPuzzle] = getItemsFromStorage([StorageKeys.puzzle]);
		if (storedPuzzle !== newWord) {
			setItemsInStorage([{ key: StorageKeys.puzzle, value: newWord }]);
		}
	}

	/**
	 * @description handle toggling the tutorial modal
	 */
	function shouldShowTutorial() {
		const [hasViewedGame] = getItemsFromStorage([StorageKeys.viewed]);
		if (hasViewedGame) {
			return;
		} else {
			const updatesMap = new Map(Array.from(updatesState.keys()).map((key) => [key, true]));

			updateGameSystemStore({
				updatesState: updatesMap
			});

			updateGameUIStore({
				showTutorial: true
			});

			setItemsInStorage([{ key: StorageKeys.viewed, value: 'true' }]);
		}
	}

	/**
	 *
	 * @param playerGuesses
	 * @param cipherId
	 * @param date
	 * @description adding words players used to solve the puzzle to storage for that day's puzzle
	 */
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

	/**
	 * @description handle game state for when player solves puzzle
	 */
	async function checkForGameStatus() {
		updateGameSystemStore({
			win: true,
			gameOver: true
		});

		updateGameUIStore({
			modalOpen: true
		});

		setItemsInStorage([
			{ key: StorageKeys.gameStatus, value: 'win' },
			{ key: StorageKeys.moves, value: String(moveAmount) },
			{ key: StorageKeys.cipher, value: word }
		]);

		// add the words players used to solve the cipher to the db, on win
		cipherPlayerData = await submitPlayerUsedWords(guesses, data.id, data.date);
	}

	/**
	 * @description  render any errors & remove after set time
	 */
	function checkForErrors() {
		setTimeout(() => {
			const newErrors = [...errors];
			newErrors.pop();
			updateGameSystemStore({
				errors: newErrors.slice(0, 5)
			});
		}, 3000);
	}

	/**
	 * @description get
	 */
	function handleGetMoveToIndex() {
		return getMoveToIndex({ selected, startIndex, cipherState });
	}

	/**
	 *
	 * @param index
	 * @description  this only happens if there are duplicate letters
	 * the user can then click on the letter
	 */
	function chooseStartingIndex(index: number) {
		if (cipherState[index] === selected[0]) {
			return {
				startIndex: index,
				allowChooseIndex: false,
				indexToSwap: handleGetMoveToIndex()
			};
		}
	}

	/**
	 *
	 * @param index
	 * @description updaate game store with player choice of dupe letter index
	 */
	function handleStartingIndexUpdate(index: number) {
		if (allowChooseIndex) {
			updateGameLogicStore({
				...chooseStartingIndex(index)
			});
		}
	}

	/**
	 *
	 * @param alpha
	 * @param usedLetters
	 * @param defaultState
	 * @description based on game rules certain letters has limits,
	 * we keep state in a map to determine each letter's usage amount in a
	 */
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

	// TODO - reps still don't work perfectly
	/**
	 *
	 * @param param0 GuessReturnValues
	 */
	async function handleStateFromGuess({
		invalidGuess,
		indexToSwap,
		cipherState,
		correctPositions: positions,
		allowChooseIndex,
		guesses,
		selected,
		startIndex,
		moveAmount,
		errors,
		swaps,
		usedLetters,
		cipherStateHistory
	}: GuessReturnValues & { cipherStateHistory: string[] }) {
		let updatedCipherStateHistory = cipherStateHistory;

		if (!invalidGuess) {
			updatedCipherStateHistory =
				cipherStateHistory.length === 0
					? [data.cipherWord]
					: [...cipherStateHistory, cipherState.join('')];
		}

		correctPositions = positions;

		gameLogicStore.update((state) => {
			const updatedAlphaState = handleUpdateAlphaMap(
				alpha,
				usedLetters,
				defaultAlphaState(alpha, state.cipherState, vowels)
			);
			return {
				...state,
				guesses,
				startIndex,
				indexToSwap,
				swaps,
				shouldAllowReplenish: checkAlphaStateIsDiminshed(
					updatedAlphaState,
					data.cipherWord.split('')
				),
				selected,
				cipherState,
				allowChooseIndex,
				moveAmount,
				usedLetters,
				alphaState: updatedAlphaState
			};
		});

		gameSystemStore.update((state) => ({
			...state,
			errors,
			cipherStateHistory: updatedCipherStateHistory
		}));

		setItemsInStorage([
			{ key: StorageKeys.guesses, value: stringifyJSON(guesses) },
			{ key: StorageKeys.moves, value: stringifyJSON(moveAmount) },
			{ key: StorageKeys.cipher, value: cipherState.join('') },
			{ key: StorageKeys.usedLetters, value: stringifyJSON(usedLetters) },
			{ key: StorageKeys.swaps, value: stringifyJSON(swaps) },
			{ key: StorageKeys.cipherStateHistory, value: stringifyJSON(updatedCipherStateHistory) }
		]);
	}

	/**
	 * @description Main game loop handle player guess
	 */
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

		return handleStateFromGuess({ ...result, cipherStateHistory });
	}

	/**
	 *
	 * @param l
	 * @description handle player selection on keyboard
	 */
	function handleSelect(l: string) {
		const { selected, cipherState, startIndex } = get(gameLogicStore);
		if (gameOver) return;
		if (selected.length >= maxWordLength) return;

		const updatedState = onSelect(l, selected, cipherState, startIndex);

		updateGameLogicStore({
			selected: updatedState.selected,
			startIndex: updatedState.startIndex,
			allowChooseIndex: updatedState.allowChooseIndex,
			indexToSwap: getMoveToIndex({
				selected: updatedState.selected,
				startIndex: updatedState.startIndex,
				cipherState
			})
		});
	}

	/**
	 * @description removes letter from selected state when player deletes
	 */
	function handleRemoveLetterFromSelection() {
		gameLogicStore.update((state) => {
			const updatedSelection = removeLetterFromSelection(state.selected);

			if (updatedSelection.length === 0) {
				return {
					...state,
					...clearSelection()
				};
			}

			return {
				...state,
				selected: updatedSelection,
				indexToSwap: getMoveToIndex({
					selected: updatedSelection,
					startIndex: state.startIndex,
					cipherState: state.cipherState
				})
			};
		});
	}

	/**
	 * @description share utility for when player completes game
	 */
	async function shareResults() {
		return await shareResultsAction({
			swaps,
			moveAmount,
			replenishAmt,
			emoji: getTierByMoves(
				moveAmount,
				replenishAmt,
				swaps,
				alphaState,
				gameOver,
				data.minMoves,
				data.cipherWord.split('')
			).emoji,
			cipherId: data.id
		});
	}

	/**
	 * @description get the emoji of the player's current game state
	 */
	function getStatusEmoji() {
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
	}

	/**
	 * @description handle the state control for updates notification
	 */
	function toggleUpdatePopupAction() {
		return updateGameSystemStore({
			updatesState: toggleUpdatePopup(
				updatesState,
				updateNames.playerGuesses,
				!getUpdateMapValue(updateNames.playerGuesses, updatesState)
			)
		});
	}

	/**
	 *
	 * @param preferences
	 * @description get player preferences from settings
	 */
	function checkIfPreferenceSettingExist(preferences: PrefMap) {
		return preferences && Array.from(preferences.values()).some((val) => val.show);
	}

	/**
	 * @description handles player action for clear keyboard button
	 */
	function handleClearSelection() {
		return updateGameLogicStore({
			...clearSelection()
		});
	}

	/**
	 * @description handle player action for replenishing keys that have been used in keyboard
	 */
	function handleReplenishKeyboard() {
		gameLogicStore.update((state) => ({
			...state,
			...clearUsedLetters({ moveAmount, replenishAmt }),
			alphaState: defaultAlphaState(alpha, cipherState, vowels)
		}));

		setItemsInStorage([
			{ key: StorageKeys.moves, value: stringifyJSON(moveAmount) },
			{ key: StorageKeys.replenishAmt, value: stringifyJSON(replenishAmt) }
		]);

		removeItemsInStorage([StorageKeys.usedLetters]);
	}

	onMount(() => {
		if (word) {
			checkTodaysPuzzle();
			addTodaysPuzzleToStorage(word);
			shouldShowTutorial();

			updateGameSystemStore({
				hydrated: true,
				loading: false,
				preferences: checkStorageForPreferences(PreferenceKeys) || preferences
			});
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

		updateGameUIStore({ showLetters: false });

		tick().then(() => {
			setTimeout(() => updateGameUIStore({ showLetters: true }), 200);
		});
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
		emoji={getStatusEmoji()}
		mistakeAmount={swaps.filter((b) => !b).length}
		showPlayerGuessUpdate={getUpdateMapValue(updateNames.playerGuesses, updatesState)}
		toggleUpdatePopup={toggleUpdatePopupAction}
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
							Status <span>{getStatusEmoji()}</span>
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
				chooseStartingIndex={handleStartingIndexUpdate}
			/>

			<!-- Letter selection box -->
			<Keyboard
				{selected}
				{handleSelect}
				{alpha}
				{alphaState}
				guess={handleGuess}
				removeLetterFromSelection={handleRemoveLetterFromSelection}
			/>

			<!-- Action buttons -->
			{#if !gameOver}
				<ActionButtons
					clearSelection={handleClearSelection}
					clearUsedLetters={handleReplenishKeyboard}
					removeLetterFromSelection={handleRemoveLetterFromSelection}
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
