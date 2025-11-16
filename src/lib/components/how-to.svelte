<section
	id="how-to-play"
	class="mx-auto max-w-xl border-2 border-black p-6 font-mono leading-relaxed md:max-w-1/2 dark:border-white/50"
>
	<h2 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold">How to Play Cipher</h2>

	<p><strong>Goal:</strong> Decipher the jumbled word before you run out of moves!</p>

	<hr class="my-4 border-black" />

	<h3 class="text-lg font-semibold text-amber-500">Objective</h3>
	<p class="mb-4">
		You’ll be given a <strong>shuffled 5–8 letter word</strong> (the
		<em>cipher</em>). Your job is to rearrange the letters back into the correct word, letter by
		letter.
	</p>

	<h3 class="text-lg font-semibold text-amber-500">How It Works</h3>
	<ol class="mb-4 list-inside list-decimal space-y-2">
		<li>Choose a minimum 3 letter word that starts with a letter found in the cipher.</li>
		<li>
			When you guess, one letter in the cipher that matches the first letter of your guess will
			move:
			<ul class="ml-4 list-inside list-disc">
				<li>
					The starting letter of your guessed word
					<strong>swaps with</strong> the letter in the cipher at
					<strong>the end of your guessed word</strong>.
				</li>
			</ul>
		</li>
		<li>If the shift goes past the end, it <strong>wraps around</strong>.</li>
		<li>Each guess counts as one move — and you only get a few!</li>
		<li>
			<b>Duplicate letters: </b>
			if there are duplicate letters in a word, you will be able to select one as the starting point.
			An animation will indicate this, and allow you click on the letter.
		</li>
	</ol>

	<h3 class="text-lg font-semibold text-amber-500">Example</h3>
	<p>The cipher is:</p>
	<pre
		class="rounded border border-black bg-black px-3 py-2 text-white dark:bg-indigo-500">ACTPREU</pre>
	<p class="mb-2">The real word is <strong>CAPTURE</strong> (but you don’t know that yet).</p>

	<p>If you guess <strong>"crafty"</strong>:</p>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>First letter: <strong>C</strong> (index 1)</li>
		<li>Word length: 6</li>
		<li>
			The letter <strong>C</strong> moves 6 spaces to the right — wraps around to the start and ends
			up as the first letter. The C is then swapped with the first letter "A".
		</li>
	</ul>

	<p>Now the Cipher is CATPREU</p>
	<p>If you guess <strong>"places"</strong>:</p>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>First letter: <strong>P</strong> (index 3)</li>
		<li>Word length: 6</li>
		<li><strong>P</strong> swaps with letter at index 2 "T" (wraps to index 2)</li>
		<li>
			Now the <strong>C A P T</strong> are in the correct locations, so the Cipher looks like CAPTREU.
		</li>
	</ul>

	<h3 class="text-lg font-semibold text-amber-500">Rules</h3>
	<ul class="mb-4 ml-4 list-inside list-disc">
		<li>Guesses must be atleast 3-letter words.</li>
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
