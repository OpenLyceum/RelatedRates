import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { HandleKeyboardHelpSection } from "../../common/HandleKeyboardHelpSection.js";

export class ConicalTankKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection(), new HandleKeyboardHelpSection(["vertical"])],
    );
  }
}
