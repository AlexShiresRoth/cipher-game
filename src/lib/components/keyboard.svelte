<script lang="ts">
	import clsx from 'clsx';

	export let cipherState: string[];
	export let selected: string[];
	export let handleSelect: (l: string) => void;
	export let alphaState: Map<string, number>;
	export let alpha: string[];

	$: checkAlphaKeyColorIncluded = (l: string) => {
		return selected.includes(l);
	};
	$: checkAlphaKeyColorDefault = (l: string) => {
		return !checkAlphaColorIsUsable(l);
	};
	$: checkAlphaKeyColorInCipher = (l: string) => {
		return cipherState.includes(l) && !selected.includes(l);
	};
	$: checkAlphaColorIsVowel = (l: string) => {
		return 'aeiouy'.includes(l) && !selected.includes(l);
	};
	$: checkAlphaColorIsUsable = (l: string) => {
		return checkAlphaColorIsVowel(l) || checkAlphaKeyColorInCipher(l);
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
						'flex w-12 flex-col items-center justify-center rounded p-1 text-2xl uppercase transition-colors hover:cursor-pointer md:text-4xl ',
						{
							'bg-gray-100 dark:bg-gray-100/80': !checkAlphaKeyColorIncluded(l),
							'bg-amber-300': checkAlphaKeyColorIncluded(l)
						}
					)}
					><p>{l}</p>
					<span
						class={clsx('text-xs', {
							'text-orange-500': checkAlphaColorIsUsable(l) && alphaState.get(l) === 3,
							'text-orange-400': checkAlphaColorIsUsable(l) && alphaState.get(l) === 2,
							'text-orange-300': checkAlphaColorIsUsable(l) && alphaState.get(l) === 1
						})}>{alphaState.get(l)}</span
					></button
				>
			{:else}
				<button
					disabled
					class={clsx(
						'flex w-12 flex-col items-center justify-center rounded p-1 text-2xl  uppercase transition-colors hover:cursor-pointer md:text-4xl',
						{
							'text-gray-400/50 dark:bg-gray-100/10': !selected.includes(l),
							'bg-amber-300 text-black': selected.includes(l)
						}
					)}
					><p>{l}</p>
					<span class="text-xs">{alphaState.get(l)}</span></button
				>
			{/if}
		{/each}
	</div>
</div>
