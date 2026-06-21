<script lang="ts">
	import type { DayRanking } from '$lib';
	import { tiers } from '$lib';
	import { SvelteMap } from 'svelte/reactivity';

	export let dayRankings: DayRanking[] = [];
	export let playerId: string = '';

	$: emojiCounts = (() => {
		const counts = new SvelteMap<string, number>();
		for (const ranking of dayRankings) {
			for (const { emoji } of Object.values(ranking)) {
				counts.set(emoji, (counts.get(emoji) ?? 0) + 1);
			}
		}
		return counts;
	})();

	$: tierRows = (() => {
		const rows = new SvelteMap<string, number>();
		const ordered = Object.entries(tiers).sort(([a], [b]) => (a === '7' ? -1 : b === '7' ? 1 : 0)); // move ninja rank to first
		for (const [, tier] of ordered) {
			if (!rows.has(tier.emoji)) {
				rows.set(tier.emoji, emojiCounts.get(tier.emoji) ?? 0);
			}
		}
		return rows;
	})();

	$: myRank = (() => {
		const ranking = dayRankings.find((ranking) => Object.keys(ranking).includes(playerId));
		if (!ranking) return null;
		const playerData = ranking[playerId];

		return playerData;
	})();
</script>

<div class="w-full md:w-1/2">
	<h2 class="text-3xl uppercase">Today's Leaderboard</h2>
	<p class="text-sm text-gray-400 dark:text-white/80">
		Your rank is determined by the amount of moves you took to solve the puzzle and the words you
		used.
	</p>

	<div class="mt-8">
		<table class="w-full table-fixed border-collapse">
			<thead>
				<tr>
					<th class="w-1/2 border border-gray-300 px-4 py-2 text-center font-semibold">Tier</th>
					<th class="w-1/2 border border-gray-300 px-4 py-2 text-center font-semibold">Players</th>
				</tr>
			</thead>
			<tbody>
				{#each [...tierRows] as [emoji, count] (emoji)}
					{@const isMyRank = myRank?.emoji === emoji}
					<tr>
						<td
							class="w-1/2 px-4 py-2 text-center {isMyRank
								? 'border-2 border-orange-400 font-semibold'
								: 'border border-gray-300'}">{emoji}</td
						>
						<td
							class="w-1/2 px-4 py-2 text-center {isMyRank
								? 'border-2 border-orange-400 font-semibold text-orange-400'
								: 'border border-gray-300'}"
						>
							{count}
							{#if isMyRank}<span class="ml-1 text-xs text-orange-500">(you)</span>{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
