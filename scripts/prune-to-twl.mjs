/**
 * Keep only words in the North American Scrabble tournament list (TWL06).
 * This drops obscure technical/latin/specialist entries that would not appear
 * in a typical newspaper word game (Wordle / Spelling Bee use similar lexicons).
 *
 * Data: scripts/data/TWL06.txt
 * Source: https://raw.githubusercontent.com/cviebrock/wordlists/master/TWL06.txt
 *
 * After this, run prune-to-english-us.mjs to remove foreign / Scrabble-only
 * loanwords using the American English Hunspell lexicon (expanded).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "data");
const wordlistsDir = join(__dirname, "../src/lib/wordlists");

const twl = new Set();
const raw = readFileSync(join(dataDir, "TWL06.txt"), "utf8");
for (const line of raw.split(/\n/)) {
	const w = line.trim().toLowerCase();
	if (w && /^[a-z]{2,15}$/.test(w)) twl.add(w);
}

let totalRemoved = 0;
for (const name of readdirSync(wordlistsDir)) {
	if (!/^words-\d+\.json$/.test(name)) continue;
	const path = join(wordlistsDir, name);
	const data = JSON.parse(readFileSync(path, "utf8"));
	const before = data.words.length;
	data.words = data.words.filter((w) => {
		if (twl.has(w)) return true;
		totalRemoved++;
		return false;
	});
	if (data.words.length !== before) {
		writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
		console.log(`${name}: ${before} → ${data.words.length} (-${before - data.words.length})`);
	}
}
console.log(`Total removed: ${totalRemoved}`);
