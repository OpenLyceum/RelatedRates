/**
 * RelatedRatesPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Add controls here
 * when the sim gains sim-specific preferences. The empty shell still wraps content
 * in RelatedRatesPanel so the shared panel toolkit stays reachable.
 */
import { Bounds2 } from "scenerystack/dot";
import { VBox } from "scenerystack/scenery";
import type { Tandem } from "scenerystack/tandem";
import { RelatedRatesPanel } from "../common/RelatedRatesPanel.js";
import RelatedRatesNamespace from "../RelatedRatesNamespace.js";
import type { RelatedRatesPreferencesModel } from "./RelatedRatesPreferencesModel.js";

export class RelatedRatesPreferencesNode extends VBox {
  public constructor(_preferencesModel: RelatedRatesPreferencesModel, _tandem?: Tandem) {
    // Pattern for a preference control (skill: scenerystack-preferences). The dialog is
    // always white, so use the controlSurface colors, not textColorProperty.
    //
    //   const prefStrings = StringManager.getInstance().getPreferences();
    //   const showGridCheckbox = new Checkbox(
    //     preferencesModel.showGridProperty,
    //     new Text(prefStrings.showGridStringProperty, {
    //       font: new PhetFont(14),
    //       fill: RelatedRatesColors.controlSurfaceTextColorProperty,
    //     }),
    //     {
    //       // Shared slider / NumberControl / checkbox bundles live in RelatedRatesControlOptions.ts:
    //       // copy the template's src/common/*ControlOptions.ts and apply the RelatedRates prefix.
    //       checkboxColor: RelatedRatesColors.controlSurfaceTextColorProperty,
    //       checkboxColorBackground: RelatedRatesColors.controlSurfaceColorProperty,
    //       ...(tandem && { tandem: tandem.createTandem("showGridCheckbox") }),
    //     },
    //   );
    //
    // Add showGridCheckbox to the content children below.
    const content = new VBox({
      align: "left",
      spacing: 12,
      children: [],
    });
    // The empty scaffold still needs finite bounds for the Preferences focus highlight.
    if (content.children.length === 0) {
      content.localBounds = new Bounds2(0, 0, 1, 1);
    }
    // Transparent / borderless so the Preferences dialog stays visually empty.
    const panel = new RelatedRatesPanel(content, {
      fill: "transparent",
      stroke: null,
      xMargin: 0,
      yMargin: 0,
    });
    super({
      align: "left",
      spacing: 12,
      children: [panel],
    });
  }
}

RelatedRatesNamespace.register("RelatedRatesPreferencesNode", RelatedRatesPreferencesNode);
