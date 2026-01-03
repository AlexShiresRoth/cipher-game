<script lang="ts">
	import clsx from 'clsx';
	import { fade } from 'svelte/transition';
	type Align = 'bottom-left' | 'top-middle';

	let { children, toggleUpdatePopup, alignClasses, alignCarat = 'bottom-left' as Align } = $props();

	let align: Align = alignCarat;
</script>

<button
	data-testid="update-popup"
	transition:fade
	class={clsx(
		`absolute z-10 w-[250px] rounded border border-black/10 bg-white p-4 shadow-md after:absolute
							 after:border-8
							after:border-transparent after:border-t-white
							hover:cursor-pointer dark:border-gray-100/50 dark:bg-black after:dark:border-t-black`,
		{
			[alignClasses]: alignClasses,
			'bottom-full': !alignClasses,
			'after:top-full after:left-4 after:-translate-x-1/2': align === 'bottom-left',
			'after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-full after:rotate-180':
				align === 'top-middle'
		}
	)}
	onclick={toggleUpdatePopup}
>
	<p
		class="absolute -top-3 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-100/50 bg-white text-xs text-black dark:bg-black dark:text-white"
	>
		X
	</p>
	{@render children()}
</button>
