<script lang="ts">
	import HowTo from '$lib/components/how-to.svelte';
	import Nav from '$lib/components/nav.svelte';
	let showNavModal = false;
</script>

<svelte:head>
	<title>CIPHER|How to play</title>
	<meta
		name="description"
		content="A detailed guide on how to play the Cipher word puzzle game. 
	This guide consists of examples and thorough instructions."
	/>
	<meta
		property="og:description"
		content="A detailed guide on how to play the Cipher word puzzle game. 
	This guide consists of examples and thorough instructions."
	/>
	<meta property="og:type" content="game" />
	<meta property="og:url" content="https://play-cipher.com" />
	<meta property="og:image" content="https://play-cipher.com/og-image.png" />
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
	toggleUpdatePopup={() => {}}
	solutionPath={[]}
	showSolutionUpdate={false}
/>
<div class="mt-8"></div>
<HowTo />
