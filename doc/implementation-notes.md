# Implementation notes — Related Rates

Developer-facing architecture notes for `related-rates`.

## Architecture

Screens: src/rule-lab/, src/conical-tank/, src/sliding-ladder/, src/oil-slick/

- Models own state and `step` / `reset`; views observe Properties and never integrate physics.
- Colors live in `src/RelatedRatesColors.ts`; strings in `src/i18n/` via `StringManager`.
- Preferences shell: `src/preferences/` (empty until sim-specific prefs are added).

## Notes

*Record design decisions, performance constraints, and known limitations here.*
