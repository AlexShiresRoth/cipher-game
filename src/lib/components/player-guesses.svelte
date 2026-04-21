<script lang="ts">
	import clsx from 'clsx';
	import type { ActionData } from '../../routes/$types';

	export let puzzleData: ActionData;
	export let guesses: string[];
	export let cipherWord: string;
</script>

<div class="mt-8 min-h-screen bg-white dark:bg-black">
	<div class="flex flex-col">
		<span class="text-xs text-amber-500 uppercase">Cipher Word</span>
		<h3 class="mb-1 text-3xl uppercase">{cipherWord}</h3>
	</div>
	{#if puzzleData?.wordsGuessed}
		<div class="flex w-full justify-center gap-2 pt-2">
			<table class="w-full table-fixed border-collapse text-sm">
				<thead>
					<tr>
						<th
							class="w-1/2 border border-black px-3 py-2 text-left uppercase dark:border-white dark:text-white/80"
						>
							Word
						</th>
						<th
							class="w-1/3 border border-black px-3 py-2 text-center uppercase dark:border-white dark:text-white/80"
						>
							Uses
						</th>
					</tr>
				</thead>

				<tbody>
					{#each Object.entries(puzzleData.wordsGuessed).sort((a, b) => b[1] - a[1]) as [word, amt] (word)}
						<tr>
							<td
								class={clsx('border border-black px-3 py-2 text-left uppercase dark:border-white', {
									'font-semibold text-amber-500': guesses.includes(word)
								})}
							>
								{word}
							</td>
							<td
								class="border border-black px-3 py-2 text-center dark:border-white dark:text-white/80"
							>
								{amt}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
