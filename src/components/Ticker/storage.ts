export const TICKER_STORAGE_KEY = 'vellum:ticker';

/** The ticker text is global to the overlay (not tied to a character). */
export function readTickerFromStorage(storage: Pick<Storage, 'getItem'> = localStorage): string {
  return storage.getItem(TICKER_STORAGE_KEY) ?? '';
}

export function writeTickerToStorage(
  text: string,
  storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage
): void {
  if (text) storage.setItem(TICKER_STORAGE_KEY, text);
  else storage.removeItem(TICKER_STORAGE_KEY);
}
