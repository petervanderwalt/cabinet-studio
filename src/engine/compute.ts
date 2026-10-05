// Single entry point for turning a cabinet config into parts, warnings and a hardware list.
import type { CabinetConfig, Panel } from '../types';
import * as legacy from './cabinet-math.js';
import { applyAccessories, buildHardwareList, type HardwareItem } from './accessories';
import { computeWardrobe } from './wardrobe';
import { availableDrawerDepth } from '../fittings/autoSelect';
import { resolveDrawerFitting } from '../fittings/drawerModel';
import { getVariant } from '../fittings/registry';
import { evalFormula } from '../fittings/formula';

export function computePanels(cfg: CabinetConfig): Panel[] {
  const base = cfg.category === 'wardrobe' ? computeWardrobe(cfg).panels : (legacy.computePanels(cfg) as Panel[]);
  return applyAccessories(cfg, base);
}

export function computeHardware(cfg: CabinetConfig, panels: Panel[] = computePanels(cfg)): HardwareItem[] {
  return buildHardwareList(cfg, panels);
}

export function validateCabinet(cfg: CabinetConfig): string[] {
  const warnings: string[] = [];
  if (cfg.category === 'wardrobe') {
    if (cfg.width < 300) warnings.push('Width too small for a wardrobe (min ~300mm)');
    if (cfg.height < 300) warnings.push('Height too small for a wardrobe (min ~300mm)');
    if (cfg.depth < 200) warnings.push('Depth too small for a wardrobe (min ~200mm)');
    if (cfg.wardrobe.sections.length === 0) warnings.push('Add at least one wardrobe section');
    if (cfg.wardrobe.fronts === 'sliding' && cfg.depth < 550) warnings.push('Sliding doors need about 550mm+ depth to leave hanging space behind the tracks');
    warnings.push(...computeWardrobe(cfg).warnings);
  } else {
    warnings.push(...(legacy.validateCabinet(cfg) as string[]));
  }

  warnings.push(...fittingWarnings(cfg));

  const handleType = cfg.hardware.handleType ?? 'bar';
  if (handleType === 'push-open' && (cfg.reveal ?? 3) < 3) {
    warnings.push('Push-to-open fronts need a reveal/gap of at least 3mm to release');
  }
  if (handleType === 'push-open' && cfg.hardware.pushOpen.type === 'tip-on' && cfg.drawers.slideType === 'standard' && cfg.front.mode === 'drawers') {
    warnings.push('Tip-on push-open drawers need push-open runners; switch the runner type');
  }
  if (cfg.lighting.enabled && !Object.values(cfg.lighting.zones).some(Boolean)) {
    warnings.push('Lighting is on but no lighting zone is selected');
  }
  if (cfg.lighting.enabled && cfg.lighting.zones.toeKick && resolveToeKickHeight(cfg) === 0) {
    warnings.push('Toe-kick lighting needs a toe kick; enable one or untick the zone');
  }
  if (cfg.electrics.drawerSwitch.enabled && !(cfg.front.mode === 'drawers' || (cfg.category === 'wardrobe' && cfg.wardrobe.sections.some((s) => s.drawers > 0)))) {
    warnings.push('Drawer switches are on but the cabinet has no drawers');
  }
  if (cfg.lighting.enabled && cfg.lighting.channel.depth >= cfg.materials.caseThickness * 0.6) {
    warnings.push('LED channel is deep for the board thickness; keep it under about 60% of the panel');
  }
  return warnings;
}

function resolveToeKickHeight(cfg: CabinetConfig): number {
  return (legacy.resolveToeKick(cfg) as { height: number }).height;
}

function fittingWarnings(cfg: CabinetConfig): string[] {
  const warnings: string[] = [];
  const T = cfg.materials.caseThickness;
  const drawerChoice = cfg.fittings?.drawerSystem;
  if (drawerChoice) {
    const hasDrawers = cfg.front.mode === 'drawers' || (cfg.category === 'wardrobe' && cfg.wardrobe.sections.some((s) => s.drawers > 0));
    if (!hasDrawers) {
      warnings.push('A drawer system is chosen but the cabinet has no drawers');
    } else {
      const LW = cfg.category === 'wardrobe' ? Math.max(100, cfg.width / Math.max(1, cfg.wardrobe.sections.length) - T) : cfg.width - 2 * T;
      const model = resolveDrawerFitting(drawerChoice, { LW, availableDepth: availableDrawerDepth(cfg) });
      if (!model) {
        warnings.push('The chosen drawer variant has no cut sizes in the catalogue data; generic drawer sizes are used');
      } else {
        warnings.push(...model.warnings);
        const heights = cfg.category === 'wardrobe' ? [cfg.wardrobe.drawerHeight] : cfg.drawers.heights;
        if (model.spaceHeight !== null && heights.some((h) => h < model.spaceHeight!)) {
          warnings.push(`${model.label} needs ${model.spaceHeight}mm of height per drawer; some drawer fronts are shorter`);
        }
      }
    }
  }

  const lift = cfg.fittings?.lift;
  if (lift) {
    const variant = getVariant(lift.familyId, lift.variantId);
    const kbMax = variant ? evalFormula(variant.dims.cabinetWidthKBMax?.value, {}) : null;
    if (kbMax !== null && cfg.width > kbMax) warnings.push(`This lift system is rated for cabinet widths up to ${kbMax}mm; the cabinet is ${cfg.width}mm wide`);
    if (cfg.front.mode !== 'doors' || cfg.category === 'base') warnings.push('Lift systems are for wall and tall cabinets with a single front');
  }
  return warnings;
}
