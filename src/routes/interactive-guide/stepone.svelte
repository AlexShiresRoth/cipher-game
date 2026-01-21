<script lang="ts">
	import clsx from 'clsx';
	import Explanation from './explanation.svelte';
	const cipher = 'efirokwr';
	const guess = 'factual';
	const selected = guess.split('');
</script>

<p>
	For our first move, we'll use a seven letter word: <em class="text-amber-300 uppercase"
		>{guess}</em
	> to swap the 'F' (at position 2) with the 'E' (at position 1). This moves the 'F' to the first position.
</p>
<div class="my-6 flex gap-2">
	{#each cipher as l, i}
		<div class="relative flex flex-col items-center gap-1">
			{#if i === 0}
				<span class="absolute -top-6 -right-2 text-lg text-amber-500 uppercase"
					>{selected[6]}<em class="absolute mb-2 text-xs">({7})</em></span
				>
			{/if}
			{#if i > 0 && i < selected.length}
				<span class="absolute -top-6 -right-2.5 text-lg text-amber-500 uppercase"
					>{selected[i - 1]}<em class="absolute mb-2 text-xs">({i})</em></span
				>
			{/if}
			<div
				class={clsx('flex w-9 justify-center border-2 py-4 uppercase ', {
					'border-amber-500 text-amber-500': i === 1,
					'border-indigo-500 text-indigo-500': i === 0,
					'dark:border-white dark:text-white': i > 1
				})}
			>
				{l}
			</div>
			{#if i === 1}
				<p class="text-amber-500 uppercase">{cipher[0]}</p>
			{/if}
			{#if i === 0}
				<p class="text-indigo-500 uppercase">{cipher[1]}</p>
			{/if}
		</div>
	{/each}
</div>
<Explanation
	><p>
		You can see in the cipher under the 'E' is an 'F' and the 'F' has a 'E' under it, these are
		indicating that these letters are to be swapped with eachother. As you select letters on the
		keyboard, you'll see the indicators change positions.
	</p>
	<p>
		Above the Cipher, you'll see the letters of the word <em class="text-amber-300 uppercase"
			>{guess}</em
		> indicating how many blocks the word is moving the letter 'F'.
	</p></Explanation
>
