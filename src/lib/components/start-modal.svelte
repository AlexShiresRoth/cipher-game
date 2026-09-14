<script lang="ts">
	import { formatDate } from 'date-fns';
	import type { CipherPuzzle } from '../../types';
	export let data: CipherPuzzle & { id: number };
	export let startGame: () => void;
	export let startTutorial: () => void;
</script>

<div
	class="fixed top-0 left-0 z-9999 flex min-h-screen w-full flex-col items-center justify-center gap-12 bg-white dark:bg-black"
>
	<div class="flex flex-col items-center justify-center gap-2">
		<img src="/logo.svg" alt="Cipher word puzzle logo" height="100" width="100" />
		<div class="flex max-w-3/4 flex-col text-center opacity-80">
			<h1 class="text-6xl font-bold uppercase">Cipher</h1>
			<p class="text-lg">Decipher the shuffled word. Play the daily word-shuffle puzzle.</p>
			<p class="my-4 text-xs text-amber-500 italic">
				If you're new here, highly suggest starting with the guided tutorial!
			</p>
		</div>
		<div class="mt-2 grid min-w-36 grid-cols-1 gap-3 text-center">
			<button
				on:click={startGame}
				class="rounded border-2 bg-black p-2 text-white transition-colors hover:cursor-pointer hover:border-indigo-500 hover:bg-indigo-500 hover:text-black dark:border-white/20 dark:text-white"
				>Play Game</button
			>
			<button
				on:click={startTutorial}
				class="rounded border-2 bg-black p-2 text-white transition-colors hover:cursor-pointer hover:border-emerald-500 hover:bg-emerald-500 hover:text-black dark:border-white/20 dark:text-white"
				>Guided Tutorial</button
			>
		</div>
	</div>

	<div class="text-center">
		<p>{formatDate(new Date(), 'MMM d, yyyy')}</p>
		<p>Cipher #{data.id}</p>
	</div>
</div>
