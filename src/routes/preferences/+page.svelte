<script lang="ts">
	import {
		type PrefMap,
		PreferenceKeys,
		PreferenceStorageKeys,
		addPrefToStorage,
		checkStorageForPreferences
	} from '$lib';
	import Nav from '$lib/components/nav.svelte';
	import clsx from 'clsx';
	import { onMount } from 'svelte';

	let loading = true;
	let showNavModal = false;

	$: preferences = new Map() as PrefMap;

	onMount(() => {
		loading = false;

		preferences = checkStorageForPreferences(PreferenceKeys);
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
		<div class="w-full px-4">
			<h1 class="text-3xl">Preferences</h1>
		</div>
		<div class="mt-8 w-full border-b border-b-black/20 px-4 pb-4 dark:border-b-gray-100/30">
			<h2 class="text-lg text-amber-500">Game interface</h2>
			<p>Change the way stats show up in your game interface</p>
		</div>
		<div class="flex w-full flex-col">
			{#each Array.from(preferences.entries()) as [key, value], i}
				<div class="border-b border-b-black/20 p-4 dark:border-b-gray-100/30">
					<div class="flex items-center justify-between gap-1">
						<h3>{value.title}</h3>

						<div class="flex items-center">
							<button
								onclick={() => {
									const updatedPrefs = addPrefToStorage(key, preferences);

									preferences = updatedPrefs;
									localStorage.setItem(
										PreferenceStorageKeys.preferences,
										btoa(JSON.stringify([...updatedPrefs]))
									);
								}}
								aria-label="toggle-switch"
								class="relative flex h-1 w-8 items-center rounded bg-gray-200 hover:cursor-pointer dark:bg-white/50"
							>
								<span
									class={clsx(
										'absolute left-0 block h-4 w-4 rounded-full transition-all duration-300 ease-in-out',
										{
											'translate-x-0 bg-gray-400 dark:bg-white': !value.show,
											'translate-x-4 bg-amber-500': value.show
										}
									)}
								></span>
							</button>
						</div>
					</div>

					<p class="text-sm text-black/80 dark:text-white/80">{value.description}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
