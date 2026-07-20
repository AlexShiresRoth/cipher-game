<script lang="ts">
	import HowTo from '$lib/components/how-to.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { absoluteUrl, DEFAULT_OG_IMAGE } from '$lib/constants/seo';

	let showNavModal = false;

	const title = 'How to Play Cipher – Daily Word Puzzle Guide';
	const description =
		'Learn how to play Cipher, the daily word-shuffle puzzle. Step-by-step rules, examples, and tips for deciphering the shuffled word.';
	const url = absoluteUrl('/how-to');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={DEFAULT_OG_IMAGE} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<link rel="canonical" href={url} />
</svelte:head>

<Nav
	{showNavModal}
	showHome
	toggleModalOpen={() => {}}
	mistakeAmount={0}
	moveAmount={0}
	emoji=""
	solvableAmt={0}
	replenishAmt={0}
	word=""
	solutionPath={[]}
/>
<div class="mt-8"></div>
<HowTo />
