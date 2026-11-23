import { RelatedRatesView } from "../../common/RelatedRatesView.js";
import type { SlidingLadderModel } from "../model/SlidingLadderModel.js";

export class SlidingLadderScreenView extends RelatedRatesView {
  public constructor(model: SlidingLadderModel) {
    super(model);
  }
}
