/**
 *
 * @params swaps cipherId emoji moveAmount replenishAmt
 * @desc this handles the display in SMS messages when player completes and
 * wants to share results
 */
export async function shareResultsAction({
	swaps,
	cipherId,
	emoji,
	moveAmount,
	replenishAmt
}: {
	swaps: boolean[];
	cipherId: string;
	moveAmount: number;
	replenishAmt: number;
	emoji: string;
}) {
	function getRows() {
		let rows: boolean[][] = [];
		for (let i = 0; i < swaps.length; i += 4) {
			rows.push(swaps.slice(i, i + 4));
		}
		return rows;
	}

	const rows = getRows();
	const rowsText = rows
		.map((row) => {
			return row.map((b) => (b ? '🧩' : '❌')).join('');
		})
		.join('\n');
	const shareText = `Cipher #${cipherId} ${emoji}
${moveAmount} moves
${rowsText}
${replenishAmt} reps used`.trim();

	const shareData = {
		text: shareText,
		title: `Cipher #${cipherId}`,
		url: 'https://play-cipher.com'
	};

	const canNativeShare =
		typeof navigator !== 'undefined' &&
		'navigator' in window &&
		typeof navigator.share === 'function';

	try {
		if (canNativeShare) {
			await navigator.share(shareData);
		} else {
			await navigator.clipboard.writeText(shareData.text);
			alert('copied to clipboard!');
		}
	} catch (error) {
		console.info('Player aborted share');
	}
}
