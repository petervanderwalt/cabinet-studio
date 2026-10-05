import { NumberInput } from '../NumberInput';
import { CLIP_TOP_110, hingePart, platePart, PLATE_FIXING_LABEL } from '../../../fittings/blum-hinges';
import { inferFrontMode } from '../../../engine';
import type { HandleType, HingeType, PushOpenType, SlideType } from '../../../types';
import { Blurb, Field, type FormApi, InfoCard, Section, Select, TabButton, useTab } from './shared';

type Tab = 'hinge' | 'plate' | 'shelf' | 'handle' | 'runner';

const HANDLES: { value: HandleType; label: string }[] = [
  { value: 'bar', label: 'Bar handle (2 holes)' },
  { value: 'knob', label: 'Knob (1 hole)' },
  { value: 'edge-pull', label: 'Edge pull (no drilling)' },
  { value: 'finger-pull', label: 'Finger pull (no drilling)' },
  { value: 'push-open', label: 'Push to open' },
  { value: 'none', label: 'No handle' },
];

export function HardwareSection({ api }: { api: FormApi }) {
  const { config, set, num } = api;
  const mode = inferFrontMode(config);
  const isWardrobe = config.category === 'wardrobe';
  const hasHinged = isWardrobe ? config.wardrobe.fronts === 'hinged' : mode === 'doors';
  const hasShelves = isWardrobe || (mode === 'doors' && config.shelves.count > 0);
  const hasDrawers = mode === 'drawers' || (isWardrobe && [config.wardrobe.sections, config.wardrobe.legB.sections, config.wardrobe.legC.sections].flat().some((s) => s.drawers > 0));

  const tabs: { key: Tab; icon: string; label: string }[] = [
    ...(hasHinged ? [{ key: 'hinge' as const, icon: 'fa-bullseye', label: 'Hinges' }, { key: 'plate' as const, icon: 'fa-grip', label: 'Hinge Plate' }] : []),
    ...(hasShelves ? [{ key: 'shelf' as const, icon: 'fa-ellipsis-vertical', label: 'Shelf Pins' }] : []),
    { key: 'handle', icon: 'fa-grip-lines', label: 'Handles' },
    ...(hasDrawers ? [{ key: 'runner' as const, icon: 'fa-arrows-left-right', label: 'Runners' }] : []),
  ];
  const [chosen, setTab] = useTab<Tab>(tabs[0].key);
  const tab = tabs.some((t) => t.key === chosen) ? chosen : tabs[0].key;
  const handleType = config.hardware.handleType ?? 'bar';
  const drilled = handleType === 'bar' || handleType === 'knob';
  const push = config.hardware.pushOpen;
  const latch = push.type === 'magnetic-latch' || push.type === 'mechanical-latch';

  return (
    <Section title="Hardware" icon="fa-screwdriver-wrench">
      <Blurb>Hinges, handles, push-to-open and runners. The parts list in the Hardware tab updates as you change these.</Blurb>
      <div className="tab-container hardware-tabs">
        <div className="tab-bar">
          {tabs.map((t) => (
            <TabButton key={t.key} icon={t.icon} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
          ))}
        </div>

        {tab === 'hinge' && (
          <div className="tab-content">
            <Field label="Hinge type">
              <Select<HingeType>
                value={config.doors.hingeType ?? 'standard'}
                onChange={(v) => set('doors.hingeType', v)}
                options={[
                  { value: 'standard', label: 'Standard clip-on' },
                  { value: 'soft-close', label: 'Soft-close' },
                  { value: 'push-open', label: 'Spring-open (for push-to-open)' },
                ]}
              />
            </Field>
            <Field label="Hinges per door">
              <Select value={config.doors.hingesPerDoor ?? 0} onChange={(v) => set('doors.hingesPerDoor', v)} options={[{ value: 0, label: 'Auto (by height)' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }]} />
            </Field>
            <Field label="Hinge model">
              <Select
                value={config.hardware.hinge.fitting}
                onChange={(v) => set('hardware.hinge.fitting', v)}
                options={[{ value: 'generic', label: 'Generic (manual bore settings)' }, { value: 'blum-clip-top-110', label: 'Blum CLIP top 110°' }]}
              />
            </Field>
            {config.hardware.hinge.fitting === 'blum-clip-top-110' ? <BlumHingeFields api={api} /> : (
              <>
                <Field label="Hinge bore diameter" unit="mm">{num('hardware.hingeBoreDiameter', 35, { min: 10, step: 1 })}</Field>
                <Field label="Hinge bore inset (from door edge)" unit="mm">{num('hardware.hingeBoreInset', 22, { min: 5, step: 1 })}</Field>
              </>
            )}
          </div>
        )}

        {tab === 'plate' && config.hardware.hinge.plate === 'cruciform-37-32' && (
          <div className="tab-content">
            <InfoCard title="Blum cruciform plate 37/32" text="Hole position is fixed by the catalogue: one column 37mm from the cabinet front, 32mm apart. Change the plate under Hinges." />
          </div>
        )}
        {tab === 'plate' && config.hardware.hinge.plate !== 'cruciform-37-32' && (
          <div className="tab-content">
            <Field label="Hinge plate front hole offset" unit="mm">{num('hardware.hingePlateFrontHoleOffset', 20, { min: 0, step: 1 })}</Field>
            <Field label="Hinge plate rear hole offset" unit="mm">{num('hardware.hingePlateRearHoleOffset', 32, { min: 0, step: 1 })}</Field>
            <Field label="Hinge plate hole spacing" unit="mm">{num('hardware.hingePlateHoleSpacing', 32, { min: 0, step: 1 })}</Field>
          </div>
        )}

        {tab === 'shelf' && (
          <div className="tab-content">
            <InfoCard title="Shelf pins" text="Adjust these only if you want to change the shelf pin pattern. Fixed shelves skip the pin holes." />
            <Field label="Shelf pin spacing" unit="mm">{num('hardware.shelfPinSpacing', 32, { min: 10, step: 1 })}</Field>
            <Field label="Shelf pin setback" unit="mm">{num('hardware.shelfPinSetback', 80, { min: 10, step: 1 })}</Field>
          </div>
        )}

        {tab === 'handle' && (
          <div className="tab-content">
            <Field label="Handle type">
              <Select<HandleType> value={handleType} onChange={(v) => set('hardware.handleType', v)} options={HANDLES} />
            </Field>
            {drilled && (
              <>
                {handleType === 'bar' && <Field label="Handle hole spacing" unit="mm">{num('hardware.handleHoleSpacing', 96, { min: 0, step: 1 })}</Field>}
                {hasHinged && <Field label="Door handle edge offset" unit="mm">{num('hardware.handleEdgeOffset', 40, { min: 0, step: 1 })}</Field>}
                {hasHinged && <Field label="Door handle centre height from bottom" unit="mm">{num('hardware.doorHandleHeight', 100, { min: 0, step: 1 })}</Field>}
                {hasDrawers && <Field label="Drawer handle centre offset down from top" unit="mm">{num('hardware.drawerHandleTopOffset', 50, { min: 0, step: 1 })}</Field>}
              </>
            )}
            {handleType === 'push-open' && (
              <>
                <Field label="Push-open mechanism">
                  <Select<PushOpenType>
                    value={push.type}
                    onChange={(v) => set('hardware.pushOpen.type', v)}
                    options={[
                      { value: 'magnetic-latch', label: 'Magnetic touch latch' },
                      { value: 'mechanical-latch', label: 'Mechanical push latch' },
                      { value: 'tip-on', label: 'Tip-on (runner / hinge mounted)' },
                      { value: 'servo-drive', label: 'Electric servo drive' },
                    ]}
                  />
                </Field>
                {latch && (
                  <>
                    <Field label="Latch bore diameter" unit="mm">{num('hardware.pushOpen.boreDiameter', 10, { min: 6, step: 1 })}</Field>
                    <Field label="Latch distance from front" unit="mm">{num('hardware.pushOpen.edgeOffset', 40, { min: 10, step: 1 })}</Field>
                  </>
                )}
                <InfoCard
                  title="Push-to-open"
                  text={
                    push.type === 'servo-drive'
                      ? 'Servo drives need power: a supply and cable hole are added to the parts list. Fronts need a gap of at least 3mm.'
                      : push.type === 'tip-on'
                        ? 'Tip-on units mount to runners/hinges, so no extra drilling. Use push-open runners for drawers.'
                        : 'Fronts need a gap of at least 3mm to release. No handle holes are drilled.'
                  }
                />
              </>
            )}
          </div>
        )}

        {tab === 'runner' && (
          <div className="tab-content">
            <Field label="Runner type">
              <Select<SlideType>
                value={config.drawers.slideType ?? 'standard'}
                onChange={(v) => set('drawers.slideType', v)}
                options={[{ value: 'standard', label: 'Full extension' }, { value: 'soft-close', label: 'Soft-close' }, { value: 'push-open', label: 'Push-open (tip-on)' }]}
              />
            </Field>
            <Field label="Runner side clearance" unit="mm">
              <NumberInput value={config.drawers.sideClearance ?? 10} onValue={(v) => set('drawers.sideClearance', v)} min={0} step={1} />
            </Field>
            <InfoCard title="Runner reference" text="Drawer runner hole layout follows the side clearance set here." />
          </div>
        )}
      </div>
    </Section>
  );
}

