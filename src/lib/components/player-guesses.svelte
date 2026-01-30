<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActionData } from '../../routes/$types';

	export let puzzleData: ActionData;
	export let guesses: string[];
	let playerGuesses: Record<string, number>[] = [];

	console.log('puzzle data', puzzleData, guesses);
	onMount(() => {
		if (puzzleData) {
			const guessMap = [];
			for (const item in puzzleData.wordsGuessed) {
				console.log('key', item, puzzleData.wordsGuessed[item]);
				guessMap.push({ [item]: puzzleData.wordsGuessed[item] });
			}
			playerGuesses = guessMap;
		}
	});
</script>

<div class="min-h-screen bg-white dark:bg-black">
	{#if playerGuesses?.length > 0}
		{#each playerGuesses as playerGuess}
			<div>{JSON.stringify(playerGuess)}</div>
		{/each}
	{/if}
</div>
