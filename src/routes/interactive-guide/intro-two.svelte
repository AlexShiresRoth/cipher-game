<script>
	import Cipher from '$lib/components/cipher.svelte';
	const word = 'firework';
	const cipher = 'wfiroker';
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
	The goal of this puzzle, is not only to know what the word is but move each letter into their
	correct position by swapping letters around within the Cipher.
</p>
<p>
	We do this by selecting real English words. But that's not enough, we need a word whose first
	letter is in the Cipher.
</p>
