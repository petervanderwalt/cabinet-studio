import { NumberInput } from '../NumberInput';
import { setPath } from './shared';
import { Blurb, Check, Field, type FormApi, InfoCard, Section, Select } from './shared';

export function ConstructionSection({ api }: { api: FormApi }) {
  const { config, emit, set, num } = api;
  const isWardrobe = config.category === 'wardrobe';
  return (
    <Section title="Construction" icon="fa-hammer">
      {!isWardrobe && (
        <Field label="Construction">
          <Select value={config.construction} onChange={(v) => set('construction', v)} options={[{ value: 'frameless', label: 'Frameless (32mm system)' }, { value: 'face-frame', label: 'Face-frame' }]} />
        </Field>
      )}
      <Check label="Full top panel (instead of stretchers)" checked={config.category !== 'base' || config.hasTop} onChange={(v) => set('hasTop', v)} />
      {!isWardrobe && (
        <Field label="Back mount">
          <Select value={config.backMount} onChange={(v) => set('backMount', v)} options={[{ value: 'grooved-in', label: 'Grooved-in (thin back)' }, { value: 'applied-rear', label: 'Applied rear (structural)' }]} />
        </Field>
      )}
      {isWardrobe && <InfoCard title="Back panels" text="Wardrobes use applied rear backs, split into panels no wider than 1200mm to fit a standard sheet." />}
      <Field label="Joinery">
        <Select
          value={config.jointing ?? 'cam-dowel'}
          onChange={(v) => set('jointing', v)}
          options={[
            { value: 'cam-dowel', label: 'Cam lock + dowel' },
            { value: 'confirmat', label: 'Confirmat screws' },
            { value: 'dowel', label: 'Glued dowels' },
            { value: 'screw', label: 'Screws only' },
          ]}
        />
      </Field>
      {!isWardrobe && config.construction === 'face-frame' && (
        <>
          <Field label="Face frame width (stile/rail)" unit="mm">
            <NumberInput
              value={config.materials.faceFrameWidth}
              onValue={(value) => {
                let next = setPath(config, 'materials.faceFrameWidth', value);
                if (value > 0) {
                  next = setPath(next, 'materials.topRailWidth', value);
                  next = setPath(next, 'materials.bottomRailWidth', value);
                }
                emit(next);
              }}
              min={10}
              step={1}
            />
          </Field>
          <Field label="Top rail width" unit="mm">{num('materials.topRailWidth', 38, { min: 10, step: 1 })}</Field>
          <Field label="Bottom rail width" unit="mm">{num('materials.bottomRailWidth', 38, { min: 10, step: 1 })}</Field>
        </>
      )}
    </Section>
  );
}

export function ToeKickSection({ api }: { api: FormApi }) {
  const { config, emit, set, num } = api;
  const enabled = config.toeKick.enabled ?? config.category === 'base';
  return (
    <Section title="Toe Kick" icon="fa-shoe-prints">
      <Check label="Toe kick / plinth" checked={enabled} onChange={(v) => set('toeKick.enabled', v)} />
      {enabled && (
        <>
          <Field label="Toe kick height" unit="mm">{num('toeKick.height', 100, { min: 0, step: 1 })}</Field>
          <Field label="Style">
            <Select
              value={config.toeKick.style ?? 'recessed'}
              onChange={(style) => emit({ ...config, toeKick: { ...config.toeKick, style, setback: style === 'flush' ? 0 : config.toeKick.setback || 75 } })}
              options={[{ value: 'recessed', label: 'Recessed' }, { value: 'flush', label: 'Flush with the front' }]}
            />
          </Field>
          {config.toeKick.style !== 'flush' && <Field label="Toe kick setback" unit="mm">{num('toeKick.setback', 75, { min: 0, step: 1 })}</Field>}
          <Field label="Adjustable legs (per run)">
            <NumberInput value={config.toeKick.feet ?? 4} onValue={(v) => set('toeKick.feet', Math.max(0, Math.trunc(v) || 0))} min={0} max={12} step={1} />
          </Field>
        </>
      )}
      {!enabled && <Blurb>Off: the cabinet sits straight on the floor or wall fixing.</Blurb>}
    </Section>
  );
}

export function OverlaySection({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  const rv = { top: config.overlay.topReveal ?? 3, bottom: config.overlay.bottomReveal ?? 3, side: config.overlay.sideReveal ?? (config.reveal ?? 3) / 2 };
  return (
    <Section title="Overlay & Reveal" icon="fa-border-top-left">
      <Field label="Overlay type">
        <Select value={config.overlay.type} onChange={(v) => set('overlay.type', v)} options={[{ value: 'full-overlay', label: 'Full overlay' }, { value: 'partial-overlay', label: 'Partial overlay' }, { value: 'inset', label: 'Inset' }]} />
      </Field>
      {config.overlay.type !== 'inset' && <Field label="Overlay amount" unit="mm">{num('overlay.amount', 18, { min: 0, step: 1 })}</Field>}
      <Field label="Reveal / gap between fronts" unit="mm">{num('reveal', 3, { min: 0, step: 0.5 })}</Field>
      <Field label="Top reveal" unit="mm"><NumberInput value={rv.top} onValue={(v) => set('overlay.topReveal', v)} min={0} step={0.5} /></Field>
      <Field label="Bottom reveal" unit="mm"><NumberInput value={rv.bottom} onValue={(v) => set('overlay.bottomReveal', v)} min={0} step={0.5} /></Field>
      <Field label="Outer side reveal" unit="mm"><NumberInput value={rv.side} onValue={(v) => set('overlay.sideReveal', v)} min={0} step={0.5} /></Field>
    </Section>
  );
}

export function ConsiderationsSection({ api }: { api: FormApi }) {
  const { config, set } = api;
  const isTall = config.category === 'tall' || config.category === 'wardrobe';
  const c = config.considerations;
  return (
    <Section title="Considerations" icon="fa-clipboard-check">
      <Field label="Wall fixing">
        <Select
          value={c.wallFixing}
          onChange={(v) => set('considerations.wallFixing', v)}
          options={[
            { value: 'none', label: 'None specified' },
            { value: 'anti-tip', label: 'Anti-tip bracket (tall / wardrobe)' },
            { value: 'hanging-rail', label: 'Hanging rail / cleat (wall units)' },
          ]}
        />
      </Field>
      <Field label="Ventilation">
        <Select value={c.ventilation} onChange={(v) => set('considerations.ventilation', v)} options={[{ value: 'none', label: 'None' }, { value: 'back-slots', label: 'Vent slots in the back' }]} />
      </Field>
      <Field label="Notes for the workshop">
        <textarea
          className="notes-input"
          rows={3}
          value={c.notes}
          placeholder="Grain direction, scribe allowances, wall obstacles…"
          onChange={(event) => set('considerations.notes', event.target.value)}
        />
      </Field>
      {isTall && c.wallFixing === 'none' && <InfoCard title="Safety" text={`Tall ${config.category === 'wardrobe' ? 'wardrobes' : 'cabinets'} should be fixed to the wall to prevent tipping.`} />}
    </Section>
  );
}

