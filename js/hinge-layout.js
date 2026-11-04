import { selectedHardware } from './hardware-library.js?v=20261105a';

// First checked assembly uses a fixed stock/reveal combination; preserve custom settings.
export function addSensysHardware(panels, config) {
  const selected = selectedHardware(config);
  if (!selected.some(p => p.id === 'hinge-hettich-9071205')) return [];
  if (config.front?.mode === 'drawers' || !config.doors?.count) return [];
  const supported = selected.some(p => p.id === 'plate-hettich-9071575')
    && config.construction === 'frameless' && config.overlay.type === 'full-overlay'
    && Math.abs(config.materials.caseThickness-18)<0.001
    && Math.abs(config.materials.doorThickness-18)<0.001 && Math.abs(config.reveal-3)<0.001;
  if (!supported) return ['Sensys CAD and cup-fixing pilots omitted: select its matching D0 plate, 18 mm frameless carcass/door, full overlay and 3 mm gap. Existing cup/plate dimensions remain custom machining to verify.'];
  for (const panel of panels) {
    panel.holes = panel.holes.filter(h => h.purpose !== 'hinge-mounting-plate');
  }
  const warnings = [];
  for (const door of panels.filter(p => p.type === 'door')) {
    const right = door.hingeSide === 'right';
    const sign = right ? -1 : 1;
    const side = panels.find(p => p.id === (right ? 'side-right' : 'side-left'));
    if (!side) continue;
    for (const cup of door.holes.filter(h => h.purpose === 'hinge-cup')) {
      const pilots = [-26,26].map(dy => ({x:cup.x+sign*5.5,y:cup.y+dy,diameter:2.5,depth:10,face:'back',purpose:'hinge-cup-fixing'}));
      if (pilots.some(h => h.x < 3.25 || h.x > door.cutWidth-3.25 || h.y < 3.25 || h.y > door.cutHeight-3.25)) {
        warnings.push(`${door.name}: Sensys fixing pattern does not fit; hinge CAD and plate pilots omitted.`);
        continue;
      }
      door.holes.push(...pilots);
      door.hardwareModels ||= [];
      door.hardwareModels.push({model:'hettich-9071205',x:cup.x-door.cutWidth/2,
        y:cup.y-door.cutHeight/2,z:door.sizeZ/2,rotation:0,mirrorX:sign,closedOnly:true});
      const globalY = door.posY + cup.y - door.cutHeight/2;
      const plateY = globalY - side.posY;
      const plateX = right ? side.cutWidth-37 : 37;
      for (const dy of [-16,16]) side.holes.push({x:plateX,y:plateY+side.cutHeight/2+dy,
        diameter:3,depth:12,face:'inside',purpose:'hinge-mounting-plate'});
      side.hardwareModels ||= [];
      side.hardwareModels.push({model:'hettich-9071575',x:sign*side.sizeX/2,y:plateY,
        z:37-side.sizeZ/2,rotation:0,mirrorX:sign});
    }
  }
  return warnings;
}
