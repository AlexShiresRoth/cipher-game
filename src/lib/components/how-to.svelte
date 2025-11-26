<section
	id="how-to-play"
	class="mx-auto max-w-xl border-2 border-black p-6 font-mono leading-relaxed md:max-w-1/2 dark:border-white/50"
>
	<h2 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold">How to Play Cipher</h2>

	<p><strong>Goal:</strong> Unscramble the shuffled 8 letter word (the <em>cipher</em>).</p>

	<hr class="my-4 border-black" />

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
				<li>That letter moves forward by <strong>the length of your guess</strong>.</li>
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
			For each word that you guess, letters will become unavailable to use if they have letters not
			in the Cipher. Any letter in the Cipher will always be available in the keyboard.
		</li>
		<li>
			You can get these back by replenishing the keyboard, this costs a move though, so be aware!
		</li>
	</ol>

	<h3 class="text-lg font-semibold text-amber-500">Example</h3>

	<p>The cipher is:</p>
	<pre
		class="rounded border border-black bg-black px-3 py-2 text-white dark:bg-indigo-500">ACTPREU</pre>

	<p><strong>Hidden word (unknown to the player):</strong> <em>CAPTURE</em></p>

	<p><strong>Guess:</strong> <code>crafty</code> (6 letters)</p>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>First letter = <strong>C</strong></li>
		<li>
			C moves forward <strong>6</strong> positions (wraps if needed) and swaps with the letter at that
			destination
		</li>
		<li>New cipher becomes: <strong>CATPREU</strong></li>
	</ul>

	<p><strong>Next guess:</strong> <code>places</code> (6 letters)</p>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>First letter = <strong>P</strong></li>
		<li>P moves forward 6 positions and swaps → new cipher: <strong>CAPTREU</strong></li>
		<li>Now the letters <strong>C A P T</strong> are in their correct spots.</li>
	</ul>

	<h3 class="text-lg font-semibold text-amber-500">Win & scoring</h3>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>When the cipher exactly matches the original word, you win.</li>
		<li>If you move a letter into the wrong position, it counts as a mistake.</li>
		<li>
			Result tiers:
			<ul class="ml-6 list-disc">
				<li><strong>No mistakes</strong> — 💎 Diamond</li>
				<li><strong>1 mistake</strong> — 🥇 Gold</li>
				<li><strong>2 mistakes</strong> — 🥈 Silver</li>
				<li><strong>3+ mistakes</strong> — 🥉 Bronze</li>
			</ul>
		</li>
	</ul>

	<h3 class="text-lg font-semibold text-amber-500">Tips</h3>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>Use shorter guesses for finer control of a single letter.</li>
		<li>Watch how each guess reshapes the pattern — plan your next move accordingly.</li>
		<li>There’s a new cipher every day — enjoy!</li>
	</ul>

	<h3 class="text-lg font-semibold text-amber-500">Share</h3>
	<p>After finishing, tap <strong>Share Results</strong> to post your Cipher stats with friends!</p>
</section>
