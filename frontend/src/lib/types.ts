// ── Trim sizes ────────────────────────────────────────────────────────────
export interface TrimSize {
  id: string;
  label: string;
  widthIn: number;
  heightIn: number;
  marginTopIn: number;
  marginBottomIn: number;
  marginInsideIn: number;
  marginOutsideIn: number;
}

export const TRIM_SIZES: TrimSize[] = [
  { id: "trade_6x9",   label: 'Trade (6″ × 9″)',      widthIn: 6,   heightIn: 9,   marginTopIn: 1,    marginBottomIn: 1,    marginInsideIn: 1.25, marginOutsideIn: 0.75 },
  { id: "trade_55x85", label: 'Trade (5.5″ × 8.5″)',  widthIn: 5.5, heightIn: 8.5, marginTopIn: 0.875,marginBottomIn: 0.875,marginInsideIn: 1.125,marginOutsideIn: 0.75 },
  { id: "mass_market", label: 'Mass Market (4.25″ × 6.87″)', widthIn: 4.25,heightIn: 6.87,marginTopIn: 0.75, marginBottomIn: 0.75, marginInsideIn: 0.875,marginOutsideIn: 0.625},
  { id: "novella",     label: 'Novella (5″ × 8″)',     widthIn: 5,   heightIn: 8,   marginTopIn: 0.875,marginBottomIn: 0.875,marginInsideIn: 1,    marginOutsideIn: 0.75 },
  { id: "a5",          label: 'A5 (5.83″ × 8.27″)',   widthIn: 5.83,heightIn: 8.27,marginTopIn: 0.875,marginBottomIn: 0.875,marginInsideIn: 1.125,marginOutsideIn: 0.75 },
];

// ── Font presets ──────────────────────────────────────────────────────────
export interface FontPreset {
  id: string;
  label: string;
  fontFamily: string;
  fontSizePt: number;
  lineHeightMultiplier: number;
}

export const FONT_PRESETS: FontPreset[] = [
  { id: "lora_12",    label: "Lora 12pt",           fontFamily: "Lora, serif",          fontSizePt: 12, lineHeightMultiplier: 1.6 },
  { id: "garamond_12",label: "EB Garamond 12pt",    fontFamily: "'EB Garamond', serif",  fontSizePt: 12, lineHeightMultiplier: 1.6 },
  { id: "crimson_12", label: "Crimson Text 12pt",   fontFamily: "'Crimson Text', serif", fontSizePt: 12, lineHeightMultiplier: 1.6 },
  { id: "lora_11",    label: "Lora 11pt",           fontFamily: "Lora, serif",          fontSizePt: 11, lineHeightMultiplier: 1.6 },
];

// ── Data shapes ───────────────────────────────────────────────────────────
export interface Page {
  id: string;
  pageNumber: number;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  pages: Page[];
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  trimSizeId: string;
  fontPresetId: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

// ── Page metrics (computed) ───────────────────────────────────────────────
export interface PageMetrics {
  pageWidthPx: number;
  pageHeightPx: number;
  textWidthPx: number;
  textHeightPx: number;
  marginTopPx: number;
  marginBottomPx: number;
  marginInsidePx: number;
  marginOutsidePx: number;
  fontSizePx: number;
  lineHeightPx: number;
  fontFamily: string;
  linesPerPage: number;
  approxWordsPerPage: number;
}
