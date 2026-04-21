<script lang="ts">
	import { fly } from 'svelte/transition';

	export let content: string;
</script>

<button
	transition:fly={{ y: -100 }}
	class="z-10 rounded border-2 bg-black p-2 text-sm text-white shadow-lg dark:border-white/20"
	>{content}</button
>
