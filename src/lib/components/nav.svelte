<script lang="ts">
	import type { DayRanking } from '$lib/types';
	import { ChartNoAxesColumn, ChessQueen, Puzzle, Route } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';
	import Leaderboard from './leaderboard.svelte';
	import PlayerGuesses from './player-guesses.svelte';
	import SolutionPath from './solution-path.svelte';
	import Stats from './stats.svelte';

	export let showNavModal = false;
	export let gameOver = false;
	export let showHome = false;
	export let toggleModalOpen: (val: boolean) => void;
	export let emoji: string | undefined;
	export let moveAmount: number;
	export let mistakeAmount: number;
	export let solvableAmt: number;
	export let replenishAmt: number;
	export let solutionPath: string[];
	export let word: string;
	export let puzzleData;
	export let guesses: string[] = [];
	export let dayRankings: DayRanking[] = [];
	export let playerId: string = '';

	let showStats = false;
	let showSolution = false;
	let showCommonGuesses = false;
	let showLeaderBoard = false;
	let showMenu = !!showNavModal;

	function toggleMenu() {
		showMenu = !showMenu;
		showStats = false;
		showSolution = false;
		showCommonGuesses = false;
	}

	function hideMenu() {
		showMenu = false;
	}

	function togglePlayerGuessesModal() {
		showCommonGuesses = !showCommonGuesses;
		showSolution = false;
		showNavModal = false;
		showStats = false;
		showLeaderBoard = false;
	}

	function toggleSolutionModal() {
		showSolution = !showSolution;
		showStats = false;
		showNavModal = false;
		showCommonGuesses = false;
		showLeaderBoard = false;
	}

	function toggleStatsModal() {
		showStats = !showStats;
		showNavModal = false;
		showSolution = false;
		showCommonGuesses = false;
		showLeaderBoard = false;
	}

	function toggleLeaderboardModal() {
		showStats = false;
		showNavModal = false;
		showSolution = false;
		showCommonGuesses = false;
		showLeaderBoard = !showLeaderBoard;
	}

	$: (() => {
		(showStats, showSolution, showCommonGuesses, showLeaderBoard);

		if (typeof window !== 'undefined') {
			if ((showSolution || showStats || showCommonGuesses, showLeaderBoard)) {
				document.body.style.overflow = 'hidden';
			} else if (!showSolution && !showStats && !showCommonGuesses) {
				document.body.style.overflow = 'visible';
			}
		}
	})();
</script>

<nav class="relative flex w-full">
	<div
		class="z-20 flex w-full justify-between border-b border-b-black bg-white dark:border-b-white/50 dark:bg-black"
	>
		<div class="flex w-full items-center justify-start border-r px-4 dark:border-white/50">
			<a href="/" class="text-xl font-bold uppercase dark:text-white">CIPHER</a>
		</div>
		<div
			class="relative flex w-full items-center justify-end gap-2"
			on:mouseleave={hideMenu}
			role="button"
			tabindex="0"
		>
			{#if !showHome}
				<div class="relative flex items-center justify-center gap-2">
					<button
						disabled={!gameOver}
						on:click={toggleLeaderboardModal}
						class={clsx('transition-colors hover:cursor-pointer', {
							'text-orange-400': showLeaderBoard,
							'text-gray-400/50 dark:text-gray-100/50': !gameOver && !showLeaderBoard
						})}><ChessQueen size={14} /></button
					>
					<div class="relative flex flex-col items-center">
						<button
							disabled={!gameOver}
							on:click={togglePlayerGuessesModal}
							class={clsx('transition-colors hover:cursor-pointer', {
								'text-indigo-500': showCommonGuesses,
								'text-gray-400/50 dark:text-gray-100/50': !gameOver && !showCommonGuesses
							})}><Puzzle size={14} /></button
						>
					</div>

					<button
						disabled={!gameOver}
						class={clsx('transition-colors hover:cursor-pointer', {
							'text-emerald-500': showSolution,
							'text-gray-400/50 dark:text-gray-100/50': !gameOver && !showSolution
						})}
						on:click={toggleSolutionModal}
					>
						<Route size={14} />
					</button>
					<button
						on:click={toggleStatsModal}
						class={clsx('relative hover:cursor-pointer', {
							'text-amber-300': showStats
						})}
					>
						<ChartNoAxesColumn size={14} />
					</button>
				</div>
			{/if}
			<button
				on:click={toggleMenu}
				class="bg-black px-4 py-2 text-white uppercase transition-colors hover:cursor-pointer hover:bg-black/80"
				>menu</button
			>
			{#if showMenu}
				<div
					class="absolute top-full right-0 -z-10 flex w-full max-w-36 flex-col items-start bg-black text-sm text-white uppercase"
				>
					{#if showHome}
						<a
							href="/"
							class="w-full px-2 py-1 hover:cursor-pointer hover:text-amber-500 hover:underline"
							>home</a
						>
					{/if}
					<a
						href="/tutorial"
						class="w-full border-t border-t-white/40 px-2 py-1 hover:cursor-pointer hover:text-amber-500 hover:underline"
						>tutorial</a
					>
					<a
						href="/how-to"
						class="w-full border-t border-t-white/40 px-2 py-1 hover:cursor-pointer hover:text-amber-500 hover:underline"
						>how to play</a
					>

					<a
						href="/preferences"
						class="w-full border-t border-t-white/40 px-2 py-1 hover:cursor-pointer hover:text-amber-500 hover:underline"
						>preferences</a
					>

					{#if gameOver}
						<button
							class="w-full border-t border-t-white/40 px-2 py-1 text-left uppercase hover:cursor-pointer hover:text-amber-500 hover:underline"
							on:click={() => {
								toggleModalOpen(true);
							}}>share</button
						>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	{#if showStats}
		<div
			class="fixed top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 overflow-scroll bg-white p-4 py-16 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<div class="w-full md:w-1/2">
				<h2 class="text-3xl uppercase">Stats</h2>
				<Stats {emoji} {moveAmount} {mistakeAmount} {solvableAmt} {replenishAmt} />
			</div>
		</div>
	{/if}
	{#if showSolution}
		<div
			class="fixed top-0 z-10 flex h-full w-full flex-col items-center gap-2 overflow-scroll bg-white p-4 py-16 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<div class="w-full md:w-1/2">
				<h2 class="text-3xl uppercase">Solution Example</h2>
				<p class="font-regular mb-2 text-sm dark:text-gray-300">
					There are many ways to solve this puzzle, here is one way.
				</p>
				<SolutionPath {solutionPath} {word} guesses={[]} />
			</div>
		</div>
	{/if}
	{#if showCommonGuesses && puzzleData}
		<div
			class="fixed top-0 z-10 flex h-full w-full flex-col items-center gap-2 overflow-scroll bg-white p-4 py-16 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<div class="w-full md:w-1/2">
				<h2 class="text-xl">These are the words players used to solve the Cipher.</h2>
				<p class="text-sm text-gray-400 dark:text-white/80">
					The highlighted ones are the words you used.
				</p>
				<PlayerGuesses {puzzleData} {guesses} cipherWord={word} />
			</div>
		</div>
	{/if}
	{#if showLeaderBoard && dayRankings.length > 0}
		<div
			class="fixed top-0 z-10 flex h-full w-full flex-col items-center gap-2 overflow-scroll bg-white p-4 py-16 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<Leaderboard {dayRankings} {playerId} />
		</div>
	{/if}
</nav>
