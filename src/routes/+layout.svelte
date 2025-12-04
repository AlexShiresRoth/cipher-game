<script lang="ts">
	import '../app.css';
	let { children } = $props();
	const version = `0.7.0`;
</script>

<main class="mb-28 flex min-h-[90vh] w-screen flex-col items-center overflow-x-hidden">
	{@render children()}
</main>

<footer class="flex w-full flex-col items-center bg-gray-100 dark:bg-black">
	<div
		class="flex w-full items-center border-b border-b-gray-200/50 px-4 py-2 dark:border-b-gray-100/10"
	>
		<img src="/logo.svg" alt="logo" height="30" width="30" />
		<p class="text-xs text-gray-400">
			&copy; Cipher {new Date().getFullYear()}, All rights reserved.
		</p>
	</div>
	<div
		class="flex w-full items-center justify-between border-b border-b-gray-200/50 px-4 py-2 dark:border-b-gray-100/10"
	>
		<div>
			<p class="text-xs text-gray-400">
				created by <a
					href="https://alexshiresroth.com/"
					class="underline"
					target="_blank"
					rel="noopener noreferrer">Alex Rothenberg</a
				>
			</p>
		</div>
		<div>
			<p class="text-xs text-gray-400">v{version}@alpha</p>
		</div>
	</div>
	<div class="flex w-full items-center justify-center px-4 py-2">
		<p class="text-xs text-gray-400">
			Unauthorized copying, reproduction, or distribution of this game is prohibited.
		</p>
	</div>
</footer>
