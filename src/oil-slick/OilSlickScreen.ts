/**
 * OilSlickScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createOilSlickIcon() in src/common/RelatedRatesScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createOilSlickIcon } from "../common/RelatedRatesScreenIcons.js";
import RelatedRatesColors from "../RelatedRatesColors.js";
import { OilSlickModel } from "./model/OilSlickModel.js";
import { OilSlickKeyboardHelpContent } from "./view/OilSlickKeyboardHelpContent.js";
import { OilSlickScreenView } from "./view/OilSlickScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type OilSlickScreenOptions = ScreenOptions & { tandem: Tandem };

export class OilSlickScreen extends Screen<OilSlickModel, OilSlickScreenView> {
  public constructor(options: OilSlickScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new OilSlickModel(),
      // View factory — receives the model instance
      (model) => new OilSlickScreenView(model),
      optionize<OilSlickScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelatedRatesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new OilSlickKeyboardHelpContent(),
          homeScreenIcon: createOilSlickIcon(),
          navigationBarIcon: createOilSlickIcon(),
        },
        options,
      ),
    );
  }
}
