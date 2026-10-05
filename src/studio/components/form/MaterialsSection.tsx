import { CARCASS_STOCKS, EDGE_BAND_COLOURS, EDGE_BAND_THICKNESSES, FRONT_STOCKS, MATERIAL_GROUPS, MIRROR_TYPES, REAR_STOCKS } from '../../../engine';
import { formatPanelNumber } from '../../../lib/format';
import type { MaterialGroup, StockOption } from '../../../types';
import { Blurb, Field, type FormApi, InfoCard, Section } from './shared';

function StockSelect({ value, options, onChange, inheritLabel }: { value: string; options: StockOption[]; onChange: (label: string) => void; inheritLabel?: string }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {inheritLabel && <option value="">{inheritLabel}</option>}
      {options.map((stock) => (
        <option key={stock.label} value={stock.label}>
          {stock.label} · {formatPanelNumber(stock.thickness)}mm
        </option>
      ))}
    </select>
  );
}

export function MaterialsSection({ api }: { api: FormApi }) {
  const { config, set } = api;
  const m = config.materials;
  const isWardrobe = config.category === 'wardrobe';
  const hasDrawers = config.front.mode === 'drawers' || (isWardrobe && [config.wardrobe.sections, config.wardrobe.legB.sections, config.wardrobe.legC.sections].flat().some((s) => s.drawers > 0));
  const hasToeKick = (config.toeKick.enabled ?? config.category === 'base') && config.toeKick.height > 0;
  const mirrored = config.doors.mirror !== 'none';

  const groupRows: MaterialGroup[] = [
    'shelves',
    ...(hasDrawers ? (['drawerBox', 'drawerFront'] as MaterialGroup[]) : []),
    ...(hasToeKick ? (['plinth'] as MaterialGroup[]) : []),
    ...(isWardrobe ? (['divider'] as MaterialGroup[]) : []),
    ...(isWardrobe && config.wardrobe.fronts === 'sliding' ? (['sliding'] as MaterialGroup[]) : []),
  ];

  const setOverride = (group: MaterialGroup, label: string) => {
    const next = { ...(m.overrides ?? {}) };
    if (label) next[group] = label;
    else delete next[group];
    set('materials.overrides', next);
  };

  return (
    <Section title="Materials" icon="fa-layer-group">
      <Blurb>Pick the main boards first; other parts follow them unless you choose a different stock.</Blurb>
      <Field label="Carcass">
        <StockSelect value={m.caseMaterial} options={CARCASS_STOCKS} onChange={(v) => set('materials.caseMaterial', v)} />
      </Field>
      <Field label="Rear panel">
        <StockSelect value={m.backMaterial} options={REAR_STOCKS} onChange={(v) => set('materials.backMaterial', v)} />
      </Field>
      <Field label={isWardrobe && config.wardrobe.fronts === 'sliding' ? 'Doors / fronts' : 'Doors & fronts'}>
        <StockSelect value={m.frontMaterial || m.doorMaterial} options={FRONT_STOCKS} onChange={(v) => set('materials.frontMaterial', v)} />
      </Field>

      {groupRows.map((group) => {
        const info = MATERIAL_GROUPS[group];
        return (
          <Field key={group} label={info.label}>
            <StockSelect
              value={m.overrides?.[group] ?? ''}
              options={info.stocks}
              inheritLabel={`Same as ${info.parent === 'carcass' ? 'carcass' : 'doors & fronts'}`}
              onChange={(v) => setOverride(group, v)}
            />
          </Field>
        );
      })}

      {mirrored && (
        <Field label="Mirror type">
          <StockSelect value={m.mirrorType} options={MIRROR_TYPES} onChange={(v) => set('materials.mirrorType', v)} />
        </Field>
      )}

      <Field label="Edge band colour">
        <select value={m.edgeBand?.colour ?? 'match'} onChange={(event) => set('materials.edgeBand.colour', event.target.value)}>
          {EDGE_BAND_COLOURS.map((colour) => (
            <option key={colour.label} value={colour.label}>{colour.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Edge band thickness">
        <select value={String(m.edgeBand?.thickness ?? 1)} onChange={(event) => set('materials.edgeBand.thickness', Number(event.target.value))}>
          {EDGE_BAND_THICKNESSES.map((t) => (
            <option key={t} value={String(t)}>{t}mm {t === 0.4 ? '(light duty)' : t === 2 ? '(heavy duty)' : ''}</option>
          ))}
        </select>
      </Field>
      <InfoCard title="Nesting" text="Each stock and thickness is nested on its own sheets, so mixing boards adds sheet groups in the Nesting tab." />
    </Section>
  );
}
