import type { CharacterState } from './types';

export interface ExportPayload {
  readonly blob: Blob;
  readonly filename: string;
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'character';
}

export function exportCharacter(character: CharacterState): ExportPayload {
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `${slugify(character.identity.name)}-vellum.json`;
  return { blob, filename };
}
