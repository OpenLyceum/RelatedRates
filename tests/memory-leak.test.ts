/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 */

import { describe, expect, it, vi } from "vitest";
import { RelatedRatesModel } from "../src/common/model/RelatedRatesModel.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { ConicalTankModel } from "../src/conical-tank/model/ConicalTankModel.js";
import { OilSlickModel } from "../src/oil-slick/model/OilSlickModel.js";
import { RuleLabModel } from "../src/rule-lab/model/RuleLabModel.js";
import { SlidingLadderModel } from "../src/sliding-ladder/model/SlidingLadderModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "RelatedRatesModel", create: () => new RelatedRatesModel("rule-lab") },
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "RuleLabModel", create: () => new RuleLabModel() },
  { name: "ConicalTankModel", create: () => new ConicalTankModel() },
  { name: "SlidingLadderModel", create: () => new SlidingLadderModel() },
  { name: "OilSlickModel", create: () => new OilSlickModel() },
]);

describe("composed TimeModel disposal", () => {
  it("screen models dispose their owned timer", () => {
    {
      const model = new RuleLabModel();
      const spy = vi.spyOn(model.timer, "dispose");
      model.dispose();
      expect(spy).toHaveBeenCalledOnce();
    }
    {
      const model = new ConicalTankModel();
      const spy = vi.spyOn(model.timer, "dispose");
      model.dispose();
      expect(spy).toHaveBeenCalledOnce();
    }
    {
      const model = new SlidingLadderModel();
      const spy = vi.spyOn(model.timer, "dispose");
      model.dispose();
      expect(spy).toHaveBeenCalledOnce();
    }
    {
      const model = new OilSlickModel();
      const spy = vi.spyOn(model.timer, "dispose");
      model.dispose();
      expect(spy).toHaveBeenCalledOnce();
    }
  });
});
