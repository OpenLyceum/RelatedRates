/**
 * RuleLabScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createRuleLabIcon() in src/common/RelatedRatesScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createRuleLabIcon } from "../common/RelatedRatesScreenIcons.js";
import RelatedRatesColors from "../RelatedRatesColors.js";
import { RuleLabModel } from "./model/RuleLabModel.js";
import { RuleLabKeyboardHelpContent } from "./view/RuleLabKeyboardHelpContent.js";
import { RuleLabScreenView } from "./view/RuleLabScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type RuleLabScreenOptions = ScreenOptions & { tandem: Tandem };

export class RuleLabScreen extends Screen<RuleLabModel, RuleLabScreenView> {
  public constructor(options: RuleLabScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new RuleLabModel(),
      // View factory — receives the model instance
      (model) => new RuleLabScreenView(model),
      optionize<RuleLabScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelatedRatesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new RuleLabKeyboardHelpContent(),
          homeScreenIcon: createRuleLabIcon(),
          navigationBarIcon: createRuleLabIcon(),
        },
        options,
      ),
    );
  }
}
