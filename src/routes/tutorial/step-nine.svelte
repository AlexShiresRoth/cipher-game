<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';
	import MockCipher from './mock-cipher.svelte';

	const cipher = 'firewkor';
	const guess = 'oatmeal';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>Alright, not that much further.</p>
<p>
	Let's use a seven letter 'O' word to swap with the 'K' at position six. How about <em
		class="text-amber-300 uppercase">{guess}</em
	>?
</p>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />

<MockCipher {selected} startSwap={6} endSwap={5} {cipher} />

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
