import { RelatedRatesView } from "../../common/RelatedRatesView.js";
import type { ConicalTankModel } from "../model/ConicalTankModel.js";

export class ConicalTankScreenView extends RelatedRatesView {
  public constructor(model: ConicalTankModel) {
    super(model);
  }
}
