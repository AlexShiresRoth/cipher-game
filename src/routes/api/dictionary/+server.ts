import { DICTIONARY_API_KEY } from '$env/static/private';

export const GET = async ({ url }) => {
	try {
		const word = new URL(url).searchParams.get('word');
		if (!word) {
			return new Response(JSON.stringify({ valid: false }), { status: 400 });
		}

		const res = await fetch(
			`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${DICTIONARY_API_KEY}`
		);

		const data = await res.json();

		// If first entry is a string, this means it's suggestions
		if (typeof data[0] === 'string') {
			return new Response(JSON.stringify({ valid: false }), { status: 200 });
		}

		// if there are multiple meanings, the api provides example:1 as
		const id = data[0]?.meta?.id?.split(':')[0];

		const isValid = id === word || data[0]?.meta?.stems?.includes(word);

		return new Response(JSON.stringify({ valid: Boolean(isValid) }), {
			status: 200
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ valid: false, error }), {
			status: 500
		});
	}
};
