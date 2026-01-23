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
	The goal of this puzzle is not only to know what the word is but to move each letter into their
	correct position by swapping letter positions within the Cipher.
</p>
<p>
	We do this by selecting real English words<em class="text-amber-500"
		>(minimum of three letters)</em
	>. But that's not enough, we need a word whose first letter is in the Cipher(this will select the
	starting position). Then, the length of that word will move it however many blocks from left to
	right. If the word is longer than the starting position to the end, it wraps around to the
	beginning.
</p>
