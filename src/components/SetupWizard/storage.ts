export const ONBOARDED_STORAGE_KEY = 'vellum:onboarded';

/**
 * Whether the first-run setup wizard has already been completed or dismissed.
 * Global to the overlay (not tied to a character) so it survives reloads and
 * reaches the OBS browser source, mirroring the ticker's persistence shape.
 */
export function readOnboardedFromStorage(
  storage: Pick<Storage, 'getItem'> = localStorage
): boolean {
  return storage.getItem(ONBOARDED_STORAGE_KEY) === 'true';
}

export function writeOnboardedToStorage(
  onboarded: boolean,
  storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage
): void {
  if (onboarded) storage.setItem(ONBOARDED_STORAGE_KEY, 'true');
  else storage.removeItem(ONBOARDED_STORAGE_KEY);
}
