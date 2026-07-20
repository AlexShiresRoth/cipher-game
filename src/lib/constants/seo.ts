import { URLS } from './url';

export const SITE_URL = URLS.prod;
export const SITE_NAME = 'Cipher';
export const DEFAULT_TITLE = 'CIPHER – Daily Word-Shuffle Puzzle';
export const DEFAULT_DESCRIPTION =
	'Play Cipher, the daily interactive word-shuffle puzzle game. Decipher the shuffled word using clever moves, swapping mechanics, and logic-based strategy.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function absoluteUrl(path = '/') {
	if (path.startsWith('http')) return path;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
}
