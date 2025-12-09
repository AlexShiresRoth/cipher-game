<script lang="ts">
	export let selected;
</script>

<div class="mt-8 mb-2 flex w-full justify-center">
	{#if selected.length === 0}
		<p class="text-3xl opacity-0">{`p`}</p>
	{/if}
	{#each selected as s}
		<p class="text-3xl font-bold uppercase dark:text-white">{s}</p>
	{/each}
</div>
