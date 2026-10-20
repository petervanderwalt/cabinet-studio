let mode = 'metric';
try { mode = localStorage.getItem('cabinet-studio-units') || mode; } catch {}
export const isImperial = () => mode === 'imperial';
export const unitLabel = () => isImperial() ? 'in' : 'mm';
export function setUnits(value) {
 mode = value === 'imperial' ? 'imperial' : 'metric';
 try { localStorage.setItem('cabinet-studio-units', mode); } catch {}
}
export const getUnits = () => mode;
export const toDisplay = mm => Number(mm) / (isImperial() ? 25.4 : 1);
export function parseLength(value) {
 const text = String(value).trim().replace(/["″]/g, '').trim();
 const f = text.match(/^([+-]?)(?:(\d+)\s+)?(\d+)\/(\d+)$/);
 let n;
 if (f) { if (!Number(f[4])) return NaN; n = (Number(f[2] || 0) + Number(f[3]) / Number(f[4])) * (f[1] === '-' ? -1 : 1); }
 else n = text === '' ? NaN : Number(text);
 return n * (isImperial() ? 25.4 : 1);
}
export const formatLength = mm => Number(toDisplay(mm).toFixed(3)).toString();
export const dimension = mm => Number.isFinite(Number(mm)) ? `${formatLength(mm)} ${unitLabel()}` : '-';
export function lengthInput(input) {
 input.dataset.length = 'true'; input.dataset.mm = input.value;
 input.value = formatLength(input.value); input.dataset.displayValue = input.value;
 if (isImperial()) { input.type = 'text'; input.inputMode = 'decimal'; input.placeholder = 'e.g. 24 or 23 3/4'; for (const a of ['min','max','step']) input.removeAttribute(a); }
 if (!input.dataset.lengthListener) {
  input.addEventListener('input', () => input.setCustomValidity(Number.isFinite(parseLength(input.value)) ? '' : 'Enter a decimal or fraction, e.g. 23 3/4.'));
  input.dataset.lengthListener = 'true';
 }
 return input;
}
export const readLength = input => input.value === input.dataset.displayValue ? Number(input.dataset.mm) : parseLength(input.value);

export function stockDimension(stock) {
 const mm = stock.cutThickness ?? stock.thickness;
 const units = stock.stockUnits || getUnits();
 if (units !== 'imperial') return `${Number(Number(mm).toFixed(3))} mm`;
 const fraction = [[6.35,'1/4'],[12.7,'1/2'],[19.05,'3/4']].find(([value])=>Math.abs(value-mm)<1e-8);
 return fraction ? `${fraction[1]} in` : `${Number((mm/25.4).toFixed(3))} in`;
}
