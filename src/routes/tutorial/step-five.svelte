<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';

	const word = 'firework';
	const cipher = 'feirokwr';
	const guess = 'r';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>
	Thanks for continuing on 😀. In this next part, we'll explore what happens when there are two of
	the same letters.
</p>
<Selection {selected} shouldHaveMargin={false} />
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={3}
	allowChooseIndex={true}
	indexToSwap={-1}
	chooseStartingIndex={() => {}}
/>
<p>
	When we select 'R', notice how both animate. You can click on one of them to select a starting
	position(we're going to choose the 'R' at position four, for our case).
</p>
<div class="my-2"></div>
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
/>
