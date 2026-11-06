import { selectedHardware } from './hardware-library.js?v=20261106aq';
import { runnerSettings, runnerTravel } from './runner-layout.js?v=20261105g';
import { panelBores } from './panel-bores.js?v=20261103c';
import { QUADRO_2D, QUADRO_5D, quadroMountDepths, quadroSetback } from './blum-runner-layout.js?v=20261106aq';
import { ACCURIDE_MODELS } from './hardware-models.js?v=20261106aq';

export const RUNNER_PREVIEW = { height:45.7, thickness:12.7 };

export function addRunnerPreviews(panels, config) {
  const mode = config.hardware.runnerMode;
  if (mode === 'hettich-quadro-2d' || mode === 'hettich-quadro-5d') {
    const table = mode === 'hettich-quadro-5d' ? QUADRO_5D : QUADRO_2D;
    addQuadroRails(panels, table[config.hardware.runnerLength], config);
    return;
  }
  const selected = selectedHardware(config).find(p => p.category === 'runners');
  if (selected?.id !== 'runner-3832e' || config.hardware.runnerPattern !== 'accuride-3832e') return;
  const settings = runnerSettings(config);
  const cad = ACCURIDE_MODELS[config.hardware.runnerLength];
  const travel = cad?.travel || runnerTravel(config.hardware.runnerLength);
  if (!settings.valid || !travel) return;
  for (const drawer of panels) {
    const match = drawer.id.match(/^(drawer-\d+)-side-(left|right)$/);
    if (!match) continue;
    const [, drawerId, side] = match;
    const carcass = panels.find(p => p.id === `side-${side}`);
    if (!carcass) continue;
    const movingBores = panelBores(drawer).filter(b => b.purpose === 'drawer-slide-mount');
    if (movingBores.length !== settings.pattern.drawer.length) continue;
    const mountY = drawer.posY + movingBores[0].start[1];
    const fixedBores = panelBores(carcass).filter(b => b.purpose === 'drawer-runner-mount'
      && Math.abs(carcass.posY + b.start[1] - mountY) < 0.001);
    if (fixedBores.length !== settings.pattern.cabinet.length) continue;
    const direction = side === 'left' ? 1 : -1;
    const length = config.hardware.runnerLength;
    const fixedZ = carcass.posZ - carcass.sizeZ / 2 + settings.setback + length / 2;
    const movingZ = drawer.posZ;
    const fixedX = carcass.posX + fixedBores[0].start[0];
    const movingX = drawer.posX + movingBores[0].start[0];
    if (direction * (movingX - fixedX) < 12.7 - 0.001 || direction * (movingX - fixedX) > 13.5 + 0.001) continue;
    const append = (panel, stage, x, z, sign, height, depth, bores) => {
      panel.hardwareModels ||= [];
      panel.hardwareModels.push({ kind:'runner-preview', stage, drawerId, length,
        ...(cad ? {model:`accuride-${cad.partNumber.toLowerCase()}-${stage}`,travelFactor:cad.intermediateTravel/cad.travel} : {}),
        x:x-panel.posX, y:mountY-panel.posY, z:z-panel.posZ,
        direction:sign, height, depth, travel,
        mounts:bores.map(b => ({ y:b.start[1] - (mountY-panel.posY), z:b.start[2] - (z-panel.posZ) })) });
    };
    append(carcass, 'fixed', fixedX, fixedZ, direction, RUNNER_PREVIEW.height, 4, fixedBores);
    // shortcut: lengths without verified CAD retain illustrative profiles and half-travel motion.
    append(carcass, 'intermediate', (fixedX+movingX)/2 - direction*1.2, (fixedZ+movingZ)/2, direction, 35, 3, []);
    append(drawer, 'moving', movingX, movingZ, -direction, 26, 3, movingBores);
    const front = panels.find(p => p.id === drawerId);
    if (front) front.runnerTravel = travel;
  }
}

function addQuadroRails(panels, spec, config) {
  if (!spec) return;
  const setback = quadroSetback(config);
  const mountDepths = quadroMountDepths(config,spec);
  for (const side of ['left', 'right']) {
    const carcass = panels.find(p => p.id === `side-${side}`);
    if (!carcass) continue;
    const mounts = panelBores(carcass).filter(b => b.purpose === 'quadro-runner-mount');
    for (const { start: [x, y, z] } of mounts) {
      if (Math.abs(z + carcass.sizeZ / 2 - 10 - setback) > 0.001) continue;
      const complete = mountDepths.every(depth => mounts.some(b =>
        Math.abs(b.start[1] - y) < 0.001 && Math.abs(b.start[2] - z - depth + 10) < 0.001));
      if (!complete) continue;
      carcass.hardwareModels ||= [];
      const model = `hettich-${side === 'left' ? spec.left : (spec.right ?? spec.left + 1)}`;
      const placement = {model, x, y, z:z - 10, rotation:0};
      carcass.hardwareModels.push(placement);
      const back = panels.find(p => p.type === 'drawer-box' && p.holes.some(h =>
        h.purpose === 'quadro-rear-hook' && Math.abs(p.posY - p.sizeY / 2 + h.y - 1.5 - carcass.posY - y) < 0.001));
      if (!back) continue;
      carcass.hardwareModels.push({...placement, model:`${model}-closed`, closedOnly:true, drawerId:back.id.replace(/-back$/, '')});
      back.hardwareModels ||= [];
      back.hardwareModels.push({
        model:`${model}-moving`, rotation:0,
        x:carcass.posX + placement.x - back.posX,
        y:carcass.posY + placement.y - back.posY,
        z:carcass.posZ + placement.z - back.posZ,
      });
    }
  }
}
