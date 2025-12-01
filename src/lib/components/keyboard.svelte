<script lang="ts">
	import clsx from 'clsx';

	export let usedLetters: string[];
	export let cipherState: string[];
	export let selected: string[];
	export let handleSelect: (l: string) => void;
	export let alphaState: Map<string, number>;
	export let alpha: string[];

	$: checkAlphaKeyColorIncluded = (l: string) => {
		return selected.includes(l);
	};
	$: checkAlphaKeyColorDefault = (l: string) => {
		return (
			!checkAlphaKeyColorIncluded(l) && !checkAlphaKeyColorInCipher(l) && !checkAlphaColorIsVowel(l)
		);
	};
	$: checkAlphaKeyColorInCipher = (l: string) => {
		return alphaState.get(l) === 3 && !selected.includes(l);
	};
	$: checkAlphaColorIsVowel = (l: string) => {
		return alphaState.get(l) === 2 && !selected.includes(l);
	};

	$: isAvailable = (l: string) => {
		const uses = alphaState.get(l) || 0;
		return uses > 0;
	};
</script>

<div class="flex w-full justify-center">
	<div class="flex flex-wrap items-center justify-center gap-2 md:gap-4 dark:text-black">
		{#each alpha as l}
			{#if isAvailable(l)}
				<button
					on:click={() => handleSelect(l)}
					class={clsx(
						'flex w-12 items-center justify-center rounded p-1 text-2xl uppercase transition-colors hover:cursor-pointer md:text-4xl',
						{
							'bg-amber-300': checkAlphaKeyColorIncluded(l),
							'bg-gray-100 dark:bg-gray-100/80': checkAlphaKeyColorDefault(l),
							'bg-emerald-500': checkAlphaKeyColorInCipher(l),
							'bg-orange-500': checkAlphaColorIsVowel(l)
						}
					)}>{l}</button
				>
			{:else}
				<button
					disabled
					class={clsx(
						'flex w-12 items-center justify-center rounded p-1 text-2xl  uppercase transition-colors hover:cursor-pointer md:text-4xl',
						{
							'text-gray-400/50 dark:bg-gray-100/10': !selected.includes(l),
							'bg-amber-300 text-black': selected.includes(l)
						}
					)}>{l}</button
				>
			{/if}
		{/each}
	</div>
</div>
