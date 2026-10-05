import { NumberInput } from '../NumberInput';
import { inferFrontMode } from '../../../engine';
import type { WardrobeSection } from '../../../types';
import { Blurb, Check, Field, type FormApi, InfoCard, Section, Select } from './shared';

export function InteriorSection({ api }: { api: FormApi }) {
  const { config } = api;
  if (config.category === 'wardrobe') return <WardrobeInterior api={api} />;
  if (inferFrontMode(config) !== 'doors') return null;
  return <GenericInterior api={api} />;
}

function ShelfFields({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  return (
    <>
      <Field label="Shelf thickness" unit="mm">
        <NumberInput
          value={config.shelves.thickness ?? config.materials.shelfThickness ?? config.materials.caseThickness}
          onValue={(v) => set('shelves.thickness', v > 0 ? v : null)}
          min={9}
          step={1}
        />
      </Field>
      <Field label="Shelf front setback" unit="mm">{num('shelves.inset', 0, { min: 0, step: 1 })}</Field>
      <Check label="Fixed shelves (no pin holes)" checked={Boolean(config.shelves.fixed)} onChange={(v) => set('shelves.fixed', v)} />
    </>
  );
}

function GenericInterior({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  return (
    <Section title="Interior" icon="fa-grip-lines-vertical">
      <Blurb>Choose how much shelf storage you want inside the cabinet.</Blurb>
      <Field label="Number of shelves">
        <NumberInput value={config.shelves?.count ?? 1} onValue={(v) => set('shelves.count', Math.trunc(v) || 0)} min={0} max={20} step={1} />
      </Field>
      <ShelfFields api={api} />
      <Check label="Hanging rail" checked={Boolean(config.interior.rail.enabled)} onChange={(v) => set('interior.rail.enabled', v)} />
      {config.interior.rail.enabled && (
        <Field label="Rail drop from top" unit="mm">{num('interior.rail.drop', 60, { min: 30, step: 5 })}</Field>
      )}
    </Section>
  );
}

function SectionEditor({ title, path, sections, api }: { title: string; path: string; sections: WardrobeSection[]; api: FormApi }) {
  const { set } = api;
  const update = (index: number, patch: Partial<WardrobeSection>) =>
    set(path, sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  const remove = (index: number) => set(path, sections.filter((_, i) => i !== index));
  const add = () => set(path, [...sections, { width: 0, rails: 0, shelves: 3, drawers: 0 }]);

  return (
    <div className="section-editor">
      <div className="section-editor-title">{title}</div>
      <div className="section-editor-head">
        <span>#</span>
        <span>Width</span>
        <span>Rails</span>
        <span>Shelves</span>
        <span>Drawers</span>
        <span />
      </div>
      {sections.map((section, i) => (
        <div className="section-editor-row" key={i}>
          <span>{i + 1}</span>
          <NumberInput value={section.width} onValue={(v) => update(i, { width: Math.max(0, v) })} min={0} step={10} title="Interior width (0 = share the rest equally)" />
          <Select value={section.rails} onChange={(v) => update(i, { rails: v })} options={[{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }]} />
          <NumberInput value={section.shelves} onValue={(v) => update(i, { shelves: Math.max(0, Math.trunc(v) || 0) })} min={0} max={20} step={1} />
          <NumberInput value={section.drawers} onValue={(v) => update(i, { drawers: Math.max(0, Math.min(8, Math.trunc(v) || 0)) })} min={0} max={8} step={1} />
          <button type="button" className="icon-btn" aria-label={`Remove section ${i + 1}`} disabled={sections.length <= 1} onClick={() => remove(i)}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="drawer-auto-btn" onClick={add}>
        <i className="fa-solid fa-plus" aria-hidden="true" />
        <span>Add section</span>
      </button>
    </div>
  );
}

function WardrobeInterior({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  const w = config.wardrobe;
  return (
    <Section title="Interior" icon="fa-grip-lines-vertical">
      <Blurb>
        Each section sits between dividers. Drawers stack from the floor, shelves fill the middle, and hanging rails sit at the top. Width 0 shares the
        remaining width equally.
      </Blurb>
      <SectionEditor title="Main run" path="wardrobe.sections" sections={w.sections} api={api} />
      {w.layout !== 'single' && w.legB.enabled && (
        <SectionEditor title="Left return" path="wardrobe.legB.sections" sections={w.legB.sections} api={api} />
      )}
      {w.layout === 'walk-in' && w.legC.enabled && (
        <SectionEditor title="Right return" path="wardrobe.legC.sections" sections={w.legC.sections} api={api} />
      )}
      <Field label="Long-hang height (1 rail)" unit="mm">{num('wardrobe.hangingHeight', 1700, { min: 600, step: 10 })}</Field>
      <Field label="Half-hang height (2 rails)" unit="mm">{num('wardrobe.halfHangHeight', 950, { min: 500, step: 10 })}</Field>
      <Field label="Rail drop from top" unit="mm">{num('wardrobe.railDrop', 60, { min: 30, step: 5 })}</Field>
      <Field label="Rail tube diameter" unit="mm">{num('wardrobe.railDiameter', 25, { min: 15, step: 1 })}</Field>
      <Field label="Internal drawer height" unit="mm">{num('wardrobe.drawerHeight', 180, { min: 80, step: 5 })}</Field>
      <ShelfFields api={api} />
      <InfoCard title="Sizing tip" text="Allow ~1700mm for dresses, ~950mm per rail for shirts and trousers, and 450–600mm interior depth for hanging." />
    </Section>
  );
}
