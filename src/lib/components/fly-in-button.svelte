<script lang="ts">
	import { fly } from 'svelte/transition';

	export let content: string;
	export let tone: 'error' | 'success' = 'error';
</script>

<div
	class="toast-message"
	class:toast-success={tone === 'success'}
	transition:fly={{ y: -16, duration: 180 }}
>
	{content}
</div>

<style>
	.toast-message {
		width: fit-content;
		max-width: 100%;
		padding: 12px 18px;
		border: 1px solid #77602b;
		border-left: 3px solid #ffbf24;
		border-radius: 2px;
		background: #1c1b10;
		color: #f4dda5;
		box-shadow: 4px 5px 0 #030703;
		font-size: 13px;
		line-height: 1.6;
		text-align: center;
		overflow-wrap: anywhere;
	}
	.toast-success {
		border-color: #337562;
		border-left-color: var(--cyan);
		background: #0e1c18;
		color: var(--cyan);
	}
</style>
