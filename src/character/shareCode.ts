import { parseCharacterJson, type ParseResult } from './parseCharacter';
import type { CharacterState } from './types';

/**
 * Encode a character into a URL-safe share parameter.
 *
 * The compact (non-pretty) JSON is UTF-8 encoded so Unicode names round-trip,
 * then base64url-encoded: standard base64 with `+`→`-`, `/`→`_`, and `=` padding
 * stripped. The result is safe to drop straight into a `?c=` query string.
 */
export function encodeCharacterToShareParam(character: CharacterState): string {
  const json = JSON.stringify(character);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a `?c=` share parameter back into a {@link ParseResult}.
 *
 * Reverses the base64url encoding, UTF-8 decodes the bytes, and hands the JSON
 * string to {@link parseCharacterJson} for validation + version-checking. Never
 * throws: any malformed input resolves to the `{ ok: false, error }` shape.
 */
export function decodeShareParam(param: string): ParseResult {
  try {
    let base64 = param.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding === 1) {
      return { ok: false, error: 'Share link is malformed.' };
    }
    if (padding > 0) {
      base64 += '='.repeat(4 - padding);
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return parseCharacterJson(json);
  } catch {
    return { ok: false, error: 'Share link is malformed.' };
  }
}
