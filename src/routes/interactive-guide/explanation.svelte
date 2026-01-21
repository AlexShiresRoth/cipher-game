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
				'flex items-center gap-1 rounded border border-white/10 bg-gray-100/10 px-4 py-2 text-sm italic hover:cursor-pointer',
				{
					'text-amber-500': showExp
				}
			)}
			on:click={() => (showExp = !showExp)}
			>{showExp ? 'Hide ' : 'Show '}Explanation<BookUser size={16} />
		</button>
	</div>
	{#if showExp}
		<div
			class="flex flex-col gap-2 rounded border border-white/10 bg-gray-100/10 p-4"
			in:fade
			out:fade
		>
			<slot />
		</div>
	{/if}
</div>
