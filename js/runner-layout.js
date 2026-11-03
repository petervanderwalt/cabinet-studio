// Accuride 3832E/3834E drawing 3700-9464, revision R10-0616, page 1.
// These are pilot centres, not the outlines of the adjustment slots.
export function runnerPattern(length) {
  const table = {
    250: [null, null, null, null, null, 192, null, null],
    300: [null, null, null, null, null, 242, 224, null],
    350: [null, null, null, null, null, 292, 224, null],
    400: [null, null, null, null, null, 342, 224, 320],
    450: [null, null, 320, null, null, 392, 224, 352],
    500: [null, null, 320, null, null, 442, 224, 416],
    550: [null, null, 320, 416, null, 492, 224, 448],
    600: [224, null, null, 416, null, 542, 224, 480],
    650: [224, null, null, 416, 544, 592, 224, 544],
    700: [224, 288, 416, null, 544, 642, 224, 544],
  };
  const row = table[length];
  if (!row) return null;
  return {
    cabinet: [...new Set([35, 35 + (length <= 300 ? 96 : 128), ...row.slice(6).filter(x => x != null).map(x => 35 + x)])],
    drawer: [...new Set([17.8, 60.5, 163, ...row.slice(0, 5).filter(x => x != null).map(x => 35 + x)])],
  };
}

export function runnerSettings(c) {
  const hw = c.hardware;
  const preset = hw.runnerPattern !== 'custom';
  const pattern = preset ? runnerPattern(hw.runnerLength) : {
    cabinet: hw.runnerCabinetHoles || [], drawer: hw.runnerDrawerHoles || [],
  };
  const diameter = hw.runnerPilotDiameter ?? 3;
  const depth = hw.runnerPilotDepth ?? 8;
  const height = hw.runnerHoleHeight ?? 31.8;
  const setback = hw.runnerSetback ?? (c.overlay.type === 'inset' ? c.materials.doorThickness + 3.2 : 2);
  const valid = pattern && diameter > 0 && depth > 0 &&
    depth <= Math.min(c.materials.caseThickness, c.drawers.sideThickness) - 2 && height > diameter / 2 &&
    setback >= (c.overlay.type === 'inset' ? c.materials.doorThickness + 3.2 : 0) &&
    ['cabinet', 'drawer'].every(side => pattern[side].length >= 2 &&
      pattern[side].every(x => Number.isFinite(x) && x >= diameter / 2 + 2 && x <= hw.runnerLength - diameter / 2 - 2));
  return { pattern, diameter, depth, height, setback, valid: Boolean(valid) };
}
