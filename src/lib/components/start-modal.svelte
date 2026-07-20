<script lang="ts">
	import { formatDate } from 'date-fns';
	import type { CipherPuzzle } from '../../types';
	export let data: CipherPuzzle & { id: number };
	export let startGame: () => void;
	export let startTutorial: () => void;
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center gap-12">
	<div class="flex flex-col items-center justify-center">
		<img src="/logo.svg" alt="Cipher word puzzle logo" height="100" width="100" />
		<h1 class="text-5xl font-bold uppercase">Cipher</h1>
		<p class="text-center opacity-80">Decipher the shuffled word. Play the daily word-shuffle puzzle.</p>
		<div class="mt-8 grid min-w-36 grid-cols-1 gap-3 text-center">
			<button
				on:click={startGame}
				class="rounded border-2 bg-black p-2 text-white transition-colors hover:cursor-pointer hover:border-indigo-500 hover:bg-indigo-500 hover:text-black dark:border-white/20 dark:text-white"
				>Play Game</button
			>
			<button
				on:click={startTutorial}
				class="rounded border-2 bg-black p-2 text-white transition-colors hover:cursor-pointer hover:border-emerald-500 hover:bg-emerald-500 hover:text-black dark:border-white/20 dark:text-white"
				>Tutorial</button
			>
		</div>
	</div>

	<div class="text-center">
		<p>{formatDate(new Date(), 'MMM d, yyyy')}</p>
		<p>Cipher #{data.id}</p>
	</div>
</div>
