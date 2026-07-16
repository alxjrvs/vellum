import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StatTrack } from './StatTrack';
import { daggerheartSystem } from '../../systems/daggerheart.system';

function pipsOf(label: string) {
  return within(screen.getByRole('group', { name: new RegExp(`${label} pips`, 'i') })).getAllByRole(
    'button'
  );
}

function slotsOf(label: string) {
  return within(
    screen.getByRole('group', { name: new RegExp(`${label} slots`, 'i') })
  ).getAllByRole('button');
}

function heartsOf(label: string) {
  return within(
    screen.getByRole('group', { name: new RegExp(`${label} hearts`, 'i') })
  ).getAllByRole('button');
}

function sectionOf(label: string) {
  return screen.getByRole('region', { name: new RegExp(`^${label}$`) });
}

describe('StatTrack — pip shape (level interaction, default)', () => {
  it('renders trackLength pips with the first currentValue filled and the rest empty', () => {
    render(<StatTrack label="Hope" trackLength={daggerheartSystem.hope.max} currentValue={4} />);
    const pips = pipsOf('Hope');
    expect(pips).toHaveLength(6);
    expect(pips.filter((p) => p.dataset.state === 'filled')).toHaveLength(4);
    expect(pips.filter((p) => p.dataset.state === 'empty')).toHaveLength(2);
  });

  it('tags the section with data-shape="pip" and data-interaction="level" by default', () => {
    render(<StatTrack label="Hope" trackLength={6} currentValue={2} />);
    const section = sectionOf('Hope');
    expect(section.dataset.shape).toBe('pip');
    expect(section.dataset.interaction).toBe('level');
  });

  it('reads out the filled count over the track length', () => {
    render(<StatTrack label="Hope" trackLength={6} currentValue={4} />);
    expect(sectionOf('Hope').querySelector('.stat-track__count')).toHaveTextContent('4/6');
  });

  it('labels each pip with its position, state, and noun', () => {
    render(<StatTrack label="Hope" trackLength={6} currentValue={2} />);
    const pips = pipsOf('Hope');
    expect(pips[0]).toHaveAttribute('aria-label', 'Hope pip 1 filled');
    expect(pips[2]).toHaveAttribute('aria-label', 'Hope pip 3 empty');
  });
});

describe('StatTrack — cumulative "fill behind" rule (level interaction)', () => {
  it('clicking an empty position sets the dial to that position + 1 (filling everything behind it)', () => {
    const onSetValue = vi.fn();
    render(
      <StatTrack
        label="Hope"
        trackLength={6}
        currentValue={2}
        interaction="level"
        onSetValue={onSetValue}
      />
    );
    // Click the 4th pip (index 3) on a dial currently at 2 → fills 1..4.
    fireEvent.click(pipsOf('Hope')[3]);
    expect(onSetValue).toHaveBeenCalledWith(4);
  });

  it('clicking the current topmost filled position steps the dial down by one', () => {
    const onSetValue = vi.fn();
    render(
      <StatTrack
        label="Hope"
        trackLength={6}
        currentValue={2}
        interaction="level"
        onSetValue={onSetValue}
      />
    );
    // Click the 2nd pip (index 1), which is the current top (currentValue=2) → step down to 1.
    fireEvent.click(pipsOf('Hope')[1]);
    expect(onSetValue).toHaveBeenCalledWith(1);
  });

  it('clicking a filled position below the top raises the dial to that position + 1', () => {
    const onSetValue = vi.fn();
    render(
      <StatTrack
        label="Hope"
        trackLength={6}
        currentValue={4}
        interaction="level"
        onSetValue={onSetValue}
      />
    );
    // index 1 is filled but not the top (top is index 3) → sets dial to 2.
    fireEvent.click(pipsOf('Hope')[1]);
    expect(onSetValue).toHaveBeenCalledWith(2);
  });
});

