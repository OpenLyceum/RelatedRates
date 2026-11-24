import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { HandleKeyboardHelpSection } from "../../common/HandleKeyboardHelpSection.js";

export class RuleLabKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection(), new HandleKeyboardHelpSection(["horizontal"])],
    );
  }
}
