import { applyCategoryDimensions, buildAutoDrawerHeights } from '../../../lib/config';
import { inferFrontMode } from '../../../engine';
import type { CabinetConfig, Category, FrontMode, Usage, WardrobeFronts, WardrobeLayout } from '../../../types';
import { Blurb, Field, type FormApi, ModeButton, Section, Select } from './shared';

const USAGE: { value: Usage; label: string }[] = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom / vanity' },
  { value: 'laundry', label: 'Laundry / utility' },
  { value: 'office', label: 'Office / study' },
  { value: 'living', label: 'Living / lounge' },
];

const PRESETS: Record<string, { label: string; apply: (c: CabinetConfig) => CabinetConfig }> = {
  hinged2: {
    label: '2-door hinged (1200)',
    apply: (c) => ({
      ...c, width: 1200, height: 2100, depth: 580,
      front: { mode: 'doors' },
      doors: { ...c.doors, count: 2 },
      wardrobe: {
        ...c.wardrobe, layout: 'single', fronts: 'hinged',
        sections: [{ width: 0, rails: 1, shelves: 2, drawers: 0 }, { width: 0, rails: 0, shelves: 4, drawers: 2 }],
      },
    }),
  },
  hinged4: {
    label: '4-door hinged (2000)',
    apply: (c) => ({
      ...c, width: 2000, height: 2400, depth: 600,
      front: { mode: 'doors' },
      doors: { ...c.doors, count: 4 },
      wardrobe: {
        ...c.wardrobe, layout: 'single', fronts: 'hinged',
        sections: [{ width: 0, rails: 1, shelves: 2, drawers: 0 }, { width: 0, rails: 2, shelves: 0, drawers: 0 }],
      },
    }),
  },
  sliding3: {
    label: '3-door sliding (2400)',
    apply: (c) => ({
      ...c, width: 2400, height: 2400, depth: 650,
      front: { mode: 'sliding' },
      wardrobe: {
        ...c.wardrobe, layout: 'single', fronts: 'sliding',
        sliding: { ...c.wardrobe.sliding, doorCount: 3 },
        sections: [
          { width: 0, rails: 1, shelves: 2, drawers: 0 },
          { width: 0, rails: 2, shelves: 0, drawers: 0 },
          { width: 0, rails: 0, shelves: 3, drawers: 3 },
        ],
      },
    }),
  },
  corner: {
    label: 'Corner L (hinged)',
    apply: (c) => ({
      ...c, width: 1800, height: 2400, depth: 600,
      front: { mode: 'doors' },
      doors: { ...c.doors, count: 3 },
      wardrobe: {
        ...c.wardrobe, layout: 'corner', fronts: 'hinged',
        legB: { ...c.wardrobe.legB, enabled: true, length: 1200 },
        legC: { ...c.wardrobe.legC, enabled: false },
      },
    }),
  },
  walkin: {
    label: 'Walk-in U (open)',
    apply: (c) => ({
      ...c, width: 2400, height: 2400, depth: 500,
      front: { mode: 'open' },
      wardrobe: {
        ...c.wardrobe, layout: 'walk-in', fronts: 'open',
        sections: [{ width: 0, rails: 1, shelves: 1, drawers: 0 }, { width: 0, rails: 2, shelves: 0, drawers: 0 }, { width: 0, rails: 0, shelves: 3, drawers: 3 }],
        legB: { ...c.wardrobe.legB, enabled: true, length: 1800 },
        legC: { ...c.wardrobe.legC, enabled: true, length: 1800 },
      },
    }),
  },
};

const FRONT_MODE_FOR: Record<WardrobeFronts, FrontMode> = { hinged: 'doors', sliding: 'sliding', open: 'open' };

