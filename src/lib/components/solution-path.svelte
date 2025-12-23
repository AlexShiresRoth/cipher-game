<script lang="ts">
	import clsx from 'clsx';

	export let solutionPath: string[] = [];
	export let word: string;
</script>

<!-- TODO - continue creating a solution modal that shows axtual swaps -->
<div class="flex w-full gap-2 pt-2">
	<div class="flex w-full flex-col items-center gap-8">
		{#each solutionPath as path, pathStep}
			<div class="flex w-full flex-col gap-2">
				<p>Step {pathStep + 1}</p>
				<div class="flex gap-2">
					{#each path.split('') as part, i}
						<div
							class={clsx(
								'relative z-0 flex w-full items-center justify-center border-2 p-2 transition-all',
								{
									'border-emerald-500 text-emerald-500': part === word[i],
									'border-black dark:border-white dark:text-white': part !== word[i]
								}
							)}
						>
							<p class="uppercase">{part}</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
