import anzio from '../assets/hardware/models/hettich-1160018.js';
import anzio160 from '../assets/hardware/models/hettich-1160019.js';
import anzio224 from '../assets/hardware/models/hettich-1160020.js';
import anzio288 from '../assets/hardware/models/hettich-1160021.js';
import anzio352 from '../assets/hardware/models/hettich-1160022.js';
import anzio480 from '../assets/hardware/models/hettich-1160023.js';
import anzio608 from '../assets/hardware/models/hettich-1160024.js';
import anzio736 from '../assets/hardware/models/hettich-1160025.js';
import sensys from '../assets/hardware/models/hettich-9071205.js';
import sensysPlate from '../assets/hardware/models/hettich-9071575.js';
import accuride from '../assets/hardware/models/accuride-3832-e20.js';
import accuride450 from '../assets/hardware/models/accuride-3832-e18.js';
import accuride550 from '../assets/hardware/models/accuride-3832-e22.js';
import accuride600 from '../assets/hardware/models/accuride-3832-e24.js';
import accuride400 from '../assets/hardware/models/accuride-3832-e16.js';
import accuride250 from '../assets/hardware/models/accuride-3832-e10.js';
import accuride300 from '../assets/hardware/models/accuride-3832-e12.js';
import accuride350 from '../assets/hardware/models/accuride-3832-e14.js';
import accuride650 from '../assets/hardware/models/accuride-3832-e26.js';
import accuride700 from '../assets/hardware/models/accuride-3832-e28.js';

export const ACCURIDE_3832_E20 = accuride;
export const ANZIO_MODELS = [anzio,anzio160,anzio224,anzio288,anzio352,anzio480,anzio608,anzio736];
export const ACCURIDE_MODELS = {250:accuride250,300:accuride300,350:accuride350,400:accuride400,
  450:accuride450,500:accuride,550:accuride550,600:accuride600,650:accuride650,700:accuride700};

export const HARDWARE_MODELS = { ...Object.fromEntries(ANZIO_MODELS.map(model=>[`hettich-${model.partNumber}`,model])),
  'hettich-9071205':sensys, 'hettich-9071575':sensysPlate,
  ...Object.fromEntries(Object.values(ACCURIDE_MODELS).flatMap(model =>
    Object.entries(model.stages).map(([stage,data])=>[`accuride-${model.partNumber.toLowerCase()}-${stage}`,data]))) };

// Mount from the generated bores, so moved/mirrored handles keep their drilling.
export function handleModelPlacement(panel, preset) {
  if (!preset?.model || !['door', 'drawer'].includes(panel.type)) return [];
  const model = HARDWARE_MODELS[preset.model];
  const holes = (panel.holes || []).filter(h => h.purpose === 'handle');
  if (!model || holes.length !== 2) return [];
  const [a, b] = holes;
  const dx = b.x - a.x, dy = b.y - a.y;
  const spacing = model.mountingCentres[1][0] - model.mountingCentres[0][0];
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite) || Math.abs(Math.hypot(dx, dy) - spacing) > 0.001) return [];
  return [{ model: preset.model, x: (a.x + b.x - panel.cutWidth) / 2,
    y: (a.y + b.y - panel.cutHeight) / 2, z: -panel.sizeZ / 2,
    rotation: Math.atan2(dy, dx) }];
}
