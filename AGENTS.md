# AGENTS.md — Related Rates

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Related Rates (`related-rates`) links the rates of two quantities tied by an equation. One shared model and view (`src/common/`) branch on `model.kind`; the four screen folders are thin wrappers.

- **Rule Lab:** a combo box of relations (y = u², y = √u, y = sin u, xy = 12, x² + y² = 25). The moving point carries two velocity arrows: du/dt horizontal, dy/dt vertical.
- **Conical Tank, Sliding Ladder, Oil Slick:** a picture with draggable handles and velocity arrows, and a graph of |output rate| against the measurement at the current input rate. Arrows show the distance covered in 3 s, in the picture's own scale. The tank is drawn to r = h/2. The ladder runs to x = 4.95 m, where dy/dt reaches about 7 dx/dt.
- **Every screen:**
  - Both rates are shown live.
  - "Next step" reveals the derivation (relation, differentiate, substitute, result) with the current values.
  - The prediction asks whether |output rate| will grow, stay the same or shrink as the measurement increases with the input rate fixed. It is judged by `trend()` when it is made, so the verdict does not drift during play.

## Key files

| File | Purpose |
|---|---|
| `src/common/model/RelatedRatesModel.ts` | `settings`, `dependent`, `linkedRate`, `trend`, `advance` (geometry-preserving time step), prediction and derivation state |
| `src/common/RelatedRatesView.ts` | Symbols and `derivation()` per relation, pictures, arrows, rate graph, handles |
| `src/common/LessonView.ts` | Canonical Calculus I scaffold, kept identical with Limit Explorer, Mean Value Theorem and Riemann Sum Builder apart from the sim prefix |
| `tests/rates.test.ts` | Each relation's derivative against a numeric slope, trends, geometry and boundary timing, prediction state |
| `tests/browser/keyboard-drag.spec.ts` | Keyboard picture handles; prediction and derivation in the screen description |

## Compliance carve-outs

- `memory-leak:PlotHandle` — file-private drag handle inside the plot/lesson view; not exported for `describeDisposalLeaks`.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
