<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '$lib/components/nav.svelte';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';
	import IntroOne from './intro-one.svelte';
	import IntroTwo from './intro-two.svelte';
	import StepEight from './step-eight.svelte';
	import StepEleven from './step-eleven.svelte';
	import StepFive from './step-five.svelte';
	import StepFour from './step-four.svelte';
	import StepNine from './step-nine.svelte';
	import StepSeven from './step-seven.svelte';
	import StepSix from './step-six.svelte';
	import StepTen from './step-ten.svelte';
	import StepThree from './step-three.svelte';
	import StepTwo from './step-two.svelte';
	import Stepone from './stepone.svelte';

	// TODO - we should add a cms so we don't need to update text in code
	const steps: { header: string; content: ConstructorOfATypedSvelteComponent }[] = [
		{
			header: 'Overview',
			content: IntroOne
		},
		{
			header: 'Overview Continued',
			content: IntroTwo
		},
		{
			header: 'The Cipher',
			content: Stepone
		},
		{ header: 'The Keyboard', content: StepTwo },
		{ header: 'The Action Buttons', content: StepThree },
		{ header: 'All Together', content: StepFour },
		{ header: 'Duplicate Letters', content: StepFive },
		{ header: 'Move Two', content: StepSix },
		{ header: 'Move Three', content: StepSeven },
		{ header: 'Move Four', content: StepEight },
		{ header: 'Move Five', content: StepNine },
		{ header: 'Move Six', content: StepTen },
		{ header: 'Donezo!', content: StepEleven }
	];

	let started = false;
	let step = 0;

	function incrementStep(num: number) {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		return num + 1;
	}
	function decrement(num: number) {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		return num > 0 ? num - 1 : num;
	}
</script>

<svelte:head>
	<title>Cipher Tutorial – Learn the Daily Word Puzzle</title>
	<meta
		name="description"
		content="Interactive Cipher tutorial: learn the cipher, keyboard, action buttons, and move-by-move strategies for the daily word-shuffle puzzle."
	/>
	<meta property="og:title" content="Cipher Tutorial – Learn the Daily Word Puzzle" />
	<meta
		property="og:description"
		content="Interactive Cipher tutorial: learn the cipher, keyboard, action buttons, and move-by-move strategies for the daily word-shuffle puzzle."
	/>
	<meta property="og:url" content="https://play-cipher.com/tutorial" />
	<meta name="twitter:title" content="Cipher Tutorial – Learn the Daily Word Puzzle" />
	<meta
		name="twitter:description"
		content="Interactive Cipher tutorial: learn the cipher, keyboard, action buttons, and move-by-move strategies for the daily word-shuffle puzzle."
	/>
	<link rel="canonical" href="https://play-cipher.com/tutorial" />
</svelte:head>

<Nav
	showNavModal={false}
	showHome
	toggleModalOpen={() => {}}
	mistakeAmount={0}
	moveAmount={0}
	emoji=""
	solvableAmt={0}
	replenishAmt={0}
	word=""
	solutionPath={[]}
/>

<div class="flex min-h-screen w-full flex-col justify-center gap-4 px-5 py-16 md:w-2/3 lg:w-1/2">
	{#if !started}
		<h1 class="text-2xl md:text-4xl">
			Welcome to the Cipher tutorial. Let’s go step by step and learn how to decipher the puzzle.
		</h1>
		<div>
			<button
				on:click={() => (started = true)}
				class="rounded bg-emerald-500 px-4 py-2 transition-colors hover:cursor-pointer hover:bg-emerald-400 dark:text-black"
				>Start Tutorial</button
			>
		</div>
	{/if}

	{#if started}
		{#key step}
			<div class="flex w-full flex-col gap-4">
				<div class="w-full border-b border-b-white">
					<h2 class="pb-2 text-2xl" data-test-id="tutorial-heading" in:fly={{ x: -100 }}>
						{steps[step].header}
					</h2>
				</div>
				<div data-test-id="tutorial-content" class="flex flex-col gap-2" in:fly={{ x: 100 }}>
					<svelte:component this={steps[step].content} />
				</div>
			</div>
		{/key}

		<div class="mt-4 flex w-full justify-between border-t py-4 dark:border-white">
			{#if step > 0}
				<button on:click={() => (step = decrement(step))} class="flex items-center text-sm"
					><ArrowLeft size={14} /> Back</button
				>
			{:else}
				<div></div>
			{/if}
			{#if !!steps[step + 1]}
				<button on:click={() => (step = incrementStep(step))} class="flex items-center text-sm"
					>Next <ArrowRight size={14} /></button
				>
			{/if}
		</div>
	{/if}
	{#if step >= 5}
		<div class="flex flex-col items-center gap-4">
			<p>Feeling confident? Maybe, a little?</p>
			<a
				href={resolve('/')}
				class="flex items-center justify-center rounded bg-emerald-500 px-4 py-2 text-black"
				>Try Today's Puzzle</a
			>
		</div>
	{/if}
	{#if started}
		<div class="mt-4 flex flex-col gap-2">
			<p class="uppercase">Pages</p>
			<div class="flex flex-wrap items-center gap-4">
				{#each steps as s, i (i)}
					<button
						on:click={() => {
							step = i;
							window.scrollTo({
								top: 0,
								behavior: 'smooth'
							});
						}}
						class={clsx('border-b hover:cursor-pointer hover:text-amber-500', {
							'text-amber-500': i === step
						})}>{s.header}</button
					>
				{/each}
			</div>
		</div>
	{/if}
</div>
