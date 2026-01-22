<script lang="ts">
	import { alpha, defaultAlphaState, vowels } from '$lib';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Explanation from './explanation.svelte';

	const cipher = 'efirokwr';
	const guess = 'factual';
	const selected = guess.split('');
	$: cipherState = cipher.split('');
	$: alphaState = defaultAlphaState(alpha, cipherState, vowels);
</script>

<div class="my-2"></div>
<Keyboard
	handleSelect={() => {}}
	{selected}
	{alphaState}
	removeLetterFromSelection={() => {}}
	{alpha}
	guess={() => {}}
/>
<div class="my-2"></div>
<p>
	As you make a selection you'll see that each letter you select, in this case <em
		class="text-amber-300 uppercase">{guess}</em
	>, will be highlighted. Be careful with what words you create, because some letters have finite
	uses.
</p>
<div
	class="flex flex-col gap-2 rounded border border-white/20 bg-white/10 p-2 text-sm text-gray-400 italic"
>
	<p>For the sake of this tutorial, the letters are not going to diminish in uses.</p>
	<p>Letters with a dash have infinite uses.</p>
	<p>Letters with dots have finite uses.</p>
</div>
<div class="my-2"></div>
<Explanation>
	<p>
		You can see in the keyboard above that certain letters have a dash and others have dots. The
		letters with a dash are in the cipher, and these have infinite uses. The letters with dots
		indicate how many uses they have left, vowels have 3 and then the rest have 1. You'll notice, as
		you play that the dots reduce as you use the letters. If you run out of uses on a letter, you
		can replenish them, but at a cost(more on this later).
	</p>
</Explanation>
