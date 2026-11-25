import { NumberProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { ladderLength, tankHeight } from "../../RelatedRatesConstants.js";
import { TimeModel } from "../TimeModel.js";

export { ladderLength, tankHeight } from "../../RelatedRatesConstants.js";

type Scene = "rule-lab" | "conical-tank" | "sliding-ladder" | "oil-slick";
/** The relations offered on Rule Lab, between a driven variable (u or x) and y. */
export const rules = ["chain", "root", "sine", "implicit", "circle"] as const;
export type Rule = (typeof rules)[number];
export type Experiment = Rule | Exclude<Scene, "rule-lab">;
/** How the size of the linked rate changes as the measurement grows, at a fixed input rate. */
export type Trend = "larger" | "same" | "smaller";
export const coneVolume = (height: number): number => (Math.PI * height ** 3) / 12;

export const settings = {
  chain: { start: 2, min: 0.5, max: 4, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  root: { start: 1, min: 0.25, max: 6, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  sine: { start: 1, min: 0, max: 6, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  implicit: { start: 3, min: 1, max: 6, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  circle: { start: 3, min: 0, max: 4.9, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  "conical-tank": { start: 2, min: 0.5, max: tankHeight, rate: 0.75, rateMin: 0, rateMax: 5, units: " m/s" },
  // Up to x = 4.95 m the top is still 0.7 m high, where dy/dt is about 7 times dx/dt.
  "sliding-ladder": { start: 3, min: 0.5, max: 4.95, rate: 0.5, rateMin: -1, rateMax: 1, units: " m/s" },
  "oil-slick": { start: 1, min: 0.5, max: 4, rate: 1, rateMin: 0.05, rateMax: 5, units: " m/s" },
} as const;

export function dependent(kind: Experiment, size: number): number {
  switch (kind) {
    case "chain":
      return size ** 2;
    case "root":
      return Math.sqrt(size);
    case "sine":
      return Math.sin(size);
    case "implicit":
      return 12 / size;
    case "circle":
      return Math.sqrt(Math.max(0, ladderLength ** 2 - size ** 2));
    case "conical-tank":
      return size / 2;
    case "sliding-ladder":
      return Math.sqrt(ladderLength ** 2 - size ** 2);
    case "oil-slick":
      return Math.PI * size ** 2;
  }
}

/** @internal Exposed for direct checks of the differentiated equations. */
export function linkedRate(kind: Experiment, size: number, rate: number): number {
  switch (kind) {
    case "chain":
      return 2 * size * rate;
    case "root":
      return rate / (2 * Math.sqrt(size));
    case "sine":
      return Math.cos(size) * rate;
    case "implicit":
      return (-12 * rate) / size ** 2;
    case "circle":
    case "sliding-ladder":
      return (-size * rate) / dependent(kind, size);
    case "conical-tank":
      return (4 * rate) / (Math.PI * size ** 2);
    case "oil-slick":
      return rate / (2 * Math.PI * size);
  }
}

/**
 * Whether |linked rate| grows, stays put, or shrinks as the measurement increases with the
 * input rate held fixed, from the slope of |linked rate| at the current size.
 */
export function trend(kind: Experiment, size: number, rate: number): Trend {
  const { min, max } = settings[kind];
  const h = (max - min) * 1e-4;
  const low = Math.max(min, size - h);
  const high = Math.min(max, size + h);
  const magnitude = (s: number) => Math.abs(linkedRate(kind, s, rate));
  const slope = (magnitude(high) - magnitude(low)) / (high - low);
  const scale = Math.max(1e-9, magnitude(size)) / (max - min);
  return Math.abs(slope) < 1e-6 * scale || rate === 0 ? "same" : slope > 0 ? "larger" : "smaller";
}

/** @internal Exposed for direct checks of geometry and boundary timing. */
export function advance(
  kind: Experiment,
  size: number,
  rate: number,
  dt: number,
): { size: number; elapsed: number; stopped: boolean } {
  const { min, max } = settings[kind];
  const amount =
    kind === "conical-tank" ? coneVolume : kind === "oil-slick" ? (r: number) => Math.PI * r ** 2 : (x: number) => x;
  const current = amount(size);
  const proposed = current + rate * dt;
  const bounded = Math.max(amount(min), Math.min(amount(max), proposed));
  const stopped = rate > 0 ? bounded === amount(max) : rate < 0 && bounded === amount(min);
  if (stopped) {
    return {
      size: rate > 0 ? max : min,
      elapsed: Math.abs((bounded - current) / rate),
      stopped,
    };
  }
  const next =
    kind === "conical-tank"
      ? Math.cbrt((12 * bounded) / Math.PI)
      : kind === "oil-slick"
        ? Math.sqrt(bounded / Math.PI)
        : bounded;
  return { size: next, elapsed: dt, stopped };
}

/** Number of lines in every derivation: relation, differentiate, substitute, result. */
export const DERIVATION_STEPS = 4;

export class RelatedRatesModel implements TModel {
  public readonly scene: Scene;
  public readonly timer = new TimeModel();
  public readonly rule = new Property<Rule>("chain");
  public readonly sizeProperty: NumberProperty;
  public readonly rateProperty: NumberProperty;
  /** The student's prediction of how |linked rate| changes as the measurement grows. */
  public readonly prediction = new Property<Trend | null>(null);
  /** The trend at the moment of the prediction, so the verdict does not drift during play. */
  public readonly answer = new Property<Trend | null>(null);
  /** How many lines of the derivation are showing. */
  public readonly revealed = new NumberProperty(0);

  public constructor(scene: Scene) {
    this.scene = scene;
    this.sizeProperty = new NumberProperty(settings[this.kind].start);
    this.rateProperty = new NumberProperty(settings[this.kind].rate);
    this.rule.lazyLink(() => {
      this.timer.reset();
      this.prediction.reset();
      this.answer.reset();
      this.revealed.reset();
      this.sizeProperty.value = settings[this.kind].start;
      this.rateProperty.value = settings[this.kind].rate;
    });
  }

  public get kind(): Experiment {
    return this.scene === "rule-lab" ? this.rule.value : this.scene;
  }

  public get actualRate(): number {
    return linkedRate(this.kind, this.sizeProperty.value, this.rateProperty.value);
  }

  /** Records a prediction and judges it against the trend here and now. */
  public predict(guess: Trend): void {
    this.answer.value = trend(this.kind, this.sizeProperty.value, this.rateProperty.value);
    this.prediction.value = guess;
  }

  public revealStep(): void {
    this.revealed.value = Math.min(DERIVATION_STEPS, this.revealed.value + 1);
  }

  public stepOnce(dt: number): void {
    const result = advance(this.kind, this.sizeProperty.value, this.rateProperty.value, dt);
    this.sizeProperty.value = result.size;
    this.timer.advance(result.elapsed);
    if (result.stopped) {
      this.timer.isPlayingProperty.value = false;
    }
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.stepOnce(dt);
    }
  }

  public reset(): void {
    this.timer.reset();
    this.rule.reset();
    this.sizeProperty.reset();
    this.rateProperty.reset();
    this.prediction.reset();
    this.answer.reset();
    this.revealed.reset();
  }

  public dispose(): void {
    this.timer.dispose();
    this.rule.dispose();
    this.sizeProperty.dispose();
    this.rateProperty.dispose();
    this.prediction.dispose();
    this.answer.dispose();
    this.revealed.dispose();
  }
}
