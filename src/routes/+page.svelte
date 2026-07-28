<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		alpha,
		checkAlphaStateIsDiminshed,
		checkStorageForPreferences,
		clearSelection,
		clearUsedLetters,
		compliments,
		createTutorialSteps,
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
		vowels,
		type DayRanking,
		type GuessReturnValues,
		type PrefMap,
		type PuzzleGuessesResponse,
		type Tier
	} from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import FlyInButton from '$lib/components/fly-in-button.svelte';
	import GameOverModal from '$lib/components/game-over-modal.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Nav from '$lib/components/nav.svelte';
	import Selection from '$lib/components/selection.svelte';
	import SolutionPath from '$lib/components/solution-path.svelte';
	import StartModal from '$lib/components/start-modal.svelte';
	import TutorialPopup from '$lib/components/tutorial-popup.svelte';
	import { defaultUpdatesState, updateNames } from '$lib/logic/updates';
	import type {
		GameLogicState,
		GameSystemState,
		GameUIState,
		TutorialState
	} from '$lib/types/store';
	import clsx from 'clsx';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { get, writable } from 'svelte/store';
	import type { CipherPuzzle } from '../types';

	/*** Init Vars from page server ***/
	export let data: CipherPuzzle & { id: number } & {
		cipherPlayerData: PuzzleGuessesResponse;
		playerId: string;
		dayRankings: DayRanking[];
	};

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Cipher',
		url: 'https://play-cipher.com/',
		description:
			'Play Cipher, the daily interactive word-shuffle puzzle game. Decipher the shuffled word using clever moves, swapping mechanics, and logic-based strategy.',
		applicationCategory: 'GameApplication',
		operatingSystem: 'Any',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		}
	};

	let playerId = data.playerId;
	let word = data.word;
	let cipher = data.cipherWord;
	let cipherPlayerData = data.cipherPlayerData;
	let dayRankings = data.dayRankings;
	const winGameKey = 'win';
	const initAlphaState = defaultAlphaState(alpha, cipher.split(''), vowels);
	const defaultGameLogic: GameLogicState = {
		isGameStarted: false,
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
		alphaState: initAlphaState,
		tier: getTierByMoves(0, 0, [], initAlphaState, false, data.minMoves, data.cipherWord.split(''))
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
		preferences: new Map(),
		complimentIndex: -1
	};

	const defaultTutorialState: TutorialState = {
		isTutorialMode: false,
		currentStep: 0
	};

	const gameLogicStore = writable<GameLogicState>(defaultGameLogic);
	const gameUIStore = writable<GameUIState>(defaultUIState);
	const gameSystemStore = writable<GameSystemState>(defaultGameSystemState);
	const tutorialStore = writable<TutorialState>(defaultTutorialState);

	$: game = $gameLogicStore;
	$: ui = $gameUIStore;
	$: system = $gameSystemStore;
	$: tutorial = $tutorialStore;

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
	 * @description toggle the nav modal open and close state
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
			gameStatus,
			tutorialMode,
			tutorialStep
		] = getItemsFromStorage([
			StorageKeys.guesses,
			StorageKeys.moves,
			StorageKeys.puzzle,
			StorageKeys.cipher,
			StorageKeys.usedLetters,
			StorageKeys.swaps,
			StorageKeys.replenishAmt,
			StorageKeys.cipherStateHistory,
			StorageKeys.gameStatus,
			StorageKeys.tutorialMode,
			StorageKeys.tutorialStep
		]);

		if (puzzle !== word) {
			resetGame();
			return;
		}

		const winGame = gameStatus === winGameKey;

		updateGameUIStore({
			modalOpen: winGame
		});

		if (tutorialMode) {
			tutorialStore.update((state) => ({
				...state,
				isTutorialMode: tutorialMode === 'true',
				currentStep: tutorialStep ? parseInt(tutorialStep) : state.currentStep
			}));
		}

		gameSystemStore.update((state) => ({
			...state,
			cipherStateHistory: cipherStateHistoryStored
				? parseJSON(cipherStateHistoryStored)
				: system.cipherStateHistory,
			win: winGame,
			gameOver: winGame
		}));

		gameLogicStore.update((state) => {
			const updatedAlphaState = lettersUsed
				? handleUpdateAlphaMap(
						alpha,
						lettersUsed.split('') || [],
						defaultAlphaState(alpha, state.cipherState, vowels)
					)
				: defaultAlphaState(alpha, state.cipherState, vowels);

			const moveAmount = moves ? parseInt(moves) : state.moveAmount;
			const repAmt = replenishAmount ? parseJSON(replenishAmount) : state.replenishAmt;
			const swaps = correctGuesses ? parseJSON(correctGuesses) : state.swaps;
			const tier = getTierByMoves(
				moveAmount,
				repAmt,
				swaps,
				updatedAlphaState,
				winGame,
				data.minMoves,
				data.cipherWord.split('')
			);

			return {
				...state,
				guesses: savedGuesses ? parseJSON(savedGuesses) : state.guesses,
				moveAmount,
				replenishAmt: repAmt,
				swaps,
				usedLetters: lettersUsed ? parseJSON(lettersUsed) : state.usedLetters,
				shouldAllowReplenish: checkAlphaStateIsDiminshed(
					updatedAlphaState,
					data.cipherWord.split('')
				),
				cipherState: storedCipher ? storedCipher.split('') : state.cipherState,
				alphaState: updatedAlphaState,
				tier
			};
		});
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
			const updatesMap = new Map(Array.from(system.updatesState.keys()).map((key) => [key, true]));

			updateGameSystemStore({
				updatesState: updatesMap
			});

			updateGameUIStore({
				showTutorial: true
			});
		}
	}

	/**
	 *
	 * @param playerGuesses
	 * @param cipherId
	 * @param date
	 * @description adding words players used to solve the puzzle to storage for that day's puzzle
	 * This only adds words once per player id
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
	 *
	 * @param cipherId
	 * @param playerName
	 * @param moveAmount
	 * @param minMoves
	 * @description on game over add player ranking to db for leaderboards
	 */
	async function submitPlayerRanking(cipherId: string, playerId: string, tier: Tier) {
		const res = await fetch('api/submit-ranking', {
			method: 'POST',
			body: JSON.stringify({ cipherId, tier })
		});

		return await res.json();
	}

	/**
	 * @description  render any errors & remove after set time
	 */
	function checkForErrors() {
		setTimeout(() => {
			const newErrors = [...system.errors];
			newErrors.pop();
			updateGameSystemStore({
				errors: newErrors.slice(0, 5)
			});
		}, 3000);
	}

	/**
	 * @description get index of what the letter will be swapped at
	 */
	function handleGetMoveToIndex(index?: number) {
		return getMoveToIndex({
			selected: game.selected,
			startIndex: index == null ? game.startIndex : index,
			cipherState: game.cipherState
		});
	}

	/**
	 *
	 * @param index
	 * @description  this only happens if there are duplicate letters
	 * the user can then click on the letter
	 */
	function chooseStartingIndex(index: number) {
		if (game.cipherState[index] === game.selected[0]) {
			return {
				startIndex: index,
				allowChooseIndex: false,
				indexToSwap: handleGetMoveToIndex(index)
			};
		}
	}

	/**
	 *
	 * @param index
	 * @description updaate game store with player choice of dupe letter index
	 */
	function handleStartingIndexUpdate(index: number) {
		if (game.allowChooseIndex) {
			gameLogicStore.update((state) => ({
				...state,
				...chooseStartingIndex(index) // need to provide a synced index because the game.startIndex could be behind player action
			}));
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
		const isGameOver = cipherState.join('') === data.word;

		gameLogicStore.update((state) => {
			const updatedAlphaState = handleUpdateAlphaMap(
				alpha,
				usedLetters,
				defaultAlphaState(alpha, state.cipherState, vowels)
			);

			const tier = getTierByMoves(
				moveAmount,
				game.replenishAmt,
				swaps,
				updatedAlphaState,
				isGameOver,
				data.minMoves,
				data.cipherWord.split('')
			);

			// logic storage items
			setItemsInStorage([
				{ key: StorageKeys.guesses, value: stringifyJSON(guesses) },
				{ key: StorageKeys.moves, value: stringifyJSON(moveAmount) },
				{ key: StorageKeys.cipher, value: cipherState.join('') },
				{ key: StorageKeys.usedLetters, value: stringifyJSON(usedLetters) },
				{ key: StorageKeys.swaps, value: stringifyJSON(swaps) },
				{ key: StorageKeys.gameStatus, value: isGameOver ? winGameKey : 'playing' } // doesn't really matter what the word is as long as it's not 'win' until it's over
			]);

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
				alphaState: updatedAlphaState,
				tier
			};
		});

		gameSystemStore.update((state) => {
			const updatedCipherStateHistory =
				cipherStateHistory.length === 0
					? [data.cipherWord]
					: !invalidGuess
						? [...cipherStateHistory, cipherState.join('')]
						: state.cipherStateHistory;

			// system storage items
			setItemsInStorage([
				{ key: StorageKeys.cipherStateHistory, value: stringifyJSON(updatedCipherStateHistory) }
			]);

			const shouldCompliment = positions - correctPositions > 1;

			const complimentIndex = Math.floor(Math.random() * compliments.length);

			return {
				...state,
				errors,
				cipherStateHistory: updatedCipherStateHistory,
				win: isGameOver,
				gameOver: isGameOver,
				complimentIndex: shouldCompliment ? complimentIndex : -1
			};
		});

		// update tutorial step to sync with game state
		if (tutorial.isTutorialMode && !invalidGuess) {
			tutorialStore.update((state) => {
				// exit tutorial if player is not following the tutorial
				const isFollowingTutorial =
					data.solutionPath[state.currentStep + 1] === cipherState.join('');

				const isTutorialMode = isGameOver || !isFollowingTutorial ? false : state.isTutorialMode;

				if (!isTutorialMode) {
					removeItemsInStorage([StorageKeys.tutorialMode, StorageKeys.tutorialStep]);
				}

				return {
					...state,
					currentStep: state.currentStep + 1,
					isTutorialMode
				};
			});

			setItemsInStorage([{ key: StorageKeys.tutorialStep, value: `${tutorial.currentStep + 1}` }]);
		}

		if (isGameOver) {
			// show the win modal
			updateGameUIStore({
				modalOpen: true
			});

			try {
				const { tier } = get(gameLogicStore);
				// add the words players used to solve the cipher to the db, on win
				cipherPlayerData = await submitPlayerUsedWords(guesses, data.id, data.date);
				// add player ranking to db for leaderboards
				dayRankings = await submitPlayerRanking(data.id, playerId, tier);
				// TODO - does this work for ninja?
			} catch (error) {
				// we can let this fail silently since it doesn't affect gameplay, but log it for debugging and monitoring purposes
				console.error('Error submitting player data:', error);
			}
		}
	}

	/**
	 * @description Main game loop handle player guess
	 */
	async function handleGuess() {
		if (game.selected.length === 0) {
			return;
		}

		const result = await guess({
			errors: system.errors,
			swaps: game.swaps,
			selected: game.selected,
			startIndex: game.startIndex,
			moveAmount: game.moveAmount,
			usedLetters: game.usedLetters,
			cipherState: game.cipherState,
			getMoveToIndex: handleGetMoveToIndex,
			guesses: game.guesses,
			word,
			correctPositions
		});

		return handleStateFromGuess({ ...result, cipherStateHistory: system.cipherStateHistory });
	}

	/**
	 *
	 * @param l
	 * @description handle player selection on keyboard
	 */
	function handleSelect(l: string) {
		const { selected, cipherState, startIndex } = get(gameLogicStore);
		if (system.gameOver) return;
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
			swaps: game.swaps,
			moveAmount: game.moveAmount,
			replenishAmt: game.replenishAmt,
			emoji: game.tier.emoji,
			cipherId: data.id
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
		gameLogicStore.update((state) => {
			const { replenishAmt, shouldAllowReplenish, moveAmount, usedLetters } = clearUsedLetters({
				moveAmount: state.moveAmount,
				replenishAmt: state.replenishAmt
			});

			setItemsInStorage([
				{ key: StorageKeys.moves, value: stringifyJSON(moveAmount) },
				{ key: StorageKeys.replenishAmt, value: stringifyJSON(replenishAmt) }
			]);

			removeItemsInStorage([StorageKeys.usedLetters]);

			return {
				...state,
				replenishAmt,
				shouldAllowReplenish,
				moveAmount,
				usedLetters,
				alphaState: defaultAlphaState(alpha, game.cipherState, vowels)
			};
		});
	}

	/**
	 * @description toggles player's solution in UI
	 */
	function toggleMySolutionInUI() {
		updateGameUIStore({
			showMySolution: !ui.showMySolution
		});
		window.scrollTo({
			behavior: 'smooth',
			top: 0
		});
	}

	/**
	 * @description starts the game and hides the tutorial modal
	 */
	function startGame() {
		updateGameLogicStore({
			isGameStarted: true
		});
		updateGameUIStore({
			showTutorial: false
		});

		setItemsInStorage([{ key: StorageKeys.viewed, value: 'true' }]);
	}

	/**
	 * @description starts the tutorial and hides the tutorial modal
	 */
	function startTutorial() {
		tutorialStore.update((state) => ({
			...state,
			isTutorialMode: true
		}));
		updateGameUIStore({
			showTutorial: false
		});
		updateGameLogicStore({
			isGameStarted: true
		});

		setItemsInStorage([
			{ key: StorageKeys.tutorialMode, value: 'true' },
			{ key: StorageKeys.viewed, value: 'true' },
			{ key: StorageKeys.tutorialStep, value: `${tutorial.currentStep}` }
		]);
	}

	/**
	 * @description take the solution path and create steps for the tutorial
	 */
	function loadTutorialState() {
		const n = data.word.length;

		const steps = createTutorialSteps(data.solutionPath, n);

		tutorialStore.update((state) => ({
			...state,
			steps
		}));
	}

	/**
	 * @description exits the tutorial and removes tutorial mode and step from local storage
	 */
	function exitTutorial() {
		tutorialStore.update((state) => ({
			...state,
			isTutorialMode: false
		}));

		removeItemsInStorage([StorageKeys.tutorialMode, StorageKeys.tutorialStep]);
	}

	onMount(() => {
		if (word) {
			checkTodaysPuzzle();
			addTodaysPuzzleToStorage(word);
			shouldShowTutorial();
			loadTutorialState();
			updateGameSystemStore({
				hydrated: true,
				loading: false,
				preferences: checkStorageForPreferences(PreferenceKeys) || system.preferences
			});
		}
	});

	$: if (system.errors.length > 0) {
		checkForErrors();
	}

	$: if (system.complimentIndex >= 0) {
		setTimeout(() => {
			updateGameSystemStore({
				complimentIndex: -1
			});
		}, 2000);
	}

	$: (() => {
		// this is an intentional dependency to trigger the update of the showLetters state
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		ui.modalOpen;

		if (typeof window === 'undefined') return;

		updateGameUIStore({ showLetters: false });

		tick().then(() => {
			setTimeout(() => updateGameUIStore({ showLetters: true }), 200);
		});
	})();
