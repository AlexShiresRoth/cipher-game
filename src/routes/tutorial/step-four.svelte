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

<p>
	Now that we've submitted our valid selection the 'F' is at position one, in it's correct position
	and the 'W' is at the second position.
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
		Letters in their correct position are highlighted in green. Since the word is <em
			class="text-amber-500 uppercase">{word}</em
		> the 'F' is now highlighted.
	</p>
</Explanation>
<div class="my-2"></div>
<p>Continue on to see how to decipher the whole word.</p>
