<script>
	export let emoji;
	export let moveAmount;
	export let replenishAmt;
	export let solvableAmt;
	export let mistakeAmount;
</script>

<div class="flex w-full justify-center gap-2 pt-2">
	<table class="w-full border-collapse rounded text-sm">
		<thead>
			<tr class="border border-black text-center text-sm dark:border-white">
				<th class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80">Status</th>
				<th class="border-r px-2 py-2 dark:text-white/80">Solvable</th>
				<th class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80">Moves</th>
				<th class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80"
					>Mistakes</th
				>
				<th class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80">Reps</th>
			</tr>
		</thead>

		<tbody>
			<tr class="border border-black text-center dark:border-white">
				<td class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80">{emoji}</td
				>
				<td class="border-r px-2 py-2 dark:text-white/80">{solvableAmt}</td>
				<td class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80"
					>{moveAmount}</td
				>
				<td class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80"
					>{mistakeAmount}</td
				>
				<td class="border-r border-black px-2 py-2 dark:border-white dark:text-white/80"
					>{replenishAmt}</td
				>
			</tr>
		</tbody>
	</table>
</div>