describe('StatTrack — box shape (toggle interaction)', () => {
  it('renders trackLength slots; marked indices reflect markedSlots', () => {
    render(
      <StatTrack
        label="Armor"
        shape="box"
        interaction="toggle"
        trackLength={daggerheartSystem.hpClassTable.bard}
        currentValue={2}
        markedSlots={[0, 1]}
        onToggleSlot={() => {}}
      />
    );
    const slots = slotsOf('Armor');
    expect(slots).toHaveLength(6);
    expect(slots[0].dataset.state).toBe('marked');
    expect(slots[1].dataset.state).toBe('marked');
    expect(slots[2].dataset.state).toBe('unmarked');
  });

  it('tags the section with data-shape="box" and data-interaction="toggle"', () => {
    render(
      <StatTrack
        label="Armor"
        shape="box"
        interaction="toggle"
        trackLength={3}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={() => {}}
      />
    );
    const section = sectionOf('Armor');
    expect(section.dataset.shape).toBe('box');
    expect(section.dataset.interaction).toBe('toggle');
  });

  it('fires onToggleSlot with the clicked slot index (independent toggle, not cumulative)', () => {
    const onToggleSlot = vi.fn();
    render(
      <StatTrack
        label="Stress"
        shape="box"
        interaction="toggle"
        trackLength={daggerheartSystem.stress.advancementMax}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={onToggleSlot}
      />
    );
    fireEvent.click(slotsOf('Stress')[3]);
    expect(onToggleSlot).toHaveBeenCalledWith(3);
  });

  it('Armor toggles each slot independently — clicking a middle slot marks only that index', () => {
    const onToggleSlot = vi.fn();
    render(
      <StatTrack
        label="Armor"
        shape="box"
        interaction="toggle"
        trackLength={3}
        currentValue={1}
        markedSlots={[0]}
        onToggleSlot={onToggleSlot}
      />
    );
    // Clicking the last slot (index 2) toggles exactly index 2 — no "fill behind".
    fireEvent.click(slotsOf('Armor')[2]);
    expect(onToggleSlot).toHaveBeenCalledWith(2);
    expect(onToggleSlot).toHaveBeenCalledTimes(1);
  });

  it('reads out the marked count over the track length (Armor 1 of 3 → 1/3)', () => {
    render(
      <StatTrack
        label="Armor"
        shape="box"
        interaction="toggle"
        trackLength={3}
        currentValue={1}
        markedSlots={[0]}
        onToggleSlot={() => {}}
      />
    );
    expect(sectionOf('Armor').querySelector('.stat-track__count')).toHaveTextContent('1/3');
  });

  it('tags slot buttons with data-threshold at the configured Major/Severe positions', () => {
    render(
      <StatTrack
        label="HP"
        shape="box"
        interaction="toggle"
        trackLength={6}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={() => {}}
        thresholds={{ major: 2, severe: 4 }}
      />
    );
    const all = slotsOf('HP');
    expect(all[1].dataset.threshold).toBe('major');
    expect(all[3].dataset.threshold).toBe('severe');
    expect(all[0].dataset.threshold).toBeUndefined();
    expect(all[2].dataset.threshold).toBeUndefined();
  });

  it('names the threshold slot in its aria-label', () => {
    render(
      <StatTrack
        label="HP"
        shape="box"
        interaction="toggle"
        trackLength={6}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={() => {}}
        thresholds={{ major: 2, severe: 4 }}
      />
    );
    expect(slotsOf('HP')[1]).toHaveAttribute('aria-label', 'HP slot 2 unmarked (major threshold)');
  });

  it('combines into a single major-severe marker when both thresholds resolve to the same slot', () => {
    render(
      <StatTrack
        label="HP"
        shape="box"
        interaction="toggle"
        trackLength={4}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={() => {}}
        thresholds={{ major: 2, severe: 2 }}
      />
    );
    expect(slotsOf('HP')[1].dataset.threshold).toBe('major-severe');
  });

  it('renders Armor with 0 / 3 / 4 slot configurations from system config', () => {
    for (const armorType of ['unarmored', 'gambeson', 'chainmail'] as const) {
      const expected = daggerheartSystem.armorTable[armorType];
      const { unmount } = render(
        <StatTrack
          label={`Armor-${armorType}`}
          shape="box"
          interaction="toggle"
          trackLength={expected}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
        />
      );
      const slots = within(
        screen.getByRole('group', { name: new RegExp(`Armor-${armorType} slots`, 'i') })
      ).queryAllByRole('button');
      expect(slots).toHaveLength(expected);
      unmount();
    }
  });
});

describe('StatTrack — heart shape (level interaction)', () => {
  it('renders hearts; a damaged (filled) count of 2 leaves 2 empty and the rest full', () => {
    render(
      <StatTrack label="HP" shape="heart" interaction="level" trackLength={6} currentValue={2} />
    );
    const hearts = heartsOf('HP');
    expect(hearts).toHaveLength(6);
    // filled = damaged = data-state "empty"; unfilled = healthy = data-state "full".
    expect(hearts.filter((h) => h.dataset.state === 'empty')).toHaveLength(2);
    expect(hearts.filter((h) => h.dataset.state === 'full')).toHaveLength(4);
    expect(hearts.every((h) => h.querySelector('svg.stat-track__heart-glyph'))).toBe(true);
  });

  it('reads out health remaining (trackLength - currentValue) over the track length', () => {
    render(
      <StatTrack label="HP" shape="heart" interaction="level" trackLength={6} currentValue={2} />
    );
    expect(sectionOf('HP').querySelector('.stat-track__count')).toHaveTextContent('4/6');
  });

  it('labels hearts with full/empty wording', () => {
    render(
      <StatTrack label="HP" shape="heart" interaction="level" trackLength={6} currentValue={2} />
    );
    const hearts = heartsOf('HP');
    expect(hearts[0]).toHaveAttribute('aria-label', 'HP heart 1 empty');
    expect(hearts[5]).toHaveAttribute('aria-label', 'HP heart 6 full');
  });

  it('clicking a heart drives onSetValue cumulatively', () => {
    const onSetValue = vi.fn();
    render(
      <StatTrack
        label="HP"
        shape="heart"
        interaction="level"
        trackLength={6}
        currentValue={0}
        onSetValue={onSetValue}
      />
    );
    fireEvent.click(heartsOf('HP')[2]);
    expect(onSetValue).toHaveBeenCalledWith(3);
  });
});

describe('StatTrack — generic re-use across stats', () => {
  it('renders Daggerheart tracks (Hope/HP/Stress/Fear/Armor) from one component', () => {
    render(
      <>
        <StatTrack label="Hope" trackLength={6} currentValue={2} />
        <StatTrack label="HP" shape="heart" interaction="level" trackLength={6} currentValue={0} />
        <StatTrack
          label="Stress"
          shape="box"
          interaction="toggle"
          trackLength={12}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
        />
        <StatTrack label="Fear" trackLength={12} currentValue={4} />
        <StatTrack
          label="Armor"
          shape="box"
          interaction="toggle"
          trackLength={3}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
        />
      </>
    );
    expect(screen.getByRole('region', { name: /^Hope$/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^HP$/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^Stress$/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^Fear$/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^Armor$/ })).toBeInTheDocument();
  });

  it('renders a hypothetical second-system pip track via the same props (zero new component code)', () => {
    render(<StatTrack label="Momentum" trackLength={5} currentValue={3} />);
    const pips = pipsOf('Momentum');
    expect(pips).toHaveLength(5);
    expect(pips.filter((p) => p.dataset.state === 'filled')).toHaveLength(3);
  });
});
