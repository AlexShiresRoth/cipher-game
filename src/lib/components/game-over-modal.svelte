<script>
	import { fade, fly } from 'svelte/transition';
	import Stats from './stats.svelte';
	export let win;
	export let showLetters;
	export let word;
	export let shareResults;
	export let toggleModalOpen;
	export let moveAmount;
	export let solvableAmt;
	export let replenishAmt;
	export let mistakeAmount;
	export let tier;

	$: showStats = false;
</script>

<div
	transition:fade
	class="fixed top-0 left-0 z-50 flex h-screen w-screen flex-col items-center bg-white dark:bg-black"
>
	<div class="mt-2 flex w-full items-center justify-end px-4">
		<button
			class="text-lg font-bold text-black dark:text-white"
			on:click={() => toggleModalOpen(false)}>X</button
		>
	</div>

	<div class="flex h-full w-full flex-col items-center justify-center">
		{#if win}
			<div class="flex w-full flex-col items-center justify-center gap-8">
				<div class="flex w-11/12 flex-col items-center justify-center gap-2">
					{#if showLetters}
						<div class="flex w-full justify-center">
							<p class="text-7xl dark:text-white">{tier.emoji}</p>
						</div>
						<h2 transition:fly={{ y: 100, delay: 10 }}>The Cipher Was:</h2>
					{/if}
					<div class="flex w-full items-center justify-center gap-2">
						{#each word.split('') as letter, i (`${letter}-${i}`)}
							{#if showLetters}
								<div
									transition:fly={{ y: -100, delay: i * 80, duration: 400 }}
									class="w-12 border-2 border-emerald-500 p-2 text-center text-emerald-500 uppercase"
								>
									<p>{letter}</p>
								</div>
							{/if}
							{#if !showLetters}
								<div class="opacity-0"><p>{letter}</p></div>
							{/if}
						{/each}
					</div>
				</div>

				{#if showLetters}
					<div class="flex flex-col items-center gap-4 px-2">
						<h1
							transition:fly={{ y: 100, delay: 200 }}
							class="text-center text-2xl font-bold uppercase"
						>
							{tier.phrase}
						</h1>
						<p transition:fly={{ y: -100, delay: 200 }} class="text-center text-sm">
							This puzzle was solvable in <strong class="text-amber-500">{solvableAmt}</strong>
							moves. You did it in <strong class="text-amber-500">{moveAmount}</strong> moves
						</p>
						<button
							transition:fly={{ y: 100, delay: 300 }}
							class="rounded-full bg-black px-4 py-2 text-white hover:cursor-pointer dark:bg-emerald-500 dark:text-black"
							on:click={shareResults}>Share with friends & enemies</button
						>
						<button
							transition:fly={{ y: -100, delay: 350 }}
							class="rounded-full bg-black px-4 py-2 text-white hover:cursor-pointer dark:bg-white dark:text-black"
							on:click={() => (showStats = !showStats)}
							>{#if !showStats}
								{`Show Stats`}
							{:else}
								{`Hide Stats`}
							{/if}</button
						>
					</div>
				{/if}

				{#if showStats}
					<div class="w-11/12 md:w-1/2" transition:fade>
						<Stats emoji={tier.emoji} {moveAmount} {solvableAmt} {replenishAmt} {mistakeAmount} />
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
