import { NumberInput } from '../NumberInput';
import { Blurb, Check, Field, type FormApi, InfoCard, Section, Select } from './shared';

const ZONES: { key: keyof FormApi['config']['lighting']['zones']; label: string }[] = [
  { key: 'underside', label: 'Under the cabinet (downlight)' },
  { key: 'interiorTop', label: 'Inside, along the top front' },
  { key: 'shelfEdges', label: 'Shelf front edges' },
  { key: 'sides', label: 'Vertical strips on sides / dividers' },
  { key: 'rail', label: 'Over the hanging rail' },
  { key: 'toeKick', label: 'Toe-kick glow' },
  { key: 'drawers', label: 'Inside drawers' },
];

export function LightingSection({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  const l = config.lighting;
  const e = config.electrics;
  return (
    <Section title="Lighting & Electrics" icon="fa-lightbulb">
      <Blurb>Lighting adds routed LED channels, cable holes, and a parts list (strip, driver, switches) to the export.</Blurb>
      <Check
        label="Cabinet lighting"
        checked={l.enabled}
        onChange={(on) => {
          const next = structuredClone(config);
          next.lighting.enabled = on;
          // Switching lights on with nothing selected would show nothing, so start with sensible zones.
          if (on && !Object.values(next.lighting.zones).some(Boolean)) {
            const zones = next.lighting.zones;
            if (next.category === 'wall') {
              zones.underside = true;
              zones.interiorTop = true;
            } else if (next.category === 'wardrobe' || next.category === 'tall') {
              zones.sides = true;
              zones.rail = true;
              zones.shelfEdges = true;
            } else if (next.front.mode === 'drawers') {
              zones.interiorTop = true;
              zones.drawers = true;
            } else {
              zones.interiorTop = true;
              zones.shelfEdges = true;
            }
          }
          api.emit(next);
        }}
      />
      {l.enabled && (
        <>
          <Field label="Light type">
            <Select value={l.type} onChange={(v) => set('lighting.type', v)} options={[{ value: 'led-strip', label: 'LED strip in a routed channel' }, { value: 'led-profile', label: 'LED strip + aluminium profile' }, { value: 'puck', label: 'Recessed puck lights' }]} />
          </Field>
          <Field label="Colour">
            <Select value={l.colourTemp} onChange={(v) => set('lighting.colourTemp', v)} options={[{ value: '2700K', label: '2700K warm' }, { value: '3000K', label: '3000K soft white' }, { value: '4000K', label: '4000K neutral' }, { value: 'RGB', label: 'RGB / tunable' }]} />
          </Field>
          <Field label="Supply voltage">
            <Select value={l.voltage} onChange={(v) => set('lighting.voltage', v)} options={[{ value: 12, label: '12V' }, { value: 24, label: '24V' }]} />
          </Field>
          <Field label="Strip power" unit="W/m">{num('lighting.wattsPerMetre', 9.6, { min: 2, step: 0.5 })}</Field>
          <div className="checklist">
            <div className="checklist-title">Where to light</div>
            {ZONES.map((zone) => (
              <label className="check-row" key={zone.key}>
                <input type="checkbox" checked={l.zones[zone.key]} onChange={(event) => set(`lighting.zones.${zone.key}`, event.target.checked)} />
                <span>{zone.label}</span>
              </label>
            ))}
          </div>
          <Field label="Channel width" unit="mm">{num('lighting.channel.width', 16, { min: 6, step: 1 })}</Field>
          <Field label="Channel depth" unit="mm">{num('lighting.channel.depth', 8, { min: 3, step: 1 })}</Field>
          <Field label="Channel setback from front" unit="mm">{num('lighting.channel.setback', 30, { min: 5, step: 1 })}</Field>
          <Field label="Driver location">
            <Select value={l.driver} onChange={(v) => set('lighting.driver', v)} options={[{ value: 'top-rear', label: 'Top, at the rear' }, { value: 'side', label: 'Beside the cabinet' }, { value: 'plinth', label: 'In the plinth' }, { value: 'external', label: 'External / remote' }]} />
          </Field>
          <Field label="Cable hole diameter" unit="mm">{num('lighting.cableHoleDiameter', 12, { min: 6, step: 1 })}</Field>
          <Field label="Control">
            <Select
              value={l.control}
              onChange={(v) => set('lighting.control', v)}
              options={[
                { value: 'switch', label: 'Rocker switch' },
                { value: 'door-sensor', label: 'Door-activated' },
                { value: 'drawer-switch', label: 'Drawer-activated' },
                { value: 'pir', label: 'Motion sensor (PIR)' },
                { value: 'touch', label: 'Touch dimmer' },
                { value: 'none', label: 'None (always on)' },
              ]}
            />
          </Field>
        </>
      )}

      <Check label="Light switches in drawers" checked={e.drawerSwitch.enabled} onChange={(v) => set('electrics.drawerSwitch.enabled', v)} />
      {e.drawerSwitch.enabled && (
        <>
          <Field label="Switch type">
            <Select value={e.drawerSwitch.type} onChange={(v) => set('electrics.drawerSwitch.type', v)} options={[{ value: 'magnetic-reed', label: 'Magnetic reed (magnet in drawer)' }, { value: 'plunger', label: 'Plunger (pressed by drawer)' }]} />
          </Field>
          <Field label="Drawers fitted">
            <Select value={e.drawerSwitch.drawers} onChange={(v) => set('electrics.drawerSwitch.drawers', v)} options={[{ value: 'all', label: 'All drawers' }, { value: 'top', label: 'Top drawer only' }, { value: 'bottom', label: 'Bottom drawer only' }]} />
          </Field>
          <Field label="Switch bore diameter" unit="mm">{num('electrics.drawerSwitch.boreDiameter', 10, { min: 4, step: 1 })}</Field>
          <Field label="Switch distance from front" unit="mm">{num('electrics.drawerSwitch.offsetFromFront', 40, { min: 10, step: 1 })}</Field>
        </>
      )}
      <Check label="Light switches in doors" checked={e.doorSwitch.enabled} onChange={(v) => set('electrics.doorSwitch.enabled', v)} />
      {e.doorSwitch.enabled && (
        <>
          <Field label="Switch type">
            <Select value={e.doorSwitch.type} onChange={(v) => set('electrics.doorSwitch.type', v)} options={[{ value: 'plunger', label: 'Plunger (pressed by door)' }, { value: 'magnetic-reed', label: 'Magnetic reed' }]} />
          </Field>
          <Field label="Switch bore diameter" unit="mm"><NumberInput value={e.doorSwitch.boreDiameter} onValue={(v) => set('electrics.doorSwitch.boreDiameter', v)} min={4} step={1} /></Field>
        </>
      )}
      {(l.enabled || e.drawerSwitch.enabled || e.doorSwitch.enabled) && (
        <Field label="Cable route">
          <Select value={e.wiring} onChange={(v) => set('electrics.wiring', v)} options={[{ value: 'rear-grommet', label: 'Through the back' }, { value: 'top-grommet', label: 'Through the top' }, { value: 'side-grommet', label: 'Through the side' }]} />
        </Field>
      )}
      <InfoCard title="Safety" text="Keep mains wiring outside the cabinet: use a low-voltage driver and have a qualified person connect the supply." />
    </Section>
  );
}
