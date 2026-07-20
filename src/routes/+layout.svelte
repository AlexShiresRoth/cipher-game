<script lang="ts">
	import {
		DEFAULT_DESCRIPTION,
		DEFAULT_OG_IMAGE,
		DEFAULT_TITLE,
		SITE_NAME
	} from '$lib/constants/seo';
	import '../app.css';
	let { children } = $props();
	const version = `1.3.0`;
</script>

<svelte:head>
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={DEFAULT_OG_IMAGE} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={DEFAULT_TITLE} />
	<meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
	<meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
	<meta name="theme-color" content="#000000" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<main class="mb-28 flex min-h-screen w-screen flex-col items-center overflow-x-hidden">
	{@render children()}
</main>

<footer class="flex w-full flex-col items-center bg-gray-100 dark:bg-black">
	<div
		class="flex w-full items-center border-b border-b-gray-200/50 px-4 py-2 dark:border-b-gray-100/10"
	>
		<img src="/logo.svg" alt="Cipher word puzzle logo" height="30" width="30" />
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
					href="https://alexr.dev"
					class="underline"
					target="_blank"
					rel="noopener noreferrer">Alex Rothenberg</a
				>
			</p>
		</div>
		<div>
			<p class="text-xs text-gray-400">v{version}</p>
		</div>
	</div>
	<div class="flex w-full items-center justify-center px-4 py-2">
		<p class="text-xs text-gray-400">
			Unauthorized copying, reproduction, or distribution of this game is prohibited.
		</p>
	</div>
</footer>
