<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';

	const word = 'firework';
	const cipher = 'feirokwr';
	const guess = 'region';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>
	For our second selection, we will use the six letter word <em class="text-amber-300 uppercase"
		>Region</em
	> to swap the 'R' at position four, with the 'I' at position three, to move the 'R' into the correct
	position.
</p>
<div class="mt-4">
	<p class="rounded border border-white/20 bg-white/10 p-2 text-sm text-gray-400 italic">
		For the sake of this tutorial, the letters are not going to diminish in uses.
	</p>
</div>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={3}
	allowChooseIndex={false}
	indexToSwap={2}
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
