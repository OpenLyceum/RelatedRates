/**
 * By-hand headless soak: npm run test:soak:headless (never in CI).
 *
 * List the screens exactly as main.ts builds them. The harness in
 * tests/helpers/headlessSoak.ts (template-owned) presses every control, sets every slider,
 * steps, switches screens, flips the color profile and locale, presses Reset All, and
 * fails when listener counts, node counts or retained heap rise after every round.
 *
 * Add `actions` for what only this sim can do (record/clear, add/remove objects) and
 * `exclude` for controls that must not be pressed headless.
 */

import { StringProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { ConicalTankScreen } from "../../src/conical-tank/ConicalTankScreen.js";
import { OilSlickScreen } from "../../src/oil-slick/OilSlickScreen.js";
import RelatedRatesColors from "../../src/RelatedRatesColors.js";
import { RuleLabScreen } from "../../src/rule-lab/RuleLabScreen.js";
import { SlidingLadderScreen } from "../../src/sliding-ladder/SlidingLadderScreen.js";
import { describeHeadlessSoak } from "../helpers/headlessSoak.js";

describeHeadlessSoak({
  screens: () => [
    new RuleLabScreen({ name: new StringProperty("Rule Lab"), tandem: Tandem.OPT_OUT }),
    new ConicalTankScreen({ name: new StringProperty("Conical Tank"), tandem: Tandem.OPT_OUT }),
    new SlidingLadderScreen({ name: new StringProperty("Sliding Ladder"), tandem: Tandem.OPT_OUT }),
    new OilSlickScreen({ name: new StringProperty("Oil Slick"), tandem: Tandem.OPT_OUT }),
  ],
  tracked: () => ({ RelatedRatesColors }),
});
