<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Selection from '$lib/components/selection.svelte';
	import MockCipher from './mock-cipher.svelte';
	const cipher = 'feriokwr';
	const guess = 'ignite';
	const selected = guess.split('');
	const cipherState = cipher.split('');
	const alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>
	Now we have something special! We can swap the 'I' at position four with the 'E' at position two
	to move both letters into their correct position, 🎷. We need a seven letter word starting with
	'I', let's go with <em class="text-amber-500 uppercase">{guess}</em>.
</p>
<div class="my-2"></div>
<Selection {selected} shouldHaveMargin={false} />

<MockCipher {selected} startSwap={3} endSwap={1} {cipher} />

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
