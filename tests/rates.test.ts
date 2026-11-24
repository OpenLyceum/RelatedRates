import { describe, expect, it } from "vitest";
import {
  advance,
  coneVolume,
  dependent,
  linkedRate,
  RelatedRatesModel,
  rules,
  settings,
  trend,
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
    expect(model.sizeProperty.value).toBe(6);
    expect(model.timer.isPlayingProperty.value).toBe(false);
    model.dispose();
  });

  it("differentiates every Rule Lab relation correctly", () => {
    for (const rule of rules) {
      const { min, max } = settings[rule];
      for (const u of [min + 0.3, (min + max) / 2, max - 0.3]) {
        const h = 1e-6;
        const numeric = (dependent(rule, u + h) - dependent(rule, u - h)) / (2 * h);
        expect(linkedRate(rule, u, 0.7)).toBeCloseTo(numeric * 0.7, 6);
      }
    }
  });

  it("knows whether the linked rate speeds up or slows down", () => {
    expect(trend("conical-tank", 2, 1)).toBe("smaller");
    expect(trend("oil-slick", 2, 1)).toBe("smaller");
    expect(trend("sliding-ladder", 3, 0.5)).toBe("larger");
    expect(trend("chain", 2, 0.5)).toBe("larger");
    expect(trend("chain", 2, 0)).toBe("same");
    // |cos u| shrinks toward u = π/2 and grows past it.
    expect(trend("sine", 1, 0.5)).toBe("smaller");
    expect(trend("sine", 2, 0.5)).toBe("larger");
  });

  it("judges a prediction at the moment it is made and resets with the relation", () => {
    const model = new RelatedRatesModel("rule-lab");
    model.predict("smaller");
    expect(model.answer.value).toBe("larger");
    model.revealStep();
    model.revealStep();
    expect(model.revealed.value).toBe(2);
    model.rule.value = "implicit";
    expect(model.prediction.value).toBeNull();
    expect(model.revealed.value).toBe(0);
    expect(model.sizeProperty.value).toBe(settings.implicit.start);
    model.dispose();
  });
});
