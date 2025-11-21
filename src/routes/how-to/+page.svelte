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
</svelte:head>

<Nav {showNavModal} showHome toggleModalOpen={() => {}} />

<HowTo />
