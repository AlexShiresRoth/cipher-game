<script lang="ts">
	import clsx from 'clsx';

	export let usedLetters: string[];
	export let cipherState: string[];
	export let selected: string[];
	export let handleSelect: (l: string) => void;

	const alpha = 'qwertyuiopasdfghjklzxcvbnm'.split('');

	$: isAvailable = (l: string) => {
		if (!usedLetters.includes(l) || cipherState.includes(l)) return true;

		return false;
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
							'bg-amber-300': selected.includes(l),
							'bg-gray-100 dark:bg-gray-100/80': !selected.includes(l)
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
