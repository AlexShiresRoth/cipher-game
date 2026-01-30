<script lang="ts">
	import { enhance } from '$app/forms';
	import { ChartNoAxesColumn, Puzzle, Route } from '@lucide/svelte';
	import clsx from 'clsx';
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { ActionData } from '../../routes/$types';
	import type { CipherPuzzle } from '../../types';
	import PlayerGuesses from './player-guesses.svelte';
	import SolutionPath from './solution-path.svelte';
	import Stats from './stats.svelte';
	import UpdatePopup from './update-popup.svelte';

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
	export let showPlayerGuessUpdate: boolean;
	export let toggleUpdatePopup;
	export let guesses: string[] = [];
	export let cipherData: CipherPuzzle & { id: string };

	$: showStats = false;
	$: showSolution = false;
	$: showCommonGuesses = false;
	$: puzzleData = null as ActionData;

	onMount(() => {
		window.addEventListener('resize', () => {
			showSolution = false;
		});
	});
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
			on:mouseleave={() => {
				showNavModal = false;
			}}
			role="button"
			tabindex="0"
		>
			{#if !showHome}
				<div class="relative flex items-center justify-center gap-2">
					{#if !showCommonGuesses}
						<div class="relative flex flex-col items-center">
							<form
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											const data = result.data as ActionData;
											showSolution = false;
											showNavModal = false;
											showStats = false;
											puzzleData = data;
											await tick();
											showCommonGuesses = true;
										}
									};
								}}
								method="POST"
								action="?/checkPuzzleGuesses"
								class="relative flex items-center"
							>
								<input
									defaultValue={JSON.stringify({
										guesses,
										cipherId: cipherData.id,
										date: cipherData.date
									})}
									readonly
									name="puzzleData"
									class="hidden"
								/>
								<button
									disabled={!gameOver}
									class={clsx('transition-colors hover:cursor-pointer', {
										'text-indigo-500': showCommonGuesses,
										'text-gray-100/50': !gameOver && !showCommonGuesses,
										'text-amber-500': showPlayerGuessUpdate,
										'text-gray-300 dark:text-gray-100/50': !gameOver && !showPlayerGuessUpdate
									})}><Puzzle size={16} /></button
								>
							</form>
							{#if showPlayerGuessUpdate}
								<UpdatePopup alignCarat="top-middle" {toggleUpdatePopup} alignClasses="top-[150%]"
									><p class="text-xs dark:text-white">
										<strong class="text-amber-500">UPDATE</strong>: {` `} You can now view the words
										other players used to solve today’s Cipher.
									</p></UpdatePopup
								>
							{/if}
						</div>
					{:else}
						<button
							disabled={!gameOver}
							on:click={() => (showCommonGuesses = false)}
							class={clsx('transition-colors hover:cursor-pointer', {
								'text-indigo-500': showCommonGuesses,
								'text-gray-100/50': !gameOver && !showCommonGuesses
							})}><Puzzle size={16} /></button
						>
					{/if}
					<button
						disabled={!gameOver}
						class={clsx('transition-colors hover:cursor-pointer', {
							'text-emerald-500': showSolution
						})}
						on:click={() => (
							(showSolution = !showSolution),
							(showStats = false),
							(showNavModal = false),
							(showCommonGuesses = false)
						)}
					>
						<Route size={16} />
					</button>
					<button
						on:click={() => (
							(showStats = !showStats),
							(showNavModal = false),
							(showSolution = false),
							(showCommonGuesses = false)
						)}
						class={clsx('relative hover:cursor-pointer', {
							'text-amber-300': showStats
						})}
					>
						<ChartNoAxesColumn size={16} />
					</button>
				</div>
			{/if}
			<button
				on:click={() => {
					showNavModal = !showNavModal;
					showStats = false;
					showSolution = false;
				}}
				class="bg-black px-4 py-2 text-white uppercase transition-colors hover:cursor-pointer hover:bg-black/80"
				>{'menu'}</button
			>
			{#if showNavModal}
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
							class="w-full border-t border-t-white/40 px-2 py-1 text-left uppercase"
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
			class="absolute top-full z-10 mt-1 flex h-screen w-full flex-col justify-center bg-white p-4 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<h2 class="text-3xl uppercase">Stats</h2>
			<Stats {emoji} {moveAmount} {mistakeAmount} {solvableAmt} {replenishAmt} />
		</div>
	{/if}
	{#if showSolution}
		<div
			class="absolute top-full z-10 mt-1 flex w-full flex-col bg-white p-4 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<h2 class="text-3xl uppercase">Solution Example</h2>
			<p class="font-regular mb-2 text-sm dark:text-gray-300">
				There are many ways to solve this puzzle, here is one way.
			</p>
			<SolutionPath {solutionPath} {word} />
		</div>
	{/if}
	{#if showCommonGuesses && puzzleData}
		<div
			class="absolute top-full z-10 mt-1 flex w-full flex-col gap-2 bg-white p-4 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<h2 class="text-xl">These are the words players used to solve the Cipher.</h2>
			<p class="text-sm text-gray-400 dark:text-white/80">
				The highlighted ones are the words you used.
			</p>
			<PlayerGuesses {puzzleData} {guesses} cipherWord={word} />
		</div>
	{/if}
</nav>
