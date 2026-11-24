import { KeyboardHelpIconFactory, KeyboardHelpSection, KeyboardHelpSectionRow } from "scenerystack/scenery-phet";
import { StringManager } from "../i18n/StringManager.js";

export class HandleKeyboardHelpSection extends KeyboardHelpSection {
  public constructor(directions: readonly ("horizontal" | "vertical")[]) {
    const strings = StringManager.getInstance().getLessonStrings();
    const axes = {
      horizontal: {
        label: strings.moveHandleHorizontalStringProperty,
        icon: () => KeyboardHelpIconFactory.leftRightOrADKeysRowIcon(),
      },
      vertical: {
        label: strings.moveHandleVerticalStringProperty,
        icon: () => KeyboardHelpIconFactory.upDownOrWSKeysRowIcon(),
      },
    };
    super(strings.moveHandleStringProperty, [
      ...directions.map((direction) => {
        const { label, icon } = axes[direction];
        return KeyboardHelpSectionRow.labelWithIcon(label, icon(), {
          labelInnerContent: label,
          labelOptions: { lineWrap: 220 },
        });
      }),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.moveHandleFineStringProperty,
        KeyboardHelpIconFactory.shiftPlusIcon(
          KeyboardHelpIconFactory.iconRow(directions.map((axis) => axes[axis].icon())),
        ),
        { labelInnerContent: strings.moveHandleFineStringProperty, labelOptions: { lineWrap: 220 } },
      ),
    ]);
  }
}
