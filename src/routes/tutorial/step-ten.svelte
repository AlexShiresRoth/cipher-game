<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';

	const word = 'firework';
	const cipher = 'firewokr';
	const guess = 'radical';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>Okay, last move!</p>
<p>
	Finally, we'll use a <em class="text-amber-300 uppercase">{guess}</em> seven letter 'R' word to swap
	with the 'K'.
</p>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={7}
	allowChooseIndex={false}
	indexToSwap={6}
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
