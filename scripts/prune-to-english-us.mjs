/**
 * Keep only words that appear in the American English Hunspell dictionary
 * (LibreOffice en_US), with all affix expansions applied. This removes
 * tournament-Scrabble loanwords and non-English entries that are not in
 * standard US English spelling lexicons.
 *
 * Prerequisite: lists are already restricted to TWL (see prune-to-twl.mjs).
 *
 * To regenerate en_US_expanded.txt (requires network for npx on first run):
 *   curl -fsSL -o scripts/data/en_US.dic https://raw.githubusercontent.com/LibreOffice/dictionaries/master/en/en_US.dic
 *   curl -fsSL -o scripts/data/en_US.aff https://raw.githubusercontent.com/LibreOffice/dictionaries/master/en/en_US.aff
 *   npx hunspell-reader@9 words -l -u -o scripts/data/en_US_expanded.txt scripts/data/en_US.dic
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "data");
const wordlistsDir = join(__dirname, "../src/lib/wordlists");

const english = new Set();
for (const line of readFileSync(join(dataDir, "en_US_expanded.txt"), "utf8").split(/\n/)) {
	const w = line.trim().toLowerCase();
	if (w && /^[a-z]{2,15}$/.test(w)) english.add(w);
}

let totalRemoved = 0;
for (const name of readdirSync(wordlistsDir)) {
	if (!/^words-\d+\.json$/.test(name)) continue;
	const path = join(wordlistsDir, name);
	const data = JSON.parse(readFileSync(path, "utf8"));
	const before = data.words.length;
	data.words = data.words.filter((w) => {
		if (english.has(w)) return true;
		totalRemoved++;
		return false;
	});
	if (data.words.length !== before) {
		writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
		console.log(`${name}: ${before} → ${data.words.length} (-${before - data.words.length})`);
	}
}
console.log(`Total removed: ${totalRemoved}`);
