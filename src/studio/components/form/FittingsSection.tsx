import { autoSelection, liftFrontWeight } from '../../../fittings/autoSelect';
import { ALL_FAMILIES, familiesForSlot, usableVariants, getFamily, getVariant, partsForChoice, SLOT_LABELS, type FittingSlot } from '../../../fittings/registry';
import type { FittingChoiceConfig } from '../../../types';
import { inferFrontMode } from '../../../engine';
import { Blurb, Check, Field, type FormApi, InfoCard, Section } from './shared';

function dimText(value: unknown): string {
  return Array.isArray(value) ? value.join(', ') : String(value);
}

function SlotPicker({ slot, api }: { slot: FittingSlot; api: FormApi }) {
  const { config, set } = api;
  const families = familiesForSlot(slot);
  if (families.length === 0) return null;
  const choice = (config.fittings?.[slot] ?? null) as FittingChoiceConfig | null;
  const family = getFamily(choice?.familyId);
  const variant = getVariant(choice?.familyId, choice?.variantId);
  const parts = partsForChoice(choice, slot);

  const pickFamily = (familyId: string) => {
    if (!familyId) return set(`fittings.${slot}`, null);
    const next = getFamily(familyId);
    const first = next ? usableVariants(next)[0] : undefined;
    if (!next || !first) return;
    set(`fittings.${slot}`, { familyId, variantId: first.id, selection: autoSelection(slot, first, config), includeAccessories: false });
  };
  const pickVariant = (variantId: string) => {
    const next = getVariant(choice?.familyId, variantId);
    if (!choice || !next) return;
    set(`fittings.${slot}`, { ...choice, variantId, selection: autoSelection(slot, next, config) });
  };
  const pickOption = (key: string, raw: string) => {
    if (!choice || !variant) return;
    const allowed = variant.choices[key] ?? [];
    const value = allowed.find((entry) => String(entry) === raw) ?? raw;
    set(`fittings.${slot}`, { ...choice, selection: { ...choice.selection, [key]: value } });
  };

  const dims = variant ? Object.entries(variant.dims).slice(0, 10) : [];

  return (
    <div className="fitting-slot">
      <div className="fitting-slot-title">{SLOT_LABELS[slot]}</div>
      <Field label="Range">
        <select value={choice?.familyId ?? ''} onChange={(event) => pickFamily(event.target.value)}>
          <option value="">Generic (no catalogue fitting)</option>
          {families.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.brand} {entry.name}</option>
          ))}
        </select>
      </Field>
      {family && variant && choice && (
        <>
          {usableVariants(family).length > 1 && (
            <Field label="Variant">
              <select value={choice.variantId} onChange={(event) => pickVariant(event.target.value)}>
                {usableVariants(family).map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            </Field>
          )}
          {Object.entries(variant.choices).map(([key, values]) => (
            <Field key={key} label={labelFor(key)}>
              {values.length > 1 ? (
                <select value={String(choice.selection[key] ?? values[0])} onChange={(event) => pickOption(key, event.target.value)}>
                  {values.map((value) => (
                    <option key={String(value)} value={String(value)}>{String(value)}</option>
                  ))}
                </select>
              ) : (
                <span className="fitting-fixed">{String(values[0])}</span>
              )}
            </Field>
          ))}
          {slot === 'lift' && <LiftHint api={api} />}
          <Check label="Include optional accessories" checked={Boolean(choice.includeAccessories)} onChange={(v) => set(`fittings.${slot}`, { ...choice, includeAccessories: v })} />

          {parts.length > 0 && (
            <div className="fitting-parts">
              {parts.map((part) => (
                <div className="fitting-part" key={`${part.role}-${part.partNo}-${JSON.stringify(part.when ?? {})}`}>
                  <strong>{part.partNo}</strong>
                  <span>{part.description}{part.qty && part.qty > 1 ? ` ×${part.qty}` : ''}</span>
                </div>
              ))}
            </div>
          )}
          {dims.length > 0 && (
            <details className="fitting-dims">
              <summary>Planning data (catalogue p.{variant.pages.join(', ')})</summary>
              {dims.map(([key, spec]) => (
                <div className="fitting-dim" key={key} title={spec.meaning}>
                  <span>{spec.meaning}</span>
                  <strong>{dimText(spec.value)}{spec.unit ? ` ${spec.unit}` : ''}</strong>
                </div>
              ))}
            </details>
          )}
          {variant.notes && variant.notes.length > 0 && (
            <details className="fitting-dims">
              <summary>Catalogue notes ({variant.notes.length})</summary>
              {variant.notes.map((note) => (
                <p className="fitting-note" key={note}>{note}</p>
              ))}
            </details>
          )}
        </>
      )}
    </div>
  );
}

function LiftHint({ api }: { api: FormApi }) {
  const { weightKg, heightMm, widthMm } = liftFrontWeight(api.config);
  const lf = api.config.height * weightKg;
  return (
    <InfoCard
      title="Front weight estimate"
      text={`Front ${widthMm.toFixed(0)} × ${heightMm.toFixed(0)}mm in ${api.config.materials.doorMaterial}: about ${weightKg.toFixed(1)}kg, power factor LF ≈ ${lf.toFixed(0)} (cabinet height × front weight). The matching power band is pre-selected; check it against the catalogue before ordering.`}
    />
  );
}

const CHOICE_LABELS: Record<string, string> = {
  nominalLength: 'Nominal length (mm)',
  capacityKg: 'Load capacity (kg)',
  colour: 'Colour',
  version: 'Version',
  height: 'Height',
};

function labelFor(key: string): string {
  return CHOICE_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export function FittingsSection({ api }: { api: FormApi }) {
  const { config } = api;
  const mode = inferFrontMode(config);
  const isWardrobe = config.category === 'wardrobe';
  const hasDrawers = mode === 'drawers' || (isWardrobe && [config.wardrobe.sections, config.wardrobe.legB.sections, config.wardrobe.legC.sections].flat().some((s) => s.drawers > 0));
  const hasDoors = isWardrobe ? config.wardrobe.fronts === 'hinged' : mode === 'doors';
  const slots: FittingSlot[] = [
    ...(hasDoors ? (['hinge', 'hingePlate'] as FittingSlot[]) : []),
    ...(hasDrawers ? (['drawerSystem', 'drawerMotion', 'divider'] as FittingSlot[]) : []),
    ...(hasDoors ? (['doorMotion'] as FittingSlot[]) : []),
    ...(hasDoors && !isWardrobe ? (['lift', 'pocket'] as FittingSlot[]) : []),
  ];

  return (
    <Section title="Catalogue Fittings" icon="fa-toolbox">
      <Blurb>
        Choose manufacturer fittings from the Blum catalogue data ({ALL_FAMILIES.length} ranges loaded). Their part numbers go into the Hardware list.
        The Blum CLIP top 110° with exact drilling is under Hardware → Hinges.
      </Blurb>
      {slots.length === 0 && <InfoCard title="No slots" text="Add drawers or doors to choose fittings for them." />}
      {slots.map((slot) => (
        <SlotPicker key={slot} slot={slot} api={api} />
      ))}
    </Section>
  );
}
