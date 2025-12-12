import type { WordListRecord } from '$lib/wordlists';

export function getDictionaryForLength(len: number, wordlist: WordListRecord): Set<string> {
	if (len > 2 && len < 13) return new Set(wordlist[len].words);
	throw new Error(`No dictionary available for length ${len}`);
}
