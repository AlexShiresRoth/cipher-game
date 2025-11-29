<script>
	import { fly } from 'svelte/transition';

	export let emoji;
	export let moveAmount;
	export let replenishAmt;
</script>

<div class="flex w-full flex-col gap-2 py-2 text-sm">
	<div class="flex w-full items-center justify-between">
		<div><p class="dark:text-white/80">Status {emoji}</p></div>
		<div class="flex gap-2">
			<p class=" dark:text-white/80">Moves</p>
			<span class="relative inline-block w-[1ch]">
				{#key moveAmount}
					<span class="absolute top-0 left-0" transition:fly={{ y: -40 }}>
						{moveAmount}
					</span>
				{/key}
			</span>
		</div>
	</div>
	<div class="flex gap-2">
		<p class="dark:text-white/80">Reps</p>
		<span class="relative inline-block w-[1ch]">
			{#key replenishAmt}
				<span class="absolute top-0 left-0" transition:fly={{ y: -40 }}>
					{replenishAmt}
				</span>
			{/key}
		</span>
	</div>
</div>
