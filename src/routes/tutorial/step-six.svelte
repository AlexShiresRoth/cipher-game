<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';
	import MockCipher from './mock-cipher.svelte';

	const word = 'firework';
	const cipher = 'feirokwr';
	const guess = 'radiant';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>
	For our second selection, we will use the seven letter word <em class="text-amber-300 uppercase"
		>{guess}</em
	> to swap the 'R' at position four, with the 'I' at position three, to move the 'R' into the correct
	position.
</p>

<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />
<MockCipher {cipher} {selected} startSwap={3} endSwap={2} />

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
