import { StorageKeys } from './constants';

/**
 * @param keys
 * @description get a list of things from local storage based on provided keys
 */
export function getItemsFromStorage(keys: string[]) {
	return keys.map((key) => localStorage.getItem(key));
}

/**
 *
 * @param items
 * @description setter utility for local storage
 */
export function setItemsInStorage(items: { key: string; value: string }[]) {
	return items.forEach((item) => localStorage.setItem(item.key, item.value));
}

/**
 *
 * @param items
 * @description removes items in local storage by keys
 */
export function removeItemsInStorage(items: string[]) {
	return items.forEach((item) => localStorage.removeItem(item));
}

/**
 *
 * @param json
 * @description helper function to parse json
 */
export function parseJSON(json: string) {
	return JSON.parse(json);
}

/**
 *
 * @param json
 * @description stringifies that json, boi
 */
export function stringifyJSON(json: unknown) {
	return JSON.stringify(json);
}

/**
 *
 * @param exceptions
 * @description resets local storage to default game state but
 * keeps some params that should persist across games
 */
export function removeLocalStorageItemsWithExceptions(exceptions: string[]) {
	return Object.entries(StorageKeys).forEach(([key, value]) => {
		if (!exceptions.includes(value)) {
			localStorage.removeItem(key);
		}
	});
}
