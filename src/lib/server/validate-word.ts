import { DICTIONARY_API_KEY } from '$env/static/private';
import { WORD_LIST } from '$lib/wordlists';

export async function validateWord(word: string): Promise<boolean> {
	// check if word is in our word list
	if (WORD_LIST[word.length]?.words?.findIndex((w) => w === word) === 0) {
		console.log('word is is not in our word list', word);
		return false;
	}
	// check if word is in dictionary api
	const res = await fetch(
		`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${DICTIONARY_API_KEY}`
	);

	const data = await res.json();

	// If first entry is a string, this means it's suggestions
	if (typeof data[0] === 'string') {
		console.log('word is not in dictionary', word);
		return false;
	}

	// if there are multiple meanings, the api provides example:1 as
	const id = data[0]?.meta?.id?.split(':')[0];

	return id === word || data[0]?.meta?.stems?.includes(word);
}
