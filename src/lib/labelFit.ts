// Sizes the name / dimensions label inside a nested part so it never spills outside the part.

export interface FittedLabel {
  /** Rotation in degrees so the text runs along the part's longer side. */
  angle: number;
  lines: { text: string; y: number; size: number; weight: number }[];
}

const CHAR_WIDTH = 0.58; // average glyph width as a fraction of font size
const TWO_LINE_HEIGHT = 1.97; // block height of name + dimensions, in font sizes

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return text.slice(0, Math.max(0, maxChars));
  return `${text.slice(0, maxChars - 1).trimEnd()}…`;
}

/**
 * @param width/height the part's size on the sheet (after any rotation)
 * @param maxSize largest font size to use (sheet units)
 * @param minSize smallest font size still worth drawing
 */
export function fitLabel(width: number, height: number, name: string, dims: string, number: number, maxSize: number, minSize: number): FittedLabel | null {
  const vertical = height > width;
  const along = vertical ? height : width;
  const across = vertical ? width : height;
  const angle = vertical ? -90 : 0;
  const padAlong = along * 0.06;
  const padAcross = across * 0.08;
  const usableAlong = along - 2 * padAlong;
  const usableAcross = across - 2 * padAcross;
  const full = `${number}. ${name}`;

  // Name over dimensions.
  const twoLine = Math.min(maxSize, usableAcross / TWO_LINE_HEIGHT, usableAlong / (Math.max(full.length * CHAR_WIDTH, (dims.length * CHAR_WIDTH * 0.75))));
  if (twoLine >= minSize) {
    return {
      angle,
      lines: [
        { text: full, y: -0.265 * twoLine, size: twoLine, weight: 700 },
        { text: dims, y: 0.785 * twoLine, size: twoLine * 0.75, weight: 400 },
      ],
    };
  }

  // Not enough room for both: shorten the name to fit, and put the dimensions first when they matter most.
  const oneLineSize = Math.min(maxSize, usableAcross / 1.1);
  if (oneLineSize >= minSize) {
    const maxChars = Math.floor(usableAlong / (CHAR_WIDTH * oneLineSize));
    const preferred = dims.length * CHAR_WIDTH * oneLineSize <= usableAlong ? `${number}. ${dims}` : null;
    const text = preferred ?? truncate(full, maxChars);
    if (maxChars >= 3 || preferred) {
      return { angle, lines: [{ text, y: 0.36 * oneLineSize, size: oneLineSize, weight: 700 }] };
    }
  }

  // Last resort: just the part number, as large as fits.
  const numeric = String(number);
  const numberSize = Math.min(maxSize, usableAcross * 0.8, usableAlong / (numeric.length * 0.62));
  if (numberSize >= minSize * 0.8) {
    return { angle, lines: [{ text: numeric, y: 0.36 * numberSize, size: numberSize, weight: 700 }] };
  }
  return null;
}
