<script lang="ts">
	import type { TutorialState } from '$lib/types/store';
	import { onMount } from 'svelte';
	import KeyboardLetter from './keyboard-letter.svelte';

	export let selected: string[];
	export let handleSelect: (l: string) => void;
	export let alphaState: Map<string, number>;
	export let alpha: string[];
	export let removeLetterFromSelection: () => void;
	export let guess;
	export let tutorialState: TutorialState | undefined = undefined;

	function isAvailable(l: string) {
		const uses = alphaState.get(l) || 0;
		return uses > 0;
	}

	onMount(() => {
		window.addEventListener('keyup', (e) => {
			if (alpha.includes(e.key) && isAvailable(e.key)) {
				handleSelect(e.key);
			}
			if (e.key === 'Backspace') {
				removeLetterFromSelection();
			}
			if (e.key === 'Enter') {
				guess();
			}
		});
	});
</script>

<div class="relative flex w-full justify-center">
	<div class="flex flex-wrap items-center justify-center gap-2 dark:text-black">
		{#each alpha as letter, i (letter + i)}
			<KeyboardLetter {alphaState} {letter} {selected} {tutorialState} {handleSelect} />
		{/each}
	</div>
</div>
