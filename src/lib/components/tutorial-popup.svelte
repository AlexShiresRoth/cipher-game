<script lang="ts">
	import type { TutorialState } from '$lib/types/store';
	import { ChevronRight } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import TutorialStep from './tutorial-step.svelte';

	export let tutorialState: TutorialState;

	let showPopup = tutorialState.isTutorialMode;

	function togglePopup() {
		showPopup = !showPopup;
	}
</script>

<div
	class="fixed top-20 left-0 z-10 flex overflow-hidden rounded-r-lg border-2 border-l-0 border-amber-500/25 bg-black/90 shadow-md backdrop-blur-sm transition-[width,box-shadow] duration-340 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/20 dark:bg-black"
	class:w-[min(80vw,90vw)]={showPopup}
	class:shadow-lg={showPopup}
	in:fly={{ x: -200, delay: 200 }}
	out:fly={{ x: -100 }}
>
	<button
		type="button"
		class="flex shrink-0 items-center justify-center text-amber-500 transition-[background-color,color] duration-200 hover:bg-white/5"
		on:click={togglePopup}
		aria-expanded={showPopup}
		aria-label={showPopup ? 'Hide tutorial' : 'Show tutorial'}
	>
		<span
			class="inline-block transition-transform duration-340 ease-[cubic-bezier(0.22,1,0.36,1)]"
			class:rotate-180={showPopup}
		>
			<ChevronRight size={24} />
		</span>
	</button>

	{#if showPopup}
		<button
			type="button"
			class="flex min-w-14 flex-col justify-center gap-2 overflow-hidden border-0 bg-transparent text-left transition-[opacity,transform,padding] duration-340 ease-[cubic-bezier(0.22,1,0.36,1)]"
			class:pointer-events-none={!showPopup}
			class:w-0={!showPopup}
			class:flex-none={!showPopup}
			class:px-0={!showPopup}
			class:py-0={!showPopup}
			class:opacity-0={!showPopup}
			class:-translate-x-2={!showPopup}
			class:flex-1={showPopup}
			class:p-4={showPopup}
			class:opacity-100={showPopup}
			class:translate-x-0={showPopup}
			on:click={togglePopup}
		>
			<h2 class="text-lg font-bold text-amber-500">Tutorial</h2>
			<h3>Step {tutorialState.currentStep + 1}</h3>

			<svelte:component
				this={TutorialStep}
				node={tutorialState.steps?.[tutorialState.currentStep].currentStepNode || ''}
			/>
		</button>
	{/if}
</div>
