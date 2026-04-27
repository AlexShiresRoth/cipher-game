<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import ResultsAndScoring from '$lib/components/results-and-scoring.svelte';
	import Explanation from '../../lib/components/explanation.svelte';

	const word = 'firework';
	const cipherState = word.split('');
	const selected = ''.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>And the Cipher is solved 🎉</p>
<p>
	When you complete the puzzle, a screen will pop up showing your success and stats. You'll also be
	able to share your results from this screen.
</p>
<p>
	Thank you for trying 'Cipher' out and sticking with this tutorial 🙏. Hopefully now, it all makes
	sense!
</p>
<div class="my-2"></div>
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={-1}
	allowChooseIndex={false}
	indexToSwap={-1}
	chooseStartingIndex={() => {}}
/>

<Keyboard
	handleSelect={() => {}}
	{selected}
	{alphaState}
	removeLetterFromSelection={() => {}}
	{alpha}
	guess={() => {}}
/>

<ActionButtons
	clearSelection={() => {}}
	clearUsedLetters={() => {}}
	removeLetterFromSelection={() => {}}
	guess={() => {}}
	{selected}
	usedLetters={[]}
/>

<Explanation>
	<p>
		Each Cipher varies in complexity. One day the puzzle can be solved in four moves, the other
		seven.
	</p>
	<p>Your scoring tier depends on a couple of factors, not just the puzzle complexity!</p>
	<ResultsAndScoring />
</Explanation>
