<script lang="ts">
	import clsx from 'clsx';

	export let selected;
	export let shouldHaveMargin = true;
	export let isTutorialMode = false;
</script>

<div
	class={clsx('mb-2 flex w-full justify-center', {
		'mt-8': shouldHaveMargin
	})}
	class:mb-4={isTutorialMode}
>
	{#if selected.length === 0}
		<p class="text-3xl opacity-0">f</p>
	{/if}
	{#each selected as s, i (s + i)}
		<p class="text-3xl font-bold uppercase dark:text-white">{s}</p>
	{/each}
</div>
