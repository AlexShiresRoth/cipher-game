<script lang="ts">
	import { ChartNoAxesColumn } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
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

	$: showStats = false;
</script>

<nav class="relative flex w-full justify-between border-b border-b-black dark:border-b-white/50">
	<div class="flex w-full items-center justify-start border-r px-4 dark:border-white/50">
		<a href="/" class="text-xl font-bold uppercase dark:text-white">CIPHER</a>
	</div>
	<div
		class="relative flex w-full items-center justify-end gap-4"
		on:mouseleave={() => {
			showNavModal = false;
		}}
		role="button"
		tabindex="0"
	>
		{#if !showHome}
			<button on:click={() => (showStats = !showStats)}>
				<ChartNoAxesColumn />
			</button>
		{/if}
		<button
			on:click={() => {
				showNavModal = !showNavModal;
				showStats = false;
			}}
			class="bg-black px-4 py-2 text-white uppercase transition-colors hover:cursor-pointer hover:bg-black/80"
			>{'menu'}</button
		>
		{#if showNavModal}
			<div
				class="absolute top-full right-0 z-10 flex w-full max-w-36 flex-col items-start bg-black text-sm text-white uppercase"
			>
				{#if showHome}
					<a href="/" class="w-full px-2 py-1">home</a>
				{/if}

				<a href="/how-to" class="w-full px-2 py-1">how to play</a>

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
	{#if showStats}
		<div
			class="absolute top-full z-10 mt-1 flex h-screen w-full flex-col justify-center bg-white p-4 dark:bg-black"
			transition:fly={{ y: -100 }}
		>
			<h2 class="text-3xl uppercase">Stats</h2>
			<Stats {emoji} {moveAmount} {mistakeAmount} {solvableAmt} {replenishAmt} />
		</div>
	{/if}
</nav>