export function TypeSection({ api }: { api: FormApi }) {
  const { config, emit, set, num } = api;
  const isWardrobe = config.category === 'wardrobe';
  const mode = inferFrontMode(config);

  const setCategory = (category: Category) => {
    let next = applyCategoryDimensions(config, category);
    next = { ...next, category, hasTop: category !== 'base' };
    if (category === 'wardrobe') {
      next = {
        ...next,
        usage: next.usage === 'kitchen' ? 'bedroom' : next.usage,
        front: { mode: FRONT_MODE_FOR[next.wardrobe.fronts] },
      };
    } else if (mode === 'sliding' || mode === 'open') {
      next = { ...next, front: { mode: 'doors' } };
    }
    if (inferFrontMode(next) === 'drawers') {
      const count = Math.max(1, next.drawers.count || 1);
      next = { ...next, drawers: { ...next.drawers, count, heights: buildAutoDrawerHeights(next, count) } };
    }
    emit(next);
  };

  const setFrontMode = (nextMode: 'doors' | 'drawers') => {
    const next = structuredClone(config);
    next.front = { ...next.front, mode: nextMode };
    if (nextMode === 'doors') {
      if ((next.doors?.count ?? 0) <= 0) next.doors.count = 2;
      if ((next.shelves?.count ?? 0) < 0) next.shelves.count = 0;
      if (next.shelves?.count == null) next.shelves.count = 2;
    } else {
      if ((next.drawers?.count ?? 0) <= 0) next.drawers.count = 3;
      if ((next.drawers?.heights?.length ?? 0) !== next.drawers.count) {
        next.drawers.heights = buildAutoDrawerHeights(next, next.drawers.count);
      }
    }
    emit(next);
  };

  const setFronts = (fronts: WardrobeFronts) => {
    emit({ ...config, front: { mode: FRONT_MODE_FOR[fronts] }, wardrobe: { ...config.wardrobe, fronts } });
  };

  const setLayout = (layout: WardrobeLayout) => {
    const w = structuredClone(config.wardrobe);
    w.layout = layout;
    w.legB.enabled = layout !== 'single';
    w.legC.enabled = layout === 'walk-in';
    let fronts = w.fronts;
    if (layout === 'walk-in' && fronts !== 'open') fronts = 'open';
    if (layout === 'corner' && fronts === 'open') fronts = 'hinged';
    w.fronts = fronts;
    emit({ ...config, front: { mode: FRONT_MODE_FOR[fronts] }, wardrobe: w });
  };

  return (
    <Section title="Cabinet Type" icon="fa-cube">
      <Field label="Category">
        <Select<Category>
          value={config.category}
          onChange={setCategory}
          options={[
            { value: 'base', label: 'Base' },
            { value: 'wall', label: 'Wall' },
            { value: 'tall', label: 'Tall' },
            { value: 'wardrobe', label: 'Wardrobe / bedroom cupboard' },
          ]}
        />
      </Field>
      <Field label="Room">
        <Select<Usage> value={config.usage ?? 'kitchen'} onChange={(value) => set('usage', value)} options={USAGE} />
      </Field>
      <Field label={isWardrobe ? 'Width (main run)' : 'Width'} unit="mm">{num('width', 0, { min: 50, step: 1 })}</Field>
      <Field label="Height" unit="mm">{num('height', 0, { min: 50, step: 1 })}</Field>
      <Field label="Depth" unit="mm">{num('depth', 0, { min: 50, step: 1 })}</Field>

      {isWardrobe ? (
        <>
          <Blurb>Start from a preset, then fine-tune the sections and fronts below.</Blurb>
          <Field label="Preset">
            <select
              value=""
              onChange={(event) => {
                const preset = PRESETS[event.target.value];
                if (preset) emit(preset.apply(config));
              }}
            >
              <option value="">Choose a preset…</option>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Layout">
            <Select<WardrobeLayout>
              value={config.wardrobe.layout}
              onChange={setLayout}
              options={[
                { value: 'single', label: 'Single run' },
                { value: 'corner', label: 'Corner (L-shape)' },
                { value: 'walk-in', label: 'Walk-in (open frame)' },
              ]}
            />
          </Field>
          {config.wardrobe.layout !== 'single' && (
            <Field label="Left return length" unit="mm">{num('wardrobe.legB.length', 1200, { min: 300, step: 10 })}</Field>
          )}
          {config.wardrobe.layout === 'walk-in' && (
            <>
              <Field label="Right return">
                <input
                  type="checkbox"
                  checked={config.wardrobe.legC.enabled}
                  onChange={(event) => set('wardrobe.legC.enabled', event.target.checked)}
                />
              </Field>
              {config.wardrobe.legC.enabled && (
                <Field label="Right return length" unit="mm">{num('wardrobe.legC.length', 1200, { min: 300, step: 10 })}</Field>
              )}
            </>
          )}
          <div className="mode-grid mode-grid-3">
            <ModeButton icon="fa-door-closed" title="Hinged" active={config.wardrobe.fronts === 'hinged'} onClick={() => setFronts('hinged')} />
            <ModeButton icon="fa-arrows-left-right" title="Sliding" active={config.wardrobe.fronts === 'sliding'} onClick={() => setFronts('sliding')} />
            <ModeButton icon="fa-border-none" title="Open" active={config.wardrobe.fronts === 'open'} onClick={() => setFronts('open')} />
          </div>
        </>
      ) : (
        <div className="mode-grid">
          <ModeButton icon="fa-door-closed" title="Doors" active={mode === 'doors'} onClick={() => setFrontMode('doors')} />
          <ModeButton icon="fa-box-open" title="Drawers" active={mode === 'drawers'} onClick={() => setFrontMode('drawers')} />
        </div>
      )}
    </Section>
  );
}
