<script lang="ts">
	import { format } from 'date-fns';
	let showNavModal = false;
	const today = format(new Date(), 'EEE d, yyyy');
</script>

<main>
	<nav class="grid w-full grid-cols-3 justify-between">
		<div class="flex items-center justify-start px-4 text-sm text-black/50">
			<p>{today}</p>
		</div>
		<div class="flex items-center justify-center">
			<h2 class="text-3xl font-bold uppercase">CIPHER</h2>
		</div>
		<div
			class="relative flex items-center justify-end"
			on:mouseleave={() => {
				showNavModal = false;
			}}
			role="button"
			tabindex="0"
		>
			<button
				on:click={() => {
					showNavModal = true;
				}}
				class="bg-black px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-black/80"
				>{'menu'}</button
			>
			{#if showNavModal}
				<div
					class="absolute top-full left-0 z-10 flex w-full flex-col items-start bg-black p-2 text-white"
				>
					<a href="/">home</a>
				</div>
			{/if}
		</div>
	</nav>
	<section
		id="how-to-play"
		class="mx-auto max-w-xl border-2 border-black bg-white p-6 font-mono leading-relaxed text-black"
	>
		<h2 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold">How to Play Cipher</h2>

		<p><strong>Goal:</strong> Decipher the jumbled word before you run out of moves!</p>

		<hr class="my-4 border-black" />

		<h3 class="text-lg font-semibold text-amber-500">Objective</h3>
		<p class="mb-4">
			You’ll be given a <strong>shuffled 4–6 letter word</strong> (the
			<em>cipher</em>). Your job is to rearrange the letters back into the correct word using
			<strong>word guesses</strong>.
		</p>

		<h3 class="text-lg font-semibold text-amber-500">How It Works</h3>
		<ol class="mb-4 list-inside list-decimal space-y-2">
			<li>Choose a word that starts with a letter found in the cipher.</li>
			<li>
				When you guess, the cipher will move:
				<ul class="ml-4 list-inside list-disc">
					<li>
						The starting letter of your guessed word
						<strong>shifts forward</strong> in the cipher by
						<strong>the length of your guessed word</strong>.
					</li>
				</ul>
			</li>
			<li>If the shift goes past the end, it <strong>wraps around</strong>.</li>
			<li>Each guess counts as one move — and you only get a few!</li>
		</ol>

		<h3 class="text-lg font-semibold text-amber-500">Example</h3>
		<p>The cipher is:</p>
		<pre class="rounded border border-black bg-black px-3 py-2 text-white">DISQU</pre>
		<p class="mb-2">The real word is <strong>SQUID</strong> (but you don’t know that yet).</p>

		<p>If you guess <strong>"dream"</strong>:</p>
		<ul class="mb-4 ml-4 list-inside list-disc">
			<li>First letter: <strong>D</strong> (index 0)</li>
			<li>Word length: 5</li>
			<li>
				The letter <strong>D</strong> shifts 5 forward — wraps around to the start.
			</li>
		</ul>

		<p>If you guess <strong>"star"</strong>:</p>
		<ul class="mb-4 ml-4 list-inside list-disc">
			<li>First letter: <strong>S</strong> (index 2)</li>
			<li>Word length: 4</li>
			<li><strong>S</strong> swaps with letter 4 ahead (wraps to index 1)</li>
		</ul>

		<h3 class="text-lg font-semibold text-amber-500">Rules</h3>
		<ul class="mb-4 ml-4 list-inside list-disc">
			<li>No 1-letter words allowed.</li>
			<li>Each guess must start with a letter in the cipher.</li>
			<li>Repeating the same guess won’t count again.</li>
			<li>When the cipher matches the original word — <strong>you win!</strong></li>
			<li>Run out of moves, and it’s <strong>game over</strong> 😩</li>
		</ul>

		<h3 class="text-lg font-semibold text-amber-500">Tips</h3>
		<ul class="mb-4 ml-4 list-inside list-disc">
			<li>Use shorter words to move letters precisely.</li>
			<li>Watch how guesses change the cipher pattern.</li>
			<li>There’s a new cipher every day.</li>
		</ul>

		<h3 class="text-lg font-semibold text-amber-500">Share Your Results</h3>
		<p>
			After finishing, tap <strong>Share Results</strong> to post your Cipher stats with friends!
		</p>
	</section>
</main>