function BlumHingeFields({ api }: { api: FormApi }) {
  const { config, set } = api;
  const h = config.hardware.hinge;
  const application = config.overlay.type === 'inset' ? 'inset' : config.overlay.type === 'partial-overlay' ? 'dual' : 'overlay';
  const action = config.doors.hingeType === 'soft-close' ? 'blumotion' : config.doors.hingeType === 'push-open' ? 'unsprung' : 'spring';
  const hinge = hingePart(application, h.boss, action);
  const plate = h.plate === 'cruciform-37-32' ? platePart(h.plateFixing, h.plateSpacing ?? 0) : null;
  const tb = Math.min(CLIP_TOP_110.edgeDistance.max, Math.max(CLIP_TOP_110.edgeDistance.min, h.edgeDistance));
  return (
    <>
      <Field label="Hinge boss">
        <Select value={h.boss} onChange={(v) => set('hardware.hinge.boss', v)} options={[{ value: 'screw-on', label: 'Screw-on' }, { value: 'inserta', label: 'INSERTA (tool-free dowels)' }, { value: 'knock-in', label: 'Knock-in' }]} />
      </Field>
      <Field label="Cup edge distance" unit="mm">
        <NumberInput value={h.edgeDistance} onValue={(v) => set('hardware.hinge.edgeDistance', Math.min(CLIP_TOP_110.edgeDistance.max, Math.max(CLIP_TOP_110.edgeDistance.min, v || CLIP_TOP_110.edgeDistance.default)))} min={CLIP_TOP_110.edgeDistance.min} max={CLIP_TOP_110.edgeDistance.max} step={0.5} />
      </Field>
      <Field label="Mounting plate">
        <Select value={h.plate} onChange={(v) => set('hardware.hinge.plate', v)} options={[{ value: 'cruciform-37-32', label: 'Cruciform cam plate 37/32' }, { value: 'generic', label: 'Generic (manual holes)' }]} />
      </Field>
      {h.plate === 'cruciform-37-32' && (
        <>
          <Field label="Plate fixing">
            <Select value={h.plateFixing} onChange={(v) => set('hardware.hinge.plateFixing', v)} options={(['screw', 'inserta', 'expando'] as const).map((value) => ({ value, label: PLATE_FIXING_LABEL[value] }))} />
          </Field>
          <Field label="Plate spacing">
            <Select value={h.plateSpacing ?? 0} onChange={(v) => set('hardware.hinge.plateSpacing', v)} options={[{ value: 0, label: '0mm (8.5mm high)' }, { value: 3, label: '3mm (11.5mm high)' }]} />
          </Field>
        </>
      )}
      <InfoCard
        title="Blum catalogue data"
        text={`Cup Ø${CLIP_TOP_110.cupDiameter}mm, centre ${(tb + CLIP_TOP_110.cupDiameter / 2).toFixed(1)}mm from the door edge${h.boss !== 'screw-on' ? `, plus Ø${CLIP_TOP_110.dowels.diameter}mm dowels ${CLIP_TOP_110.dowels.spacing}mm apart` : ''}. Door at least ${CLIP_TOP_110.minFrontThickness}mm thick. ${hinge ? `Hinge ${hinge.partNo}` : 'No catalogue part for this combination: pick another boss or hinge type'}${plate ? `, plate ${plate.partNo}` : ''}.`}
      />
    </>
  );
}
