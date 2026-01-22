<script lang="ts">
	import Explanation from './explanation.svelte';
	import MockCipher from './mock-cipher.svelte';
	const cipher = 'efirokwr';
	const guess = 'factual';
	const selected = guess.split('');
</script>

<p>
	For our first move, we'll use a seven letter word: <em class="text-amber-300 uppercase"
		>{guess}</em
	> to swap the 'F' (at position 2) with the 'E' (at position 1). This moves the 'F' to the first position.
</p>
<MockCipher {cipher} {selected} startSwap={1} endSwap={0} />
<Explanation
	><p>
		You can see in the cipher under the 'E' is an 'F' and the 'F' has a 'E' under it, these are
		indicating that these letters are to be swapped. As you select letters on the keyboard, you'll
		see the indicators change positions.
	</p>
	<p>
		Above the Cipher, you'll see the letters of the word <em class="text-amber-300 uppercase"
			>{guess}</em
		> indicating how many blocks the word is moving the letter 'F'.
	</p></Explanation
>
