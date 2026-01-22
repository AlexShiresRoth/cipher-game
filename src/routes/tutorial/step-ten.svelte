<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';
	import MockCipher from './mock-cipher.svelte';

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

<MockCipher {selected} startSwap={7} endSwap={6} {cipher} />

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
