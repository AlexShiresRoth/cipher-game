<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Explanation from './explanation.svelte';
	const word = 'firework';
	const cipher = 'feirokwr';
	const guess = '';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

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
		Now that we've submitted our selection, and it was a valid word, the 'F' is now at position one
		and the 'W' is at the second position.
	</p>

	<p>
		You can also see that the 'F' is now highlighted in green, indicating that it's in the correct
		position since the word is <em class="text-amber-300 uppercase">{word}</em>.
	</p>
</Explanation>
<div class="my-2"></div>
<p>Continue on to see how to decipher the whole word.</p>
