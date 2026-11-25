/**
 * RelatedRatesConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Model / math values note their unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in RelatedRatesColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * LAYOUT matches the other Calculus I sims (Limit Explorer, Mean Value
 * Theorem, Riemann Sum Builder) — keep those copies in sync.
 */

import RelatedRatesNamespace from "./RelatedRatesNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/**
 * Corner radius shared by control panels and dialogs.
 * @public
 */
export const PANEL_CORNER_RADIUS = 6;

/**
 * Shared lesson scaffold: plot left, panel right, notes under the plot.
 * Keys stay camelCase to match LessonView usage across the Calculus I fleet.
 */
export const LAYOUT = {
  inset: 32,
  gap: 24,
  plotWidth: 610,
  plotHeight: 360,
  panelWidth: 320,
  panelHeight: 430,
  top: 107,
  notesGap: 14,
};

/** Conical-tank picture frame (px). Radius is drawn to the model’s r = h/2. */
export const TANK_PICTURE = { x: 190, top: 55, tip: 319, radius: 132 } as const;

/** Sliding-ladder picture: left wall, floor, and px·m⁻¹ scale. */
export const LADDER_PICTURE = { left: 70, floor: 310, scale: 54 } as const;

/** Oil-slick picture center and px·m⁻¹ scale. */
export const OIL_PICTURE = { x: 185, y: 180, scale: 38 } as const;

/** Rate-against-measurement mini-graph beside each picture (px). */
export const MINI_GRAPH = { left: 410, right: 590, top: 42, bottom: 300 } as const;

/**
 * A velocity arrow shows the distance covered in this many seconds — long
 * enough for slow edges to show and still in the picture’s own scale (s).
 */
export const ARROW_SECONDS = 3;

/** Cap on drawn velocity-arrow length (px). */
export const MAX_ARROW = 150;

/** Keyboard step when nudging a size handle (model units). */
export const KEYBOARD_SIZE_STEP = 0.04;

// ── Model / SI ────────────────────────────────────────────────────────────────

/** Ladder length on the sliding-ladder and circle Rule Lab scenes (m). */
export const ladderLength = 5;

/** Cone height on the conical-tank scene (m). */
export const tankHeight = 6;

RelatedRatesNamespace.register("RelatedRatesConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  LAYOUT,
  TANK_PICTURE,
  LADDER_PICTURE,
  OIL_PICTURE,
  MINI_GRAPH,
  ARROW_SECONDS,
  MAX_ARROW,
  KEYBOARD_SIZE_STEP,
  ladderLength,
  tankHeight,
});
