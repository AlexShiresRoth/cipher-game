<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import Cipher from '$lib/components/cipher.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	const word = 'firework';
	const cipher = 'wfiroker';
	const selected = 'frigidly'.split('');
	$: cipherState = cipher.split('');
	$: alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<p>
	For our first move, we'll use an eight letter word: <em class="text-amber-300 uppercase"
		>frigidly</em
	> to swap the 'F' (at position 2) with the 'W' (at position 1).
</p>
<div class="my-2"></div>
<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={1}
	allowChooseIndex={false}
	indexToSwap={0}
	chooseStartingIndex={() => {}}
/>
<p>
	You can see in the cipher under the 'W' is an 'F' and the 'F' has a 'W' under, these are
	indicating the letters each are to be swapped with. As you select letters on the keyboard, you'll
	see the indicators change positions.
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
