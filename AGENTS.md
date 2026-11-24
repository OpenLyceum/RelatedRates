# AGENTS.md — Related Rates

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Related Rates (`related-rates`) is a SceneryStack simulation scaffolded from SceneryStackTemplate.

## Key files

| File | Purpose |
|---|---|
| `src/RelatedRatesColors.ts` | All `ProfileColorProperty` instances |
| `src/RelatedRatesConstants.ts` | Named numeric constants |
| `src/RelatedRatesNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/RelatedRatesPanel.ts` | Pre-themed `Panel` wrapper |
| `src/common/RelatedRatesButtonOptions.ts` | Flat button / combo-box option bundles |
| `src/common/TimeModel.ts` | Play/pause, speed, and elapsed time composed by screen models |
| `src/rule-lab/RuleLabScreen.ts` | Screen wrapper |
| `src/rule-lab/model/RuleLabModel.ts` | Simulation state and logic |
| `src/rule-lab/view/RuleLabScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/conical-tank/ConicalTankScreen.ts` | Screen wrapper |
| `src/conical-tank/model/ConicalTankModel.ts` | Simulation state and logic |
| `src/conical-tank/view/ConicalTankScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/sliding-ladder/SlidingLadderScreen.ts` | Screen wrapper |
| `src/sliding-ladder/model/SlidingLadderModel.ts` | Simulation state and logic |
| `src/sliding-ladder/view/SlidingLadderScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/oil-slick/OilSlickScreen.ts` | Screen wrapper |
| `src/oil-slick/model/OilSlickModel.ts` | Simulation state and logic |
| `src/oil-slick/view/OilSlickScreenView.ts` | Visual nodes, layout, a11y wiring |

## Compliance carve-outs

- `memory-leak:PlotHandle` — file-private drag handle inside the plot/lesson view; not exported for `describeDisposalLeaks`.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
