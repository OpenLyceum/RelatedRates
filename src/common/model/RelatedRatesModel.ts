import { NumberProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../TimeModel.js";

type Scene = "rule-lab" | "conical-tank" | "sliding-ladder" | "oil-slick";
export type Experiment = "chain" | "implicit" | Exclude<Scene, "rule-lab">;
type Sign = -1 | 0 | 1;
export const ladderLength = 5;
export const tankHeight = 6;
export const coneVolume = (height: number): number => (Math.PI * height ** 3) / 12;

export const settings = {
  chain: { start: 2, min: 1, max: 4, rateProperty: 0.5, rateMin: -1, rateMax: 1, units: "" },
  implicit: { start: 3, min: 1, max: 6, rateProperty: 0.5, rateMin: -1, rateMax: 1, units: "" },
  "conical-tank": { start: 2, min: 0.5, max: tankHeight, rateProperty: 0.75, rateMin: 0, rateMax: 5, units: " m/s" },
  "sliding-ladder": { start: 3, min: 0.5, max: 4.5, rateProperty: 0.5, rateMin: -1, rateMax: 1, units: " m/s" },
  "oil-slick": { start: 1, min: 0.5, max: 4, rateProperty: 1, rateMin: 0.05, rateMax: 5, units: " m/s" },
} as const;

export function dependent(kind: Experiment, sizeProperty: number): number {
  switch (kind) {
    case "chain":
      return sizeProperty ** 2;
    case "implicit":
      return 12 / sizeProperty;
    case "conical-tank":
      return sizeProperty / 2;
    case "sliding-ladder":
      return Math.sqrt(ladderLength ** 2 - sizeProperty ** 2);
    case "oil-slick":
      return Math.PI * sizeProperty ** 2;
  }
}

/** @internal Exposed for direct checks of the differentiated equations. */
export function linkedRate(kind: Experiment, sizeProperty: number, rateProperty: number): number {
  switch (kind) {
    case "chain":
      return 2 * sizeProperty * rateProperty;
    case "implicit":
      return (-12 * rateProperty) / sizeProperty ** 2;
    case "conical-tank":
      return (4 * rateProperty) / (Math.PI * sizeProperty ** 2);
    case "sliding-ladder":
      return (-sizeProperty * rateProperty) / dependent(kind, sizeProperty);
    case "oil-slick":
      return rateProperty / (2 * Math.PI * sizeProperty);
  }
}

/** @internal Exposed for direct checks of geometry and boundary timing. */
export function advance(
  kind: Experiment,
  sizeProperty: number,
  rateProperty: number,
  dt: number,
): { sizeProperty: number; elapsed: number; stopped: boolean } {
  const { min, max } = settings[kind];
  const amount =
    kind === "conical-tank" ? coneVolume : kind === "oil-slick" ? (r: number) => Math.PI * r ** 2 : (x: number) => x;
  const current = amount(sizeProperty);
  const proposed = current + rateProperty * dt;
  const bounded = Math.max(amount(min), Math.min(amount(max), proposed));
  const stopped = rateProperty > 0 ? bounded === amount(max) : rateProperty < 0 && bounded === amount(min);
  if (stopped) {
    return {
      sizeProperty: rateProperty > 0 ? max : min,
      elapsed: Math.abs((bounded - current) / rateProperty),
      stopped,
    };
  }
  const next =
    kind === "conical-tank"
      ? Math.cbrt((12 * bounded) / Math.PI)
      : kind === "oil-slick"
        ? Math.sqrt(bounded / Math.PI)
        : bounded;
  return { sizeProperty: next, elapsed: dt, stopped };
}

export class RelatedRatesModel implements TModel {
  public readonly scene: Scene;
  public readonly timer = new TimeModel();
  public readonly rule = new Property<"chain" | "implicit">("chain");
  public readonly sizeProperty: NumberProperty;
  public readonly rateProperty: NumberProperty;
  public readonly prediction = new Property<Sign | null>(null);

  public constructor(scene: Scene) {
    this.scene = scene;
    this.sizeProperty = new NumberProperty(settings[this.kind].start);
    this.rateProperty = new NumberProperty(settings[this.kind].rateProperty);
  }

  public get kind(): Experiment {
    return this.scene === "rule-lab" ? this.rule.value : this.scene;
  }

  public get actualRate(): number {
    return linkedRate(this.kind, this.sizeProperty.value, this.rateProperty.value);
  }

  public changeRule(): void {
    this.timer.reset();
    this.prediction.reset();
    this.rule.value = this.rule.value === "chain" ? "implicit" : "chain";
    this.sizeProperty.value = settings[this.kind].start;
    this.rateProperty.value = settings[this.kind].rateProperty;
  }

  public stepOnce(dt: number): void {
    const result = advance(this.kind, this.sizeProperty.value, this.rateProperty.value, dt);
    this.sizeProperty.value = result.sizeProperty;
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
  }

  public dispose(): void {
    this.timer.dispose();
    this.rule.dispose();
    this.sizeProperty.dispose();
    this.rateProperty.dispose();
    this.prediction.dispose();
  }
}
