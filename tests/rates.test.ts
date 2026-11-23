import { describe, expect, it } from "vitest";
import {
  advance,
  coneVolume,
  dependent,
  linkedRate,
  RelatedRatesModel,
} from "../src/common/model/RelatedRatesModel.js";

describe("related rates", () => {
  it("differentiates both Rule Lab equations with the expected sign", () => {
    expect(linkedRate("chain", 2, 0.5)).toBe(2);
    expect(linkedRate("implicit", 3, 0.5)).toBeCloseTo(-2 / 3);
    expect(linkedRate("sliding-ladder", 3, -0.5)).toBe(0.375);
  });

  it("compares two sizes at the same input rate", () => {
    expect(linkedRate("conical-tank", 1, 1) / linkedRate("conical-tank", 2, 1)).toBe(4);
    expect(linkedRate("oil-slick", 1, 1) / linkedRate("oil-slick", 2, 1)).toBe(2);
  });

  it("preserves the geometric constraints and stops at the bound", () => {
    const tank = advance("conical-tank", 2, 1, 100);
    expect(tank.size).toBe(6);
    expect(tank.elapsed).toBeCloseTo(coneVolume(6) - coneVolume(2));
    expect(tank.stopped).toBe(true);
    const ladder = advance("sliding-ladder", 3, -1, 9);
    expect(ladder.size).toBe(0.5);
    expect(ladder.elapsed).toBe(2.5);
    expect(ladder.size ** 2 + dependent("sliding-ladder", ladder.size) ** 2).toBeCloseTo(25);
    const model = new RelatedRatesModel("conical-tank");
    model.timer.isPlayingProperty.value = true;
    model.step(1000);
    expect(model.size.value).toBe(6);
    expect(model.timer.isPlayingProperty.value).toBe(false);
    model.dispose();
  });
});
