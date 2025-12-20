<script lang="ts">
	import Nav from '$lib/components/nav.svelte';
	import { onMount } from 'svelte';

	type PreferenceLayout = Record<string, string>;

    type PrefItem = {
        show: boolean;
        description:string;
        title: string;
    }

 

	const StorageKeys = {
		preferences: 'preferences'
	};

	const PreferenceKeys: PreferenceLayout = {
		showMoves: 'showMoves',
		showMistakes: 'showMistakes',
		showReps: 'showReps',
		showSolvable: 'showSolvable',
		showRank: 'showRank'
	};

 

	let loading = true;
	let showNavModal = false;

	$: preferences = new Map<string, PrefItem>();

	function checkStorageForPreferences(prefKeys: Record<string, string>) {
		const preferences = localStorage.getItem(StorageKeys.preferences);
		if (preferences) {
			const prefMap = new Map<string, boolean>();
			const prefStorageObject = JSON.parse(atob(preferences)) as Map<string, boolean>;
			Object.entries(PreferenceKeys).forEach(([key, value]) => {
				prefMap.set(key, prefStorageObject.get(key) || false);
			});

			return prefMap;
		} else {
			const newMap = new Map<string, boolean>();
			Object.entries(prefKeys).forEach(([key]) => {
				newMap.set(key, false);
			});

			return newMap;
		}
	}

	function addPrefToStorage(key: string) {}

	onMount(() => {
		loading = false;

		preferences = checkStorageForPreferences(PreferenceKeys);

		console.log(Array.from(preferences.entries()));
	});
</script>

<div class:hidden={loading} class="flex w-full flex-col">
	<Nav
		gameOver={false}
		{showNavModal}
		toggleModalOpen={() => {}}
		solvableAmt={0}
		moveAmount={0}
		emoji={''}
		mistakeAmount={0}
		replenishAmt={0}
		showHome
	/>

	<div class="flex w-full flex-col items-center py-8">
		<h1 class="text-3xl">Preferences</h1>
		<div>{#each Array.from(preferences.entries())}</div>
	</div>
</div>
