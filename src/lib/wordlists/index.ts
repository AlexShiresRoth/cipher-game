import words10 from './words-10.json';
import words11 from './words-11.json';
import words12 from './words-12.json';
import words3 from './words-3.json';
import words4 from './words-4.json';
import words5 from './words-5.json';
import words6 from './words-6.json';
import words7 from './words-7.json';
import words8 from './words-8.json';
import words9 from './words-9.json';

export type WordListRecord = Record<number, { length: number; words: string[] }>;

export const WORD_LIST: WordListRecord = {
	3: words3,
	4: words4,
	5: words5,
	6: words6,
	7: words7,
	8: words8,
	9: words9,
	10: words10,
	11: words11,
	12: words12
};
