import { describe, expect, it } from 'vitest';
import { exportCharacter } from './exportCharacter';
import { parseCharacterJson } from './parseCharacter';
import { makeCharacter } from './fixtures';

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('FileReader did not return a string'));
    reader.readAsText(blob);
  });
}

describe('exportCharacter', () => {
  it('produces a JSON blob and a slugified filename', async () => {
    const character = makeCharacter({
      identity: { name: 'Seraphine the Bold', class: 'Bard', ancestry: 'Elf' },
    });
    const { blob, filename } = exportCharacter(character);

    expect(blob.type).toBe('application/json');
    expect(filename).toBe('seraphine-the-bold-vellum.json');
    const text = await readBlobAsText(blob);
    expect(JSON.parse(text)).toEqual(character);
  });

  it('falls back to "character" when the name has no usable characters', () => {
    const character = makeCharacter({
      identity: { name: '???', class: 'Bard', ancestry: 'Elf' },
    });
    expect(exportCharacter(character).filename).toBe('character-vellum.json');
  });

  it('round-trips through parseCharacterJson without loss', async () => {
    const character = makeCharacter({
      identity: { name: 'Lyra', class: 'Bard', ancestry: 'Elf', subclass: 'Wordsmith', level: 3 },
      stats: {
        hope: 4,
        hp: [1, 1, 0, 0, 0, 0],
        stress: [1, 0, 0, 0, 0, 0],
        armorSlots: [1, 0, 0],
      },
    });
    const { blob } = exportCharacter(character);
    const text = await readBlobAsText(blob);

    const result = parseCharacterJson(text);
    expect(result).toEqual({ ok: true, character });
  });
});
