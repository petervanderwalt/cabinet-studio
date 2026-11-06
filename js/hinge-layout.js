import { isDenseHingeStock, selectedHardware, thinHingeScrew } from './hardware-library.js?v=20261106aq';

// First checked assembly uses a fixed stock/reveal combination; preserve custom settings.
export function addHingeHardware(panels, config) {
  const selected = selectedHardware(config);
  if (config.overlay.type === 'inset' && selected.some(p => p.id === 'cup-blum-inset')) {
    for (const door of panels.filter(p => p.type === 'door' && p.holes.some(h => h.purpose === 'hinge-cup'))) {
      (door.hardwareWarnings ||= []).push('Blum 71B3750: cup bore only. Use the matching inset plate pattern, verify its height and setback, and fit the cup screws by hand at the 45 × 9.5 mm pattern.');
    }
  }
  const blum=selected.find(p=>p.pairedPreset==='plate-blum-173h7100');
  const blumInset=blum?.blumInset;
  const blumSku=blumInset?'71b3750':'71b3550';
  if (blum && config.overlay.type !== (blumInset?'inset':'full-overlay') && panels.some(p => p.type === 'door')) {
    return [`The matched Blum ${blumSku.toUpperCase()} / 173H7100 preset requires ${blumInset?'inset doors':'full overlay'}. Cup and plate bores omitted.`];
  }
  const blum19=blum?.blum19;
  const thin=selected.find(p=>p.thinOverlay);
  const lr28=selected.find(p=>p.pairedPreset==='plate-hettich-9071570');
  const usesHinge = id => selected.some(p => p.id === id || p.baseHinge === id);
  const insetA5=selected.some(p=>p.id==='hinge-hettich-9071207-a5');
  const thick95Inset=selected.some(p=>p.application==='B4');
  const inset=blumInset || insetA5 || thick95Inset || thin?.thinOverlay==='inset' || selected.some(p=>p.id==='hinge-hettich-9071207');
  const wideHalfTS=usesHinge('hinge-hettich-9099590');
  const wideHalf=wideHalfTS || usesHinge('hinge-hettich-9099550-e2');
  const thick95Half=selected.some(p=>p.application==='B3');
  const halfOverlay=wideHalf || thick95Half || thin?.thinOverlay==='partial-overlay' || usesHinge('hinge-hettich-9071206');
  const fullA2=selected.some(p=>p.id==='hinge-hettich-9071205-a2');
  const fullA1=usesHinge('hinge-hettich-9071205-a1');
  const wideE1=usesHinge('hinge-hettich-9099540-e1');
  const thickDoorPreset=selected.find(p=>p.thickDoor);
  const wide=wideHalf || thickDoorPreset || wideE1 || selected.some(p=>p.id==='hinge-hettich-9099540');
  const thick95=thick95Half || thick95Inset || ['B1','B2'].includes(thickDoorPreset?.application);
  const overlayD15=fullA2 || thickDoorPreset?.pairedPreset==='plate-hettich-9071576-a2';
  const wideSku=thick95Inset?'9090280':thick95Half?'9090270':thick95?'9090260':wideHalfTS?'9099590':wideHalf?'9099550':'9099540';
  const name=blum?`Blum ${blumSku.toUpperCase()}`:thin?`Sensys ${thin.model.slice(8)}`:wide?`Sensys ${wideSku}`:'Sensys';
  if (!blum && !inset && !halfOverlay && !wide && !thin && !fullA1 && !fullA2 && !selected.some(p => p.id === 'hinge-hettich-9071205')) return [];
  if (config.front?.mode === 'drawers' || !config.doors?.count) return [];
  const thinCase=thin?.thinCase;
  const plateId=blum?blum.pairedPreset:thinCase?thin.pairedPreset:lr28?'plate-hettich-9071570':overlayD15?'plate-hettich-9071576-a2':inset?'plate-hettich-9071576':'plate-hettich-9071575';
  const halfOverlay19 = wideHalf || (halfOverlay && (lr28 || Math.abs(config.materials.caseThickness-19)<0.001));
  const overlay19 = fullA1 || thin || wideE1 || thickDoorPreset || blum19 || halfOverlay19;
  const halfOverlayAmount = thinCase ? 10 : halfOverlay19 ? 9.5 : 9;
  const thickness = insetA5 || overlay19 ? 19 : 18;
  const reveal = thickDoorPreset?.reveal ?? (insetA5 || fullA2 || thinCase || (thin && inset) ? 2 : overlay19 || blumInset ? 4 : 3);
  const caseThickness = thickDoorPreset?.caseThickness ?? (thinCase ? 10 : fullA2 ? 16 : thickness);
  const doorThickness = thickDoorPreset?.thickDoor ?? (thin ? 10 : fullA2 ? 19 : thickness);
  const stock = caseThickness === doorThickness ? `${caseThickness} mm frameless carcass/door`
    : `${caseThickness} mm frameless carcass and ${doorThickness} mm door`;
  const supported = selected.some(p => p.id === plateId)
    && config.construction === 'frameless' && config.overlay.type === (inset?'inset':halfOverlay?'partial-overlay':'full-overlay')
    && (!halfOverlay || Math.abs((config.overlay.amount ?? thickness/2)-halfOverlayAmount)<0.001)
    && Math.abs(config.materials.caseThickness-caseThickness)<0.001
    && Math.abs(config.materials.doorThickness-doorThickness)<0.001 && Math.abs(config.reveal-reveal)<0.001;
  if (!supported) return [`${name} CAD and cup-fixing pilots omitted: select its matching ${!blum&&(inset||overlayD15)?'D1.5':'D0'} plate, ${stock}, ${inset?'inset':halfOverlay?`${halfOverlayAmount} mm partial overlay`:'full overlay'} and ${reveal} mm reveal setting. Existing cup/plate dimensions remain custom machining to verify.`];
  if (thinCase && !isDenseHingeStock(config.materials, 'carcass')) {
    return ['Sensys D2: cabinet plate pilots and hinge CAD require a Compact HPL or Solid Surface carcass. Verify the plate fixing before drilling.'];
  }
  const setback=blumInset?56.5:inset?38+config.materials.doorThickness:lr28?28:37;
  for (const panel of panels) {
    panel.holes = panel.holes.filter(h => h.purpose !== 'hinge-mounting-plate');
  }
  const warnings = blum?[`${name} / 173H7100: verify starter pilots against supplied screws and stock. The 3D model shows the closed pose when available. Physical fitting remains pending.`]:[];
  const thinScrew = thin && thinHingeScrew(config);
  if (thin) warnings.push(thinScrew
    ? `${name}: Ø${thinScrew.diameter} × ${thinScrew.depth} mm door pilots for Hettich ${thinScrew.sku}. Trial-fit the screws in the actual stock.`
    : `${name}: fit the screw-on hinge only to a suitable aluminium, HPL or solid-surface door. Drill the 52 × 5.5 mm door fixing manually to match the material and fastener.`);
  if(wide) warnings.push(`Sensys ${wideSku} / ${lr28?'9071570':inset||overlayD15?'9071576':'9071575'}: closed CAD follows Hettich section ${thickDoorPreset?.application ?? (wideHalfTS ? 'E2 mounting datums with TS fixing' : wideHalf ? 'E2' : 'E1')}. Verify starter pilots against supplied screws and stock. Motion and physical fit remain pending.`);
  for (const door of panels.filter(p => p.type === 'door')) {
    const right = door.hingeSide === 'right';
    const sign = right ? -1 : 1;
    const side = panels.find(p => p.id === (right ? 'side-right' : 'side-left'));
    if (!side) continue;
    let fitted = false;
    for (const cup of door.holes.filter(h => h.purpose === 'hinge-cup')) {
      const half=blum?22.5:wideHalfTS?24:26,offset=blum?9.5:wideHalfTS?6:5.5;
      const pilots = [-half,half].map(dy => ({x:cup.x+sign*offset,y:cup.y+dy,diameter:thinScrew?.diameter ?? 2.5,depth:thinScrew?.depth ?? (blum?3:10),face:'back',purpose:'hinge-cup-fixing'}));
      if (pilots.some(h => h.x < 3.25 || h.x > door.cutWidth-3.25 || h.y < 3.25 || h.y > door.cutHeight-3.25)) {
        warnings.push(`${door.name}: ${name} fixing pattern does not fit; hinge CAD and plate pilots omitted.`);
        continue;
      }
      const plateY = door.posY + cup.y - door.cutHeight/2 - side.posY;
      const plateX = right ? side.cutWidth-setback : setback;
      const plateDiameter = thinCase ? 5 : blum ? config.hardware.hingePlateDiameter ?? 2.5 : 3;
      const plateDepth = thinCase ? 8 : blum ? config.hardware.hingePlateDepth ?? 3 : 12;
      const plateMargin = Math.max(1.5, plateDiameter/2);
      const platePilots = [-16,16].map(dy => ({x:plateX,y:plateY+side.cutHeight/2+dy,
        diameter:plateDiameter,depth:plateDepth,face:'inside',purpose:'hinge-mounting-plate'}));
      if (platePilots.some(h => h.x < plateMargin || h.x > side.cutWidth-plateMargin || h.y < plateMargin || h.y > side.cutHeight-plateMargin)) {
        warnings.push(`${door.name}: ${name} plate pilots do not fit the cabinet side; matched fixing pilots and CAD omitted.`);
        continue;
      }
      if (!thin || thinScrew) door.holes.push(...pilots);
      side.holes.push(...platePilots);
      fitted = true;
      door.hardwareModels ||= [];
      door.hardwareModels.push({model:blum?`blum-${blumSku}`:thin?thin.model:wide?`hettich-${wideSku}`:inset?'hettich-9071207':halfOverlay?'hettich-9071206':'hettich-9071205',x:cup.x-door.cutWidth/2,
      y:cup.y-door.cutHeight/2,z:door.sizeZ/2,rotation:0,mirrorX:sign,closedOnly:true});
      side.hardwareModels ||= [];
      side.hardwareModels.push({model:blumInset?'blum-173h7100-inset':blum?'blum-173h7100':lr28?'hettich-9071570':inset||overlayD15?'hettich-9071576':'hettich-9071575',x:sign*side.sizeX/2,y:plateY,
      z:setback-side.sizeZ/2,rotation:0,mirrorX:sign});
      if (blum) {
        door.hardwareModels.push({...door.hardwareModels.at(-1),model:`blum-${blumSku}-cup`,closedOnly:false});
        side.hardwareModels.push({...side.hardwareModels.at(-1),model:`blum-${blumSku}-arm`});
      }
    }
    if (thickDoorPreset && door.hardwareModels?.some(model=>model.model===`hettich-${wideSku}`)) {
      const { application, limiter, angle } = thickDoorPreset;
      if (!thick95) (door.hardwareWarnings ||= []).push(`Sensys ${application}: apply the R1 door-edge radius separately. The panel DXF contains the square blank and hinge drilling.`);
      if (angle) door.hingeOpeningLimit = angle;
      if (limiter) {
        door.hardwareWarnings.push(`Sensys ${application}: fit one Hettich ${limiter} limiter into the linkage at the cup end of each open hinge. Use the ${angle}° orientation in Hettich Sensys Technical Information, printed page 56. The same limiter has two orientations. Check the stop before use.`);
      }
    }
    if (!inset && fitted) door.posZ -= wide || thin ? 1 : 1.5;
    if (fitted && blumInset) {
      (door.hardwareWarnings ||= []).push('Blum 71B3750: apply the R1 front-edge radius separately to match the configured assembly. The panel DXF contains the square blank and hinge drilling.');
      door.hardwareWarnings.push('Blum 71B3750: this preset drills the 3 mm cup-edge distance from the configured STEP and woodWOP. The general D0 inset table lists 5 mm at a −2 mm front overlay. Trial-fit the configured pattern before machining a batch.');
    }
    if (fitted && blum?.blumStop) {
      door.hingeOpeningLimit = 86;
      (door.hardwareWarnings ||= []).push('Blum 70T3553: fit one stop per hinge with the hinge closed and the door unclipped. The 86° preview limit assumes the stops are fitted.');
    }
  }
  return warnings;
}
