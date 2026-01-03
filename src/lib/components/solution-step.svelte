<script lang="ts">
	import clsx from 'clsx';
	type SwappedLetterPaths = { [key: string]: number };
	export let isPathStepPart: (
		index: number,
		part: string,
		swappedLetters: SwappedLetterPaths[]
	) => boolean;
	export let word;
	export let i;
	export let part;
	export let swappedLettersPerPath;
	export let pathStep;
	export let onCreateNode;
</script>

<div class="flex w-full flex-col items-center">
	<p
		class={clsx(
			'relative z-0 flex w-full items-center justify-center border-2 p-2 uppercase transition-all',
			{
				'border-emerald-500 text-emerald-500': part === word[i],
				'border-black dark:border-white dark:text-white':
					part !== word[i] &&
					!isPathStepPart(i, part, swappedLettersPerPath?.[pathStep]) &&
					!isPathStepPart(i, part, swappedLettersPerPath?.[pathStep]),
				'border-amber-500 text-amber-500':
					!!swappedLettersPerPath?.[pathStep] &&
					(isPathStepPart(i, part, swappedLettersPerPath?.[pathStep]) ||
						isPathStepPart(i, part, swappedLettersPerPath?.[pathStep]))
			}
		)}
	>
		{part}
	</p>
	{#if !!swappedLettersPerPath[pathStep]}
		{#if isPathStepPart(i, part, swappedLettersPerPath?.[pathStep])}
			<span use:onCreateNode={pathStep} class="block h-3 w-0.5 bg-amber-500"> </span>
		{/if}
	{/if}
</div>
