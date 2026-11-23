/**
 * ConicalTankScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createConicalTankIcon() in src/common/RelatedRatesScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createConicalTankIcon } from "../common/RelatedRatesScreenIcons.js";
import RelatedRatesColors from "../RelatedRatesColors.js";
import { ConicalTankModel } from "./model/ConicalTankModel.js";
import { ConicalTankKeyboardHelpContent } from "./view/ConicalTankKeyboardHelpContent.js";
import { ConicalTankScreenView } from "./view/ConicalTankScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ConicalTankScreenOptions = ScreenOptions & { tandem: Tandem };

export class ConicalTankScreen extends Screen<ConicalTankModel, ConicalTankScreenView> {
  public constructor(options: ConicalTankScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ConicalTankModel(),
      // View factory — receives the model instance
      (model) => new ConicalTankScreenView(model),
      optionize<ConicalTankScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelatedRatesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ConicalTankKeyboardHelpContent(),
          homeScreenIcon: createConicalTankIcon(),
          navigationBarIcon: createConicalTankIcon(),
        },
        options,
      ),
    );
  }
}
