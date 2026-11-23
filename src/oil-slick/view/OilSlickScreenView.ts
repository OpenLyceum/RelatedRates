import { RelatedRatesView } from "../../common/RelatedRatesView.js";
import type { OilSlickModel } from "../model/OilSlickModel.js";

export class OilSlickScreenView extends RelatedRatesView {
  public constructor(model: OilSlickModel) {
    super(model);
  }
}
