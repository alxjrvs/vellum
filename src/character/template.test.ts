import { describe, expect, it } from 'vitest';
import { parseCharacterJson } from './parseCharacter';

/*
 * AC #1 of issue #23: characters built from the canonical template
 * must produce a valid Vellum character that imports without manual
 * correction. This test loads the operator-facing template at
 * characters/template.character.json and asserts parseCharacterJson
 * accepts it. If the schema or parser changes, this fails — forcing
 * the template to stay in sync.
 */
const templateJson = await import('../../characters/template.character.json', {
  with: { type: 'json' },
}).then((m) => JSON.stringify(m.default));

describe('characters/template.character.json', () => {
  it('parses as a valid Daggerheart character via parseCharacterJson', () => {
    const result = parseCharacterJson(templateJson);
    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.character.system).toBe('daggerheart');
      expect(result.character.identity.name).toBe('REPLACE_ME');
      expect(result.character.slotCounts.hp).toBe(6);
    }
  });
});
