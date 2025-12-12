export function shuffle(word: string) {
	const arr = word.split('');
	const n = arr.length;

	const shuffled = [...arr];

	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	for (let i = 0; i < n; i++) {
		if (shuffled[i] === arr[i]) {
			const swapWith = i === n - 1 ? i - 1 : i + 1;
			[shuffled[i], shuffled[swapWith]] = [shuffled[swapWith], shuffled[i]];
		}
	}

	return shuffled.join('');
}
