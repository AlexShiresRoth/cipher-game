<script>
	import { resolve } from '$app/paths';
	import clsx from 'clsx';
	import ResultsAndScoring from './results-and-scoring.svelte';
</script>

<section
	id="how-to-play"
	class="mx-auto max-w-xl border border-black p-6 font-mono leading-relaxed md:max-w-1/2 dark:border-white/50"
>
	<h1 class="mb-2 border-b-2 border-black pb-2 text-xl font-bold">How to Play Cipher</h1>

	<div
		class="mb-6 flex flex-col gap-2 rounded border p-2 dark:border-white/20 dark:bg-white/10 dark:text-gray-400"
	>
		<p>
			Want to try a step by step <a href={resolve('/tutorial')} class="text-amber-500 underline">tutorial</a>?
		</p>
	</div>

	<p><strong>Goal:</strong> Unscramble the shuffled 8 letter word (the <em>cipher</em>).</p>

	<hr class="my-2 border-black" />

	<h3 class="text-lg font-semibold text-amber-500">How it works</h3>
	<p>
		Each guess rearranges two letters in the cipher, by swapping places. Make a guess to move a
		letter a certain amount of places in the cipher — it might wrap around to the front.
	</p>

	<ol class="mb-4 list-inside list-decimal space-y-2">
		<li>
			Your guess must be:
			<ul class="ml-4 list-disc">
				<li>a real word</li>
				<li>at least <strong>3 letters</strong></li>
				<li>start with a letter that appears in the cipher</li>
			</ul>
		</li>

		<li>
			What the guess does:
			<ul class="ml-4 list-disc">
				<li>
					The <strong>first letter</strong> of your guess selects a matching letter in the cipher.
				</li>
				<li>That letter moves left to right by <strong>the length of your guess</strong>.</li>
				<li>If it goes past the end, it <strong>wraps to the front</strong>.</li>
				<li>It <strong>swaps</strong> places with the letter at the destination position.</li>
			</ul>
		</li>

		<li>Each guess counts as one move.</li>

		<li>
			Duplicate letters: if a letter appears more than once in the cipher, you will be able to
			choose which duplicate letter to move.
		</li>
		<li>
			When you guess a word, the letters you used will become unavailable, except for letters in the
			Cipher.
		</li>
		<li>
			You can get these back by replenishing the keyboard, this costs a move though, so be aware!
		</li>

		<strong>Each letter has a certain amount of availability</strong>
		<ul class="ml-4 flex flex-col gap-2">
			<li class="list-disc">
				Letters in the cipher have <strong>unlimited</strong> uses, and are represented with a line.

				<div class="flex items-center gap-1">
					(<span class="block h-1 w-5 bg-black dark:bg-white"></span>)
				</div>
			</li>
			<li class="list-disc">
				All other letters have dots to indicate how many uses are left
				<div class="flex items-center gap-1">
					(
					<span class="dot block h-1 w-1 bg-black dark:bg-white"></span>
					<span class="dot block h-1 w-1 bg-black dark:bg-white"></span>
					<span class="dot block h-1 w-1 bg-black dark:bg-white"></span>)
				</div>
			</li>
			<li class="list-disc">
				Vowels start with 3 and all others have one, so try to use letters that are in the cipher!
			</li>
		</ul>
	</ol>

	<h3 class="text-lg font-semibold text-amber-500">Example</h3>

	<p>The cipher is:</p>
	<div class="my-2 flex gap-2">
		{#each 'ACTPREU'.split('') as key, i (i)}
			<button class="relative flex items-center justify-center border-2 p-2 transition-all">
				<p class="text-xl font-bold uppercase">{key}</p>
			</button>
		{/each}
	</div>

	<p><strong>Hidden word (unknown to the player):</strong> <em>CAPTURE</em></p>

	<p><strong>Guess:</strong> <code>crafty</code> (6 letters)</p>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>First letter = <strong>C</strong></li>
		<li>
			C moves forward <strong>6</strong> positions (wraps if needed) and swaps with the letter at that
			destination
		</li>
	</ul>

	<p>New cipher becomes:</p>
	<div class="my-2 flex gap-2">
		{#each 'CATPREU'.split('') as key, i (i)}
			<button
				class={clsx('relative flex items-center justify-center border-2 p-2 transition-all', {
					'border-emerald-500 text-emerald-500': i === 0 || i === 1
				})}
			>
				<p class="text-xl font-bold uppercase">{key}</p>
			</button>
		{/each}
	</div>

	<p><strong>Next guess:</strong> <code>places</code> (6 letters)</p>
	<ul class="mt-4 ml-4 list-inside list-disc">
		<li>First letter = <strong>P</strong></li>
		<li>P moves forward 6 positions and swaps → new cipher: <strong>CAPTREU</strong></li>
		<li>Now the letters <strong>C A P T</strong> are in their correct spots.</li>
	</ul>
	<div class="mt-2 mb-8 flex gap-2">
		{#each 'CAPTREU'.split('') as key, i (i)}
			<button
				class={clsx('relative flex items-center justify-center border-2 p-2 transition-all', {
					'border-emerald-500 text-emerald-500': i <= 3
				})}
			>
				<p class="text-xl font-bold uppercase">{key}</p>
			</button>
		{/each}
	</div>

	<ResultsAndScoring />

	<h3 class="text-lg font-semibold text-amber-500">Share</h3>
	<p>After finishing, tap <strong>Share Results</strong> to post your Cipher stats with friends!</p>
</section>
