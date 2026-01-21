<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';

	const word = 'firework';
	const cipher = 'fireokwr';
	const guess = 'window';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>Now the puzzle is halfway solved!</p>
<p>
	Next, let's move the 'W' at position seven with the 'O' at position five, using <em
		class="text-amber-300 uppercase">{guess}</em
	>.
</p>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={6}
	allowChooseIndex={false}
	indexToSwap={4}
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
