<script lang="ts">
	import { page } from '$app/state';
	import {
		type PrefMap,
		PreferenceKeys,
		PreferenceStorageKeys,
		URLS,
		addPrefToStorage,
		checkStorageForPreferences
	} from '$lib';
	import Nav from '$lib/components/nav.svelte';
	import clsx from 'clsx';
	import { onMount } from 'svelte';

	let loading = true;
	let showNavModal = false;
	let prefs = new Map() as PrefMap;
	let isDev = false;

	$: preferences = prefs;

	function resetGameAndPreferences() {
		localStorage.clear();

		prefs = checkStorageForPreferences(PreferenceKeys);
	}

	onMount(() => {
		loading = false;

		prefs = checkStorageForPreferences(PreferenceKeys);
		isDev = page.url.origin === URLS.dev;
	});
</script>

<div class:hidden={loading} class="flex w-full flex-col">
	<Nav
		gameOver={false}
		{showNavModal}
		toggleModalOpen={() => {}}
		solvableAmt={0}
		moveAmount={0}
		emoji=""
		mistakeAmount={0}
		replenishAmt={0}
		showHome
		solutionPath={['']}
		word=""
		puzzleData={null}
		guesses={[]}
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
			{#each Array.from(preferences.entries()) as [key, value] (value)}
				<div class="border-b border-b-black/20 p-4 dark:border-b-gray-100/30">
					<div class="flex items-center justify-between gap-1">
						<h3>{value.title}</h3>

						<div class="flex items-center">
							<button
								onclick={() => {
									const updatedPrefs = addPrefToStorage(key, preferences);

									prefs = updatedPrefs;
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
			{#if isDev}
				<div
					class="flex flex-col gap-2 border-b border-b-black/20 bg-red-500/20 p-4 dark:border-b-gray-100/30"
				>
					<p class="text-sm text-black/80 dark:text-white/80">
						This will reset your game and preferences to the default settings. This will also clear
						your game history and reset your progress.
					</p>
					<div>
						<button
							onclick={resetGameAndPreferences}
							class="rounded bg-red-500 p-2 text-xs text-white transition-colors hover:cursor-pointer hover:bg-red-500/50"
							>Reset Game & Preferences</button
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
