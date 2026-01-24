<script lang="ts">
	import { BookUser } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fade } from 'svelte/transition';

	$: showExp = false;
</script>

<div class="flex w-full flex-col gap-4">
	<div>
		<button
			class={clsx(
				'flex items-center gap-1 rounded  border  bg-black px-4 py-2 text-sm text-white italic hover:cursor-pointer dark:border-white/10 dark:bg-gray-100/10',
				{
					'text-amber-500': showExp
				}
			)}
			on:click={() => (showExp = !showExp)}
			>{showExp ? 'Hide ' : 'Show '}Details<BookUser size={16} />
		</button>
	</div>
	{#if showExp}
		<div
			class="flex flex-col gap-2 border border-black bg-gray-200/30 p-4 dark:border-white/10 dark:bg-gray-100/10"
			in:fade
			out:fade
		>
			<slot />
		</div>
	{/if}
</div>