</script>

<svelte:head>
	<title>Play CIPHER #{data.id || 'Uh oh :('} - Daily Word-Shuffle Puzzle</title>
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
	<meta property="og:url" content="https://play-cipher.com/" />
	<meta
		name="twitter:title"
		content={`CIPHER #${data.id || 'Uh oh :('} – Daily Word-Shuffle Puzzle`}
	/>
	<meta
		name="twitter:description"
		content="Decipher shuffled words and challenge yourself with the daily brain-teaser."
	/>
	<link rel="canonical" href="https://play-cipher.com/" />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`}
</svelte:head>

{#if system.internalError}
	<div class="flex min-h-screen w-full flex-col items-center justify-center"><p>Uh oh</p></div>
{/if}

{#if ui.showTutorial && !game.isGameStarted}
	<StartModal {data} {startGame} {startTutorial} />
{/if}

<div
	class:hidden={!system.hydrated && system.loading}
	class="flex h-dvh w-full flex-col items-center overflow-hidden"
>
	<div class="w-full shrink-0">
		<Nav
			{word}
			solutionPath={data.solutionPath}
			gameOver={system.gameOver}
			showNavModal={ui.showNavModal}
			{toggleModalOpen}
			replenishAmt={game.replenishAmt}
			moveAmount={game.moveAmount}
			guesses={game.guesses}
			solvableAmt={data.minMoves}
			puzzleData={cipherPlayerData}
			emoji={game.tier.emoji}
			mistakeAmount={game.swaps.filter((b) => !b).length}
			{dayRankings}
			{playerId}
		/>
	</div>

	<!-- Tutorial popup for tutorial mode -->
	{#if tutorial.isTutorialMode}
		<TutorialPopup tutorialState={tutorial} {exitTutorial} />
	{/if}

	<!-- GAME OVER STATE -->
	{#if system.gameOver && ui.modalOpen}
		<!-- Game over share modal -->
		<GameOverModal
			{word}
			{shareResults}
			showLetters={ui.showLetters}
			tier={game.tier}
			{toggleModalOpen}
			solvableAmt={data.minMoves}
			replenishAmt={game.replenishAmt}
			moveAmount={game.moveAmount}
			mistakeAmount={game.swaps.filter((b) => !b).length}
		/>
	{/if}

	<!-- PLAY STATE UI-->
	<div class="absolute top-12 flex flex-col gap-2">
		{#each system.errors.slice(0, 5) as error, i (`${error}-${i}`)}
			<FlyInButton content={error} />
		{/each}
	</div>

	<div class="absolute top-14 flex w-full flex-col items-center gap-2">
		{#if system.complimentIndex >= 0}
			<FlyInButton content={compliments[system.complimentIndex] || '😃'} />
		{/if}
	</div>

	<!-- Top: prefs/selection/cipher. Bottom: keyboard/buttons (always fully visible). -->
	<div
		class="grid min-h-0 w-11/12 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden md:w-2/3 lg:w-1/2"
	>
		<div class="flex min-h-0 flex-col overflow-y-auto">
			{#if checkIfPreferenceSettingExist(system.preferences)}
				<div class="my-4 flex w-full shrink-0 flex-wrap justify-between gap-4 text-sm">
					{#if system.preferences.get(PreferenceKeys.showRank)?.show}
						<div class="flex items-center gap-1">
							<p>
								Status <span>{game.tier.emoji}</span>
							</p>
						</div>
					{/if}
					{#if system.preferences.get(PreferenceKeys.showMistakes)?.show}
						<div class="flex items-center gap-1">
							<p>Mistakes <span>{game.swaps.filter((b) => !b).length}</span></p>
						</div>
					{/if}
					{#if system.preferences.get(PreferenceKeys.showMoves)?.show}
						<div class="flex items-center gap-1"><p>Moves <span>{game.moveAmount}</span></p></div>
					{/if}
					{#if system.preferences.get(PreferenceKeys.showReps)?.show}
						<div class="flex items-center gap-1"><p>Reps <span>{game.replenishAmt}</span></p></div>
					{/if}
					{#if system.preferences.get(PreferenceKeys.showSolvable)?.show}
						<div class="flex items-center gap-1"><p>Solvable <span>{data.minMoves}</span></p></div>
					{/if}
				</div>
			{/if}

			{#if ui.showMySolution && system.gameOver}
				<div class="flex w-full flex-col">
					<div class="w-full pt-4">
						<h2 class="text-3xl uppercase">My Solution</h2>
					</div>
					<SolutionPath {word} solutionPath={system.cipherStateHistory} guesses={game.guesses} />
				</div>
			{/if}

			{#if !ui.showMySolution}
				<div class="flex min-h-0 w-full flex-1 flex-col items-stretch justify-center">
					<Selection
						isTutorialMode={tutorial.isTutorialMode}
						selected={game.selected}
						shouldHaveMargin={!checkIfPreferenceSettingExist(system.preferences)}
					/>
					<Cipher
						{word}
						tutorialState={tutorial}
						cipherState={game.cipherState}
						allowChooseIndex={game.allowChooseIndex}
						selected={game.selected}
						startIndex={game.startIndex}
						indexToSwap={game.indexToSwap}
						chooseStartingIndex={handleStartingIndexUpdate}
					/>
				</div>
			{/if}
		</div>

		<div class="flex w-full shrink-0 flex-col items-stretch gap-4 pb-12">
			{#if !ui.showMySolution}
				<Keyboard
					selected={game.selected}
					{handleSelect}
					{alpha}
					alphaState={game.alphaState}
					guess={handleGuess}
					removeLetterFromSelection={handleRemoveLetterFromSelection}
					tutorialState={tutorial}
				/>
				{#if !system.gameOver}
					<ActionButtons
						clearSelection={handleClearSelection}
						clearUsedLetters={handleReplenishKeyboard}
						removeLetterFromSelection={handleRemoveLetterFromSelection}
						guess={handleGuess}
						selected={game.selected}
						shouldAllowReplenish={game.shouldAllowReplenish}
					/>
				{/if}
			{/if}

			{#if system.gameOver}
				<div class="flex items-center justify-center gap-2 py-4">
					<button
						on:click={toggleMySolutionInUI}
						class={clsx('rounded px-4 py-2 uppercase dark:text-black', {
							'bg-black text-white dark:bg-emerald-500': ui.showMySolution,
							'bg-black text-white dark:bg-indigo-500': !ui.showMySolution
						})}>{ui.showMySolution ? 'View Game' : 'View solution'}</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<div class:hidden={system.hydrated && !system.loading}>
	<div class="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
		<img src="/logo.svg" alt="Cipher word puzzle logo" height="300" width="300" />
		<h1 class="text-5xl font-bold uppercase">Cipher</h1>
		<p class="max-w-md opacity-80">
			Decipher the shuffled word. Play the daily word-shuffle puzzle and solve Cipher #{data.id ||
				''}.
		</p>
		<p class="text-sm opacity-60">
			New to the game?
			<a class="underline" href={resolve('/how-to')}>Learn how to play</a>
			or try the
			<a class="underline" href={resolve('/tutorial')}>interactive tutorial</a>.
		</p>
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
