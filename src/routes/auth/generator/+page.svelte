<script lang="ts">
	import { shuffle } from '$lib/logic';
	import clsx from 'clsx';

	const letterAmt = 8;
	let inputs: HTMLInputElement[] = [];
	let word: string[] = [];
	let cipher: string[] = [];
	let date: string = '';
	let isLoading: boolean = false;

	function handleInput(i: number, value: string) {
		const el = inputs[i];

		if (el.value.length > 1) {
			el.value = el.value.slice(0, 1);
		}

		if (el.value && i < inputs.length - 1) {
			inputs[i + 1].focus();
		}

		cipher[i] = value;
		word[i] = value;
	}

	function handleKeydown(i: number, e: KeyboardEvent) {
		// If Backspace on empty field → go to previous
		if (e.key === 'Backspace' && !inputs[i].value && i > 0) {
			inputs[i - 1].focus();
			cipher[i - 1] = '';
			word[i - 1] = '';
		}
	}

	function handleDate(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		date = e.currentTarget.value;
	}

	async function submit() {
		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				body: JSON.stringify({
					word: word.join(''),
					cipher: cipher.join(''),
					date
				})
			});

			if (res.ok) {
				word = [];
				cipher = [];
				date = '';
			}
		} catch (error) {
			console.error('error', error);
		}
	}

	$: () => {
		(inputs, cipher, date, isLoading);
	};
</script>

<main class="flex w-full flex-col items-center justify-center py-16">
	<div class="flex w-11/12 flex-col justify-between gap-8 md:w-1/2">
		<h1 class="text-3xl">Generate a new puzzle</h1>
		<form class="flex w-full flex-col gap-12" on:submit={submit}>
			<div class="flex min-h-24 flex-col gap-2">
				<h2 class="text-xl">Cipher</h2>
				<div class="grid grid-cols-8 items-center gap-2">
					{#if cipher.length > 0}
						{#each cipher.filter((l) => l !== '') as letter, i}
							<button
								data-index={i}
								type="button"
								class={clsx('border-2 p-2 text-center text-xl uppercase md:text-3xl', {
									'border-white text-white': letter !== word[i],
									'border-emerald-500 text-emerald-500': letter === word[i]
								})}
							>
								{letter}
							</button>
						{/each}
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h2 class="text-xl">Puzzle Word</h2>
				<div class="grid grid-cols-8 items-center gap-2">
					{#each Array(letterAmt) as _, i}
						<input
							type="text"
							name={`letter-${i}`}
							maxlength="1"
							bind:this={inputs[i]}
							on:keydown={(e) => handleKeydown(i, e)}
							class="border-0 border-b-2 border-b-black text-center text-xl uppercase transition-colors focus:border-b-amber-300 focus:outline-0 md:text-3xl dark:border-b-white"
							on:input={(e) => handleInput(i, e.currentTarget.value)}
						/>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h2 class="text-xl">Puzzle Date</h2>
				<input
					type="date"
					on:change={(e) => handleDate(e)}
					value={date}
					class="border-b-2 p-2 uppercase focus:outline-0"
				/>
			</div>

			<div class="flex items-center justify-between gap-4">
				{#if cipher.length > 0}
					<button
						type="button"
						class="rounded bg-indigo-500 p-2 text-black"
						on:click={() => {
							cipher = shuffle(cipher.join('')).split('');
						}}>Shuffle</button
					>
					<button class="rounded bg-emerald-500 p-2 text-black" type="submit" on:submit={submit}
						>Submit</button
					>
				{/if}
			</div>
		</form>
	</div>
</main>
