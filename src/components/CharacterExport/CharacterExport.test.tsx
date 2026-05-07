import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterExport } from './CharacterExport';
import { CharacterProvider } from '../../character/CharacterProvider';
import { STORAGE_KEY } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';

function renderExport() {
  return render(
    <CharacterProvider>
      <CharacterExport />
    </CharacterProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CharacterExport', () => {
  it('is disabled when no character is loaded', () => {
    renderExport();
    expect(screen.getByRole('button', { name: /export character/i })).toBeDisabled();
  });

  it('triggers a download with the slugified filename and an object URL', async () => {
    const character = makeCharacter({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));

    const objectUrl = 'blob:vellum-test/abc';
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => objectUrl);
    const revokeObjectURL = vi.fn<(url: string) => void>();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderExport();
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /export character/i }));
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURL.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('application/json');

    const click = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(click.href).toBe(objectUrl);
    expect(click.download).toBe('seraphine-vellum.json');
    expect(click.rel).toBe('noopener');

    expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('does not initiate any network request', async () => {
    const character = makeCharacter();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));

    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: () => 'blob:noop',
      revokeObjectURL: () => {},
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderExport();
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /export character/i }));
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
  });
});
