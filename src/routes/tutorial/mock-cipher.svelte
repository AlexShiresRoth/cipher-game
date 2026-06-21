<script lang="ts">
	import { IterationCw } from '@lucide/svelte';
	import clsx from 'clsx';
	const word = 'firework';
	export let cipher: string;
	export let selected: string[];
	export let startSwap: number = -1;
	export let endSwap: number = -1;
	const lastSelectedIndex = cipher.length - startSwap;

	function getSelectedMeta(i: number) {
		if (startSwap === -1) return null;

		const len = cipher.length;

		const distance = (i - startSwap + len) % len;

		if (distance < 0 || distance >= selected.length) return null;

		const wrapped = startSwap + distance >= len - 1;

		return {
			mapped: distance,
			wrapped
		};
	}
</script>

<div class="my-6 flex w-full justify-center">
	<div class="flex w-full gap-2 md:w-auto md:gap-4">
		{#each cipher as l, i (i)}
			{@const meta = getSelectedMeta(i)}
			<div class="flex w-full flex-col items-center gap-1">
				<div class="relative flex w-full flex-col">
					{#if meta}
						<span class={clsx('absolute -top-6 -right-2.5 text-lg text-amber-500 uppercase ')}>
							{#if i !== cipher.length - 1}
								{selected[meta.mapped]}
							{:else}
								<IterationCw size={15} class="absolute top-1 right-0" />
							{/if}
							<em class="absolute -right-3 text-xs">
								{i !== cipher.length - 1 ? `(${meta.mapped + 1})` : ''}
							</em>
						</span>
					{/if}
					{#if i === 0}
						<span class={clsx('absolute -top-6 text-lg text-amber-500 uppercase')}>
							{selected[lastSelectedIndex - 1]}
							<em class="absolute -right-2.5 text-xs">
								({lastSelectedIndex})
							</em>
						</span>
					{/if}
					<div
						class={clsx(
							'flex w-8 items-center justify-center border-2 p-2 text-xl font-bold uppercase transition-all md:min-w-15 md:text-5xl',
							{
								'border-amber-500 text-amber-500': i === startSwap,
								'border-indigo-500 text-indigo-500': i === endSwap,
								'dark:border-emerald-500 dark:text-emerald-500': l === word[i],
								'dark:border-white dark:text-white':
									i !== startSwap && i !== endSwap && l !== word[i]
							}
						)}
					>
						{l}
					</div>
				</div>
				{#if i === startSwap}
					<p class="text-amber-500 uppercase">{cipher[startSwap]}</p>
				{/if}
				{#if i === endSwap}
					<p class="text-indigo-500 uppercase">{cipher[endSwap]}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
