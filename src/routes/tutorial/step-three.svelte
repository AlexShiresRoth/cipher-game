<script>
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Explanation from './explanation.svelte';

	const guess = 'factual';
	const selected = guess.split('');
</script>

<ActionButtons
	clearSelection={() => {}}
	clearUsedLetters={() => {}}
	removeLetterFromSelection={() => {}}
	guess={() => {}}
	{selected}
	usedLetters={[]}
/>

<p>
	Outside of the tutorial, when you make a selection like <em class="text-amber-300 uppercase"
		>({guess})</em
	>, you'll see the "Guess" button become highlighted, you can then submit the word to be validated
	and if valid it will swap the two letters.
</p>
<div class="my-2"></div>
<Explanation
	><p>The back arrow allows you to delete a letter from your selection.</p>
	<p>The trash icon button allows you to completely clear it.</p>
	<p>
		The reverse arrow button is the 'replenish' button, which allows you to revert used letters back
		to their original state. This will become highlighted once you've actually used up letters.
	</p></Explanation
>
