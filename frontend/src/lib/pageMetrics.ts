import { TrimSize, FontPreset, PageMetrics } from "./types";

const SCREEN_DPI = 110;

function inToPx(inches: number) {
  return Math.round(inches * SCREEN_DPI);
}

export function computePageMetrics(trim: TrimSize, font: FontPreset): PageMetrics {
  const pageWidthPx  = inToPx(trim.widthIn);
  const pageHeightPx = inToPx(trim.heightIn);

  const marginTopPx     = inToPx(trim.marginTopIn);
  const marginBottomPx  = inToPx(trim.marginBottomIn);
  const marginInsidePx  = inToPx(trim.marginInsideIn);
  const marginOutsidePx = inToPx(trim.marginOutsideIn);

  const textWidthPx  = pageWidthPx  - marginInsidePx - marginOutsidePx;
  const textHeightPx = pageHeightPx - marginTopPx    - marginBottomPx;

  // Convert pt → px:  1pt = 1/72 inch
  const fontSizePx    = Math.round((font.fontSizePt / 72) * SCREEN_DPI);
  const lineHeightPx  = Math.round(fontSizePx * font.lineHeightMultiplier);

  const linesPerPage        = Math.floor(textHeightPx / lineHeightPx);
  const approxCharsPerLine  = Math.floor(textWidthPx / (fontSizePx * 0.48));
  const approxWordsPerPage  = Math.round((linesPerPage * approxCharsPerLine) / 5.5);

  return {
    pageWidthPx,
    pageHeightPx,
    textWidthPx,
    textHeightPx,
    marginTopPx,
    marginBottomPx,
    marginInsidePx,
    marginOutsidePx,
    fontSizePx,
    lineHeightPx,
    fontFamily: font.fontFamily,
    linesPerPage,
    approxWordsPerPage,
  };
}
