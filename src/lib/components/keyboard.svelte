<script lang="ts">
	import clsx from 'clsx';
	import UpdatePopup from './update-popup.svelte';

	export let cipherState: string[];
	export let selected: string[];
	export let handleSelect: (l: string) => void;
	export let alphaState: Map<string, number>;
	export let alpha: string[];
	export let showUpdatePopup: boolean;
	export let toggleUpdatePopup;

	function getAlphaStateNumber(l: string) {
		return alphaState.get(l) as number;
	}

	$: checkAlphaKeyColorIncluded = (l: string) => {
		return selected.includes(l);
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

<div class="relative flex w-full justify-center">
	<div class="relative flex flex-wrap items-center justify-center gap-2 dark:text-black">
		{#if showUpdatePopup}
			<UpdatePopup
				toggleUpdatePopup={() => toggleUpdatePopup(showUpdatePopup)}
				alignClasses="left-3.5 bottom-full"
				><p class="text-xs dark:text-white">
					<strong class="text-amber-500">UPDATE</strong>:{` `} Certain letters now have usage amounts,
					vowels have <strong class="text-yellow-500">three</strong>, letters in the cipher are
					<strong class="text-gray-100">unlimited</strong>, and all others have
					<strong class="text-red-500">one</strong> use.
				</p></UpdatePopup
			>
		{/if}
		{#each alpha as l, i}
			{#if isAvailable(l)}
				<button
					on:click={() => handleSelect(l)}
					class={clsx(
						'flex w-12 flex-col items-center justify-between rounded p-1 text-2xl uppercase transition-colors hover:cursor-pointer md:w-16 md:p-2 md:text-4xl',
						{
							'bg-amber-300': checkAlphaKeyColorIncluded(l),
							'bg-gray-100 dark:bg-gray-100/80':
								checkAlphaColorIsUsable(l) &&
								getAlphaStateNumber(l) > 3 &&
								!checkAlphaKeyColorIncluded(l),
							'bg-yellow-400 dark:bg-yellow-500':
								checkAlphaColorIsUsable(l) &&
								getAlphaStateNumber(l) === 3 &&
								!checkAlphaKeyColorIncluded(l),
							'bg-orange-400 dark:bg-orange-500':
								checkAlphaColorIsUsable(l) &&
								getAlphaStateNumber(l) === 2 &&
								!checkAlphaKeyColorIncluded(l),
							'bg-red-400 dark:bg-red-500':
								getAlphaStateNumber(l) === 1 && !checkAlphaKeyColorIncluded(l)
						}
					)}
					><p>{l}</p>
				</button>
			{:else}
				<button
					disabled
					class={clsx(
						'flex w-12 flex-col items-center justify-between rounded p-1 text-2xl uppercase transition-colors hover:cursor-pointer md:w-16 md:p-2 md:text-4xl',
						{
							'text-gray-400/50 dark:bg-gray-100/10': !selected.includes(l),
							'bg-amber-300 text-black': selected.includes(l)
						}
					)}><p>{l}</p></button
				>
			{/if}
		{/each}
	</div>
</div>
