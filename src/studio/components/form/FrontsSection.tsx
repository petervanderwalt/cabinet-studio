import { NumberInput } from '../NumberInput';
import { buildAutoDrawerHeights, openingHeight } from '../../../lib/config';
import { inferFrontMode } from '../../../engine';
import type { HingeSide, SlideType } from '../../../types';
import { Blurb, Check, Field, type FormApi, InfoCard, Section, Select } from './shared';

const MIRROR = [
  { value: 'none', label: 'No mirror' },
  { value: 'first', label: 'First door' },
  { value: 'last', label: 'Last door' },
  { value: 'all', label: 'All doors' },
] as const;

const OPEN_ANGLES = [
  { value: 95, label: '95° (standard)' },
  { value: 110, label: '110° (wide)' },
  { value: 155, label: '155° (extra wide)' },
  { value: 170, label: '170° (full)' },
];

export function FrontsSection({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  const mode = inferFrontMode(config);

  if (mode === 'drawers' && config.category !== 'wardrobe') return <DrawerSection api={api} />;

  if (config.category === 'wardrobe') {
    const fronts = config.wardrobe.fronts;
    if (fronts === 'open') {
      return (
        <Section title="Fronts" icon="fa-border-none">
          <InfoCard title="Open wardrobe" text="No doors are generated. Hanging rails, shelves and drawers are visible; add lighting below to show them off." />
        </Section>
      );
    }
    if (fronts === 'sliding') {
      const s = config.wardrobe.sliding;
      return (
        <Section title="Sliding Doors" icon="fa-arrows-left-right">
          <Blurb>Doors run on two staggered tracks and overlap so you can reach every section.</Blurb>
          <Field label="Number of doors">
            <NumberInput value={s.doorCount} onValue={(v) => set('wardrobe.sliding.doorCount', Math.max(2, Math.min(5, Math.trunc(v) || 2)))} min={2} max={5} step={1} />
          </Field>
          <Field label="Door overlap" unit="mm">{num('wardrobe.sliding.overlap', 25, { min: 10, step: 1 })}</Field>
          <Field label="Track system">
            <Select value={s.track} onChange={(v) => set('wardrobe.sliding.track', v)} options={[{ value: 'top-hung', label: 'Top-hung (clean floor)' }, { value: 'bottom-rolling', label: 'Bottom-rolling (heavy doors)' }]} />
          </Field>
          <Field label="Top track allowance" unit="mm">{num('wardrobe.sliding.topTrack', 35, { min: 10, step: 1 })}</Field>
          <Field label="Bottom track allowance" unit="mm">{num('wardrobe.sliding.bottomTrack', 20, { min: 5, step: 1 })}</Field>
          <Check label="Soft-close dampers" checked={s.softClose} onChange={(v) => set('wardrobe.sliding.softClose', v)} />
          <Field label="Mirror">
            <Select value={config.doors.mirror} onChange={(v) => set('doors.mirror', v)} options={[...MIRROR]} />
          </Field>
        </Section>
      );
    }
  }

  return (
    <Section title="Door Configuration" icon="fa-door-open">
      <Blurb>
        {config.category === 'wardrobe'
          ? 'Hinged wardrobe doors split the width evenly; keep each under about 600mm.'
          : 'Choose the door layout that suits this cabinet.'}
      </Blurb>
      {config.category === 'wardrobe' ? (
        <Field label="Number of doors">
          <NumberInput value={config.doors.count} onValue={(v) => set('doors.count', Math.max(1, Math.min(8, Math.trunc(v) || 1)))} min={1} max={8} step={1} />
        </Field>
      ) : (
        <Field label="Door layout">
          <Select value={Math.max(1, Math.min(2, config.doors.count || 2))} onChange={(v) => set('doors.count', v)} options={[{ value: 1, label: '1 door' }, { value: 2, label: '2 doors' }]} />
        </Field>
      )}
      <Field label="Hinge side">
        <Select<HingeSide>
          value={config.doors.hingeSide}
          onChange={(v) => set('doors.hingeSide', v)}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'both', label: 'Both (one each)' },
          ]}
        />
      </Field>
      <Field label="Opening angle">
        <Select value={config.doors.openAngle} onChange={(v) => set('doors.openAngle', v)} options={OPEN_ANGLES} />
      </Field>
      <Field label="Mirror">
        <Select value={config.doors.mirror} onChange={(v) => set('doors.mirror', v)} options={[...MIRROR]} />
      </Field>
    </Section>
  );
}

function DrawerSection({ api }: { api: FormApi }) {
  const { config, emit, set, num } = api;
  const count = config.drawers.count || 0;
  const heights = config.drawers.heights;

  const setCount = (raw: number) => {
    const value = Math.max(1, Math.trunc(raw) || 1);
    const next = structuredClone(config);
    next.drawers.count = value;
    if (next.drawers.heights.length !== value) next.drawers.heights = buildAutoDrawerHeights(next, value);
    emit(next);
  };

  const target = Math.max(0, openingHeight(config) - (count > 0 ? (count - 1) * (config.reveal ?? 3) : 0));
  const diff = target - heights.reduce((a, b) => a + b, 0);
  const fits = Math.abs(diff) < 1;
  const indices = Array.from({ length: count }, (_, i) => count - 1 - i);

  return (
    <Section title="Drawer Configuration" icon="fa-box-open">
      <Blurb>Set how many drawers you want and how the front is divided.</Blurb>
      <Field label="Drawer count">
        <NumberInput value={config.drawers.count} onValue={setCount} min={1} max={10} step={1} />
      </Field>
      <Field label="Drawer front heights">
        <div className="drawer-heights">
          {indices.map((idx) => (
            <div className="drawer-height-row" key={idx}>
              <span>#{idx + 1}: </span>
              <NumberInput
                className="drawer-height-input"
                value={heights[idx] ?? 100}
                onValue={(value) => {
                  const nextHeights = [...heights];
                  nextHeights[idx] = value;
                  set('drawers.heights', nextHeights);
                }}
                min={30}
                step={1}
              />
              <span className="unit">mm</span>
            </div>
          ))}
          {count > 0 && (
            <div className="drawer-summary-row">
              <span className="drawer-summary" style={{ color: fits ? '#487a57' : '#b16a07' }}>
                {fits
                  ? `Drawer fronts fit. Target total: ${target}mm`
                  : diff > 0
                    ? `Add ${diff}mm more across the drawer fronts. Target total: ${target}mm`
                    : `Reduce drawer fronts by ${Math.abs(diff)}mm total. Target total: ${target}mm`}
              </span>
              <button type="button" className="drawer-auto-btn" onClick={() => set('drawers.heights', buildAutoDrawerHeights(config, count))}>
                <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                <span>Auto</span>
              </button>
            </div>
          )}
        </div>
      </Field>
      <Field label="Side/back thickness" unit="mm">{num('drawers.sideThickness', 12, { min: 3, max: 25, step: 1 })}</Field>
      <Field label="Bottom thickness" unit="mm">{num('drawers.bottomThickness', 6, { min: 3, max: 25, step: 1 })}</Field>
      <Field label="Drawer slide thickness" unit="mm">{num('drawers.sideClearance', 10, { min: 3, max: 30, step: 0.5 })}</Field>
      <Field label="Runner type">
        <Select<SlideType>
          value={config.drawers.slideType ?? 'standard'}
          onChange={(v) => set('drawers.slideType', v)}
          options={[
            { value: 'standard', label: 'Full extension' },
            { value: 'soft-close', label: 'Soft-close' },
            { value: 'push-open', label: 'Push-open (tip-on)' },
          ]}
        />
      </Field>
    </Section>
  );
}
