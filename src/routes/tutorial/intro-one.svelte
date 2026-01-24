<script>
	import Cipher from '$lib/components/cipher.svelte';
	const word = 'firework';
	const cipher = 'efirokwr';
	const cipherState = cipher.split('');
	const selected = [''];
</script>

<div class="mt-6"></div>

<Cipher
	{word}
	{cipherState}
	{selected}
	startIndex={-1}
	allowChooseIndex={false}
	indexToSwap={-1}
	chooseStartingIndex={() => {}}
/>

<p>
	When starting the puzzle, the first thing you may notice is a scrambled word at the top. In this
	example the scrambled word is <code class="rounded bg-gray-100/10 text-amber-500 uppercase italic"
		>wfiroker</code
	>.
</p>
<p>
	You may have unscrambled this in your mind, and realized that the word we're trying to decipher
	is—spoiler alert 🚨 <code class="rounded bg-gray-100/10 text-amber-500 uppercase italic"
		>firework</code
	>
</p>
<p>This is the 'Cipher', and your job is to unscramble it... but how?</p>
