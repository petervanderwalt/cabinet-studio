// Evaluates the small formulas the catalogue prints, such as "LW - 51" or "NL + X + 3".

export type FormulaVars = Record<string, number>;

/** Returns the number for a numeric value or a formula over the given variables; null when it can't be read. */
export function evalFormula(value: unknown, vars: FormulaVars): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const text = value.trim();
  // A leading plain number such as "106 (111 with latch set)" or "85.5 incl. 2 mm tilt adjustment".
  const leading = /^(-?\d+(?:\.\d+)?)(?!\s*[+\-*/]\s*[A-Za-z0-9])/.exec(text);
  if (leading && !/[A-Za-z]/.test(text.slice(0, leading[0].length))) {
    const rest = text.slice(leading[0].length).trim();
    if (rest === '' || /^[(*a-z]/i.test(rest)) return Number(leading[1]);
  }
  const tokens = text.match(/[A-Za-z_]+|\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join('').length < text.replace(/\s+/g, '').length) return null;
  // Pure number ranges such as "12-15" are not formulas.
  if (tokens.length > 1 && !tokens.some((token) => /^[A-Za-z_]+$/.test(token))) return null;
  let total = 0;
  let sign = 1;
  let expectOperand = true;
  for (const token of tokens) {
    if (/^[+\-]$/.test(token) && expectOperand === false) {
      sign = token === '-' ? -1 : 1;
      expectOperand = true;
      continue;
    }
    if (!expectOperand) return null;
    const operand = /^[A-Za-z_]+$/.test(token) ? vars[token] : Number(token);
    if (operand === undefined || !Number.isFinite(operand)) return null;
    total += sign * operand;
    sign = 1;
    expectOperand = false;
  }
  return expectOperand ? null : total;
}
