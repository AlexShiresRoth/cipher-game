<script lang="ts">
	import HowTo from '$lib/components/how-to.svelte';
	import Nav from '$lib/components/nav.svelte';
	let showNavModal = false;
</script>

<Nav {showNavModal} showHome toggleModalOpen={() => {}} />

<HowTo />
