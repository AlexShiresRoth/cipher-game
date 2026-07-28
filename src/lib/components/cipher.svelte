<script lang="ts">
	import type { TutorialState } from '$lib/types/store';
	import CipherLetter from './cipher-letter.svelte';

	export let selected: string[];
	export let cipherState: string[];
	export let allowChooseIndex: boolean;
	export let startIndex: number;
	export let indexToSwap: number;
	export let word: string;
	export let chooseStartingIndex;
	export let tutorialState: TutorialState | undefined = undefined;
</script>

<div class="flex w-full min-w-0 gap-1 sm:gap-2">
	{#each cipherState as key, i (`${key}-${i}`)}
		<CipherLetter
			{key}
			{i}
			{selected}
			{cipherState}
			{tutorialState}
			{allowChooseIndex}
			{startIndex}
			{indexToSwap}
			{word}
			{chooseStartingIndex}
		/>
	{/each}
</div>
