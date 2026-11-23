/**
 * SlidingLadderScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSlidingLadderIcon() in src/common/RelatedRatesScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createSlidingLadderIcon } from "../common/RelatedRatesScreenIcons.js";
import RelatedRatesColors from "../RelatedRatesColors.js";
import { SlidingLadderModel } from "./model/SlidingLadderModel.js";
import { SlidingLadderKeyboardHelpContent } from "./view/SlidingLadderKeyboardHelpContent.js";
import { SlidingLadderScreenView } from "./view/SlidingLadderScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SlidingLadderScreenOptions = ScreenOptions & { tandem: Tandem };

export class SlidingLadderScreen extends Screen<SlidingLadderModel, SlidingLadderScreenView> {
  public constructor(options: SlidingLadderScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SlidingLadderModel(),
      // View factory — receives the model instance
      (model) => new SlidingLadderScreenView(model),
      optionize<SlidingLadderScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelatedRatesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SlidingLadderKeyboardHelpContent(),
          homeScreenIcon: createSlidingLadderIcon(),
          navigationBarIcon: createSlidingLadderIcon(),
        },
        options,
      ),
    );
  }
}
