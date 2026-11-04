import { selectedHardware } from './hardware-library.js?v=20261105a';
import { runnerSettings, runnerTravel } from './runner-layout.js?v=20261105a';
import { panelBores } from './panel-bores.js?v=20261103c';
import { ACCURIDE_MODELS } from './hardware-models.js?v=20261105a';

export const RUNNER_PREVIEW = { height:45.7, thickness:12.7 };

export function addRunnerPreviews(panels, config) {
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
