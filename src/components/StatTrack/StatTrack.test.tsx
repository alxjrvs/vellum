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

describe('StatTrack — pip mode', () => {
  it('renders trackLength pips with the first currentValue filled and the rest empty', () => {
    render(
      <StatTrack
        label="Hope"
        trackLength={daggerheartSystem.hope.max}
        currentValue={4}
        onIncrement={() => {}}
      />
    );
    const pips = pipsOf('Hope');
    expect(pips).toHaveLength(6);
    expect(pips.filter((p) => p.dataset.state === 'filled')).toHaveLength(4);
    expect(pips.filter((p) => p.dataset.state === 'empty')).toHaveLength(2);
  });

  it('fires onIncrement when any pip is clicked when only onIncrement is supplied', () => {
    const onIncrement = vi.fn();
    render(<StatTrack label="Hope" trackLength={6} currentValue={2} onIncrement={onIncrement} />);
    fireEvent.click(pipsOf('Hope')[0]);
    fireEvent.click(pipsOf('Hope')[5]);
    expect(onIncrement).toHaveBeenCalledTimes(2);
  });

  it('routes click on empty pip to onIncrement and click on filled pip to onDecrement when both supplied', () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    render(
      <StatTrack
        label="Hope"
        trackLength={6}
        currentValue={4}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
    );
    fireEvent.click(pipsOf('Hope')[4]);
    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).not.toHaveBeenCalled();

    fireEvent.click(pipsOf('Hope')[3]);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });
});

describe('StatTrack — slot mode (presence of markedSlots)', () => {
  it('renders trackLength slots; marked indices reflect markedSlots', () => {
    render(
      <StatTrack
        label="HP"
        trackLength={daggerheartSystem.hpClassTable.bard}
        currentValue={2}
        markedSlots={[0, 1]}
        onToggleSlot={() => {}}
        onIncrement={() => {}}
      />
    );
    const slots = slotsOf('HP');
    expect(slots).toHaveLength(6);
    expect(slots[0].dataset.state).toBe('marked');
    expect(slots[1].dataset.state).toBe('marked');
    expect(slots[2].dataset.state).toBe('unmarked');
  });

  it('clicking a slot without onToggleSlot does NOT fall back to onIncrement', () => {
    const onIncrement = vi.fn();
    render(
      <StatTrack
        label="HP"
        trackLength={3}
        currentValue={0}
        markedSlots={[]}
        onIncrement={onIncrement}
      />
    );
    fireEvent.click(slotsOf('HP')[0]);
    expect(onIncrement).not.toHaveBeenCalled();
  });

  it('fires onToggleSlot with the clicked slot index', () => {
    const onToggleSlot = vi.fn();
    render(
      <StatTrack
        label="Stress"
        trackLength={daggerheartSystem.stress.advancementMax}
        currentValue={0}
        markedSlots={[]}
        onToggleSlot={onToggleSlot}
        onIncrement={() => {}}
      />
    );
    fireEvent.click(slotsOf('Stress')[3]);
    expect(onToggleSlot).toHaveBeenCalledWith(3);
  });

  it('renders Armor with 0 / 3 / 4 slot configurations from system config', () => {
    for (const armorType of ['unarmored', 'gambeson', 'chainmail'] as const) {
      const expected = daggerheartSystem.armorTable[armorType];
      const { unmount } = render(
        <StatTrack
          label={`Armor-${armorType}`}
          trackLength={expected}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
          onIncrement={() => {}}
        />
      );
      const slots = expected
        ? slotsOf(`Armor-${armorType}`)
        : within(
            screen.getByRole('group', { name: new RegExp(`Armor-${armorType} slots`, 'i') })
          ).queryAllByRole('button');
      expect(slots).toHaveLength(expected);
      unmount();
    }
  });
});

describe('StatTrack — generic re-use across stats', () => {
  it('renders all five Daggerheart tracks (Hope/HP/Stress/Fear/Armor) from one component', () => {
    render(
      <>
        <StatTrack label="Hope" trackLength={6} currentValue={2} onIncrement={() => {}} />
        <StatTrack
          label="HP"
          trackLength={6}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
          onIncrement={() => {}}
        />
        <StatTrack
          label="Stress"
          trackLength={12}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
          onIncrement={() => {}}
        />
        <StatTrack label="Fear" trackLength={12} currentValue={4} onIncrement={() => {}} />
        <StatTrack
          label="Armor"
          trackLength={3}
          currentValue={0}
          markedSlots={[]}
          onToggleSlot={() => {}}
          onIncrement={() => {}}
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
    render(<StatTrack label="Momentum" trackLength={5} currentValue={3} onIncrement={() => {}} />);
    const pips = pipsOf('Momentum');
    expect(pips).toHaveLength(5);
    expect(pips.filter((p) => p.dataset.state === 'filled')).toHaveLength(3);
  });
});
