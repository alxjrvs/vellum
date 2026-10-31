import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CharacterProvider } from '../character/CharacterProvider';
import { FramePicker } from '../components/FramePicker';
import { HudRegion } from '../components/HudRegion';
import { SystemProvider } from '../systems/SystemProvider';
import { daggerheartSystem } from '../systems/daggerheart.system';
import { validateFrame } from '../themes/frameRules';
import { daggerheartTheme } from '../themes/daggerheart.theme';
import { ThemeContext } from '../themes/ThemeContext';
import { useSourceQuery } from '../sourceLink/useSourceQuery';
import {
  CUSTOM_FRAMES_KEY,
  decodeFrameParam,
  encodeFrameParam,
  parseFrame,
  readCustomFrames,
} from './customFrames';
import { FrameProvider } from './FrameProvider';
import { useFrame } from './useFrame';

const mine = { ...daggerheartTheme, id: 'custom-mine', label: 'Mine', origin: 'custom' as const };

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  document.documentElement.removeAttribute('style');
});

describe('parseFrame', () => {
  it('accepts a well-formed frame and makes it a custom frame', () => {
    const parsed = parseFrame({ ...daggerheartTheme, id: 'gold', regions: { dice: 'top-left' } });
    expect(parsed).toMatchObject({
      id: 'custom-gold',
      origin: 'custom',
      regions: { dice: 'top-left' },
    });
  });

  it.each([
    ['a non-hex color', { colors: { ...daggerheartTheme.colors, plate: 'red' } }],
    [
      'a url() in a token',
      { typography: { ...daggerheartTheme.typography, fontFamilyBody: 'url(x)' } },
    ],
    ['a CSS break-out', { layout: { ...daggerheartTheme.layout, edgeWidth: '1px; color: red' } }],
    ['an unknown slot', { regions: { dice: 'center' } }],
    ['a point off the stage', { regions: { dice: { x: 2400, y: 10 } } }],
    ['a point that is not a number', { regions: { dice: { x: '10', y: 10 } } }],
    ['an unknown widget', { regions: { ticker: 'top-left' } }],
    ['a missing track', { tracks: { hp: 'bar' } }],
    ['an empty name', { label: '  ' }],
    ['an unknown system', { system: 'pathfinder' }],
  ])('rejects %s', (_, patch) => {
    expect(parseFrame({ ...daggerheartTheme, ...patch })).toBeNull();
  });

  it('keeps a hand-placed widget, rounded to whole pixels', () => {
    const parsed = parseFrame({ ...daggerheartTheme, regions: { dice: { x: 400.4, y: 700 } } });
    expect(parsed?.regions).toEqual({ dice: { x: 400, y: 700 } });
  });

  it('round-trips through a link parameter', () => {
    expect(decodeFrameParam(encodeFrameParam(mine))).toEqual(mine);
    expect(decodeFrameParam('not base64!')).toBeNull();
  });
});

describe('frame layout', () => {
  it('flags two widgets in one slot', () => {
    expect(validateFrame({ ...daggerheartTheme, regions: { dice: 'top-left' } })).toContain(
      'vitals and dice both sit at top-left'
    );
  });

  it('mirrors widgets placed on the right', () => {
    const { container } = render(
      <ThemeContext.Provider value={{ ...daggerheartTheme, regions: { dice: 'middle-right' } }}>
        <HudRegion widget="dice">x</HudRegion>
        <HudRegion widget="vitals">y</HudRegion>
      </ThemeContext.Provider>
    );
    const [dice, vitals] = container.querySelectorAll('.hud__region');
    expect(dice).toHaveAttribute('data-slot', 'middle-right');
    expect(dice).toHaveAttribute('data-side', 'right');
    expect(vitals).toHaveAttribute('data-slot', 'top-left');
    expect(vitals).not.toHaveAttribute('data-side');
  });

  it('places a hand-placed widget by point and mirrors it right of center', () => {
    const { container } = render(
      <ThemeContext.Provider
        value={{
          ...daggerheartTheme,
          regions: { dice: { x: 1500, y: 600 }, vitals: { x: 960, y: 0 } },
        }}
      >
        <HudRegion widget="dice">x</HudRegion>
        <HudRegion widget="vitals">y</HudRegion>
      </ThemeContext.Provider>
    );
    const [dice, vitals] = container.querySelectorAll<HTMLElement>('.hud__region');
    expect(dice).toHaveAttribute('data-slot', 'free');
    expect(dice).toHaveAttribute('data-side', 'right');
    expect(dice.style.getPropertyValue('--region-x')).toBe('1500px');
    expect(dice.style.getPropertyValue('--region-y')).toBe('600px');
    expect(vitals).not.toHaveAttribute('data-side');
  });
});

function Active() {
  const { frame } = useFrame();
  return <span aria-label="active">{frame.id}</span>;
}

function Query() {
  return <span aria-label="query">{useSourceQuery()}</span>;
}

function renderPicker() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CharacterProvider>
          <Active />
          <Query />
          <FramePicker />
        </CharacterProvider>
      </FrameProvider>
    </SystemProvider>
  );
}

describe('My frames', () => {
  it('makes a frame from the active one, checks the rules, and saves it', () => {
    renderPicker();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    const creator = screen.getByRole('dialog', { name: 'Frame creator' });
    fireEvent.change(within(creator).getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Gilded' },
    });
    fireEvent.click(
      within(within(creator).getByRole('radiogroup', { name: 'HP' })).getByLabelText('Bar')
    );

    fireEvent.click(within(creator).getByRole('button', { name: 'Save frame' }));
    expect(screen.queryByRole('dialog', { name: 'Frame creator' })).toBeNull();
    const saved = readCustomFrames();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      label: 'Gilded',
      origin: 'custom',
      tracks: { hp: 'bar' },
    });
    expect(screen.getByLabelText('active')).toHaveTextContent(saved[0].id);
    expect(screen.getByRole('radiogroup', { name: 'My frames' })).toHaveTextContent('Gilded');
    // One of My frames isn't bundled, so a copied OBS link carries it.
    expect(screen.getByLabelText('query').textContent).toContain('frameData=');
  });

  it('deletes one of My frames and falls back to an official one', () => {
    localStorage.setItem(CUSTOM_FRAMES_KEY, JSON.stringify([mine]));
    localStorage.setItem('vellum:frame', 'custom-mine');
    renderPicker();
    expect(screen.getByLabelText('active')).toHaveTextContent('custom-mine');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByLabelText('active')).toHaveTextContent('daggerheart');
    expect(readCustomFrames()).toEqual([]);
  });

  it('wears and keeps a frame carried in a link', () => {
    window.history.replaceState({}, '', `/?frameData=${encodeFrameParam(mine)}`);
    renderPicker();
    expect(screen.getByLabelText('active')).toHaveTextContent('custom-mine');
    expect(readCustomFrames().map((f) => f.id)).toEqual(['custom-mine']);
  });

  function importFile(file: File) {
    const input = screen.getByLabelText('Import');
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    return act(async () => {
      fireEvent.change(input);
    });
  }

  it('refuses a file that is not a frame', async () => {
    renderPicker();
    await importFile(new File(['{"nope":1}'], 'x.json', { type: 'application/json' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent("isn't a Vellum frame")
    );
  });

  it('imports a frame file and wears it', async () => {
    renderPicker();
    await importFile(new File([JSON.stringify(mine)], 'mine.json'));
    await waitFor(() => expect(screen.getByLabelText('active')).toHaveTextContent('custom-mine'));
    expect(readCustomFrames().map((f) => f.id)).toEqual(['custom-mine']);
  });
});
