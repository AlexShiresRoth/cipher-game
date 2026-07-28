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

	const rows = [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm']
	];

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

<div class="keyboard relative flex w-full flex-col items-center gap-2 dark:text-black">
	{#each rows as row, rowIndex (rowIndex)}
		<div class="keyboard-row flex w-full items-center justify-center">
			{#each row as letter (letter)}
				<KeyboardLetter {alphaState} {letter} {selected} {tutorialState} {handleSelect} />
			{/each}
		</div>
	{/each}
</div>

<style>
	.keyboard {
		--key-gap: 0.25rem;
		/* Top row has 10 keys; all rows use that size so shorter rows stay centered */
		--key-size: calc((100% - 9 * var(--key-gap)) / 10);
	}

	.keyboard-row {
		gap: var(--key-gap);
	}

	@media (min-width: 640px) {
		.keyboard {
			--key-gap: 0.5rem;
		}
	}
</style>
