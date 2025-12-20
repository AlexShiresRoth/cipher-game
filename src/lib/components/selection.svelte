<script lang="ts">
	import clsx from 'clsx';

	export let selected;
	export let shouldHaveMargin = true;
</script>

<div
	class={clsx('mb-2 flex w-full justify-center', {
		'mt-8': shouldHaveMargin
	})}
>
	{#if selected.length === 0}
		<p class="text-3xl opacity-0">{`p`}</p>
	{/if}
	{#each selected as s}
		<p class="text-3xl font-bold uppercase dark:text-white">{s}</p>
	{/each}
</div>
