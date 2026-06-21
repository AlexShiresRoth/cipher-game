<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';
	import MockCipher from './mock-cipher.svelte';

	const cipher = 'fireokwr';
	const guess = 'window';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>Now the puzzle is halfway solved!</p>
<p>
	Next, let's move the 'W' at position seven with the 'O' at position five, using <em
		class="text-amber-500 uppercase">{guess}</em
	>.
</p>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />
<MockCipher {cipher} {selected} startSwap={6} endSwap={4} />
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
